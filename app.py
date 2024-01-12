from flask import Flask, render_template, request, jsonify,make_response,redirect,url_for
from jinja2 import Template
from flask_sqlalchemy import SQLAlchemy
from werkzeug.exceptions import HTTPException
from application.email import send_email_user
import os


app = Flask(__name__)
connection_string = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_DATABASE_URI'] = "mssql+pyodbc:///?odbc_connect=%s" % connection_string
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


app.app_context().push()


class Slots(db.Model):
    id = db.Column('slot_id', db.Integer, primary_key=True, autoincrement=True)
    slot = db.Column(db.String(100))


class Emails(db.Model):
    id = db.Column('email_id', db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100))
    selected_slot = db.Column(db.String(100))

class NotFoundError(HTTPException):
    def __init__(self, status_code, message="NOT FOUND"):
        if status_code == 409:
            message = "already exists"
        if status_code == 404:
            message = "NOT FOUND"
        self.response = make_response(jsonify(message), status_code)
        self.response.headers['Content-Type'] = 'application/json'


class NotGivenError(HTTPException):
    def __init__(self, status_code, error_code, error_message):
        message = {"error_code": error_code, "error_message": error_message}
        self.response = make_response(jsonify(message), status_code)
        self.response.headers['Content-Type'] = 'application/json'



@app.route('/')
def index():
    return render_template('index.html')


@app.route('/addslots')
def add_slots():
    slotsdata = Slots.query.all()
    for i in slotsdata:
        db.session.delete(i)
        db.session.commit()

    slots = ["Wednesday 6pm-6.30pm", "Wednesday 6.30pm-7pm", "Wednesday 7pm-7.30pm", "Wednesday 7.30pm-8pm", "Wednesday 8pm-8.30pm", "Wednesday 8.30pm-9pm", "Wednesday 9pm-9.30pm", "Wednesday 9.30pm-10pm"]
    for slot in slots:
        slot = Slots(slot=slot)
        db.session.add(slot)
        db.session.commit()

    email=Emails.query.all()
    for i in email:
        db.session.delete(i)
        db.session.commit()
    return jsonify({"message": "slots added successfully"})



@app.route('/slots', methods=['GET'])
def slots():
    slots = Slots.query.all()

    slots = [slot.slot for slot in slots]
    if slots==[]:
        raise NotFoundError(status_code=404, message="slots not found")

    return jsonify({"slots": slots})


@app.route("/email", methods=["GET", "POST"])
def send_email():
    post_data = request.get_json()
    name = post_data["name"]
    email = post_data["email"]
    selected_slot = post_data["selectedSlot"]

    if not name:
        raise NotGivenError(400, "name_not_given", "name not given")
    if not email:
        raise NotGivenError(400, "email_not_given", "email not given")
    if not selected_slot:
        raise NotGivenError(400, "selected_slot_not_given", "selected slot not given")
    
    if Emails.query.filter_by(email=email).first():
        raise NotFoundError(status_code=409, message="already exists")

    if Slots.query.filter_by(slot=selected_slot).first():

        with open('templates/usermail.html') as file_:
            template = Template(file_.read())
            message = template.render(name=name, slot_time=selected_slot, email=email)

        send_email_user(
            to=email,
            sub="Slot Booking Alert",
            message=message
        )
        emails = Emails(email=email, selected_slot=selected_slot)
        db.session.add(emails)
        db.session.commit()

        slot=Slots.query.filter_by(slot=selected_slot).first()
        db.session.delete(slot)
        db.session.commit()

        return jsonify({"message": "email sent successfully"})
    else:
        return jsonify({"error": "Selected slot not found"})


@app.route("/bookedemails", methods=["GET"])
def booked_emails():
    emails = Emails.query.all()

    emails = [email.email for email in emails]

    return jsonify({"emails": emails})



if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)