const home = Vue.component("home", {
  template: `
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <span v-if="loading" class="load">
                <h4>Booking</h4>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>  
        </span>
          <p v-if="message" class="alert alert-success">{{ message }}</p>
          <p v-if="errormessage" class="alert alert-danger">{{ errormessage }}</p>
        <form @submit.prevent="submitForm" class="bg-light p-4 rounded shadow">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" v-model="name" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" class="form-control" required>
            <p v-if="isEmailBooked" style="color:red;">Email already booked</p>
          </div>
          <div class="form-group">
            <label for="slot">Select a Slot:</label>
            <select class="form-control" v-model="selectedSlot">
              <option v-for="slot in availableSlots" :key="slot">{{ slot }}</option>
            </select>
          </div>
          <div class="buttongroup">
          <button :disabled="isEmailBooked || loading" @mousedown="addDownClass" @mouseup="removeDownClass" type="submit" class="submit-button" :class="{ 'button-up': isUpClass }">Submit</button>
            <button type="reset" class="cancel-button" @mousedown="addcDownClass" @mouseup="removecDownClass" @click="reset" :class="{ 'cbutton-up': isCUpClass }">Reset</button>
          </div>
        </form>
      </div>
    </div>
  </div>
    `,
  data() {
    return {
      name: "",
      email: "",
      selectedSlot: "",
      availableSlots: [], // Replace with your actual available slots
      loading: false, // Loading state
      afterload: false,
      message: "",
      errormessage: "",
      bookedemails: [],
      isUpClass: false,
      isCUpClass: false,
    };
  },
  mounted() {
    this.slots();
    this.bookedemail();
  },
  computed: {
    isEmailBooked() {
      return this.bookedemails.includes(this.email);
    },
  },
  methods: {
    addDownClass() {
      this.isUpClass = true;
    },
    removeDownClass() {
      this.isUpClass = false;
    },
    addcDownClass() {
      this.isCUpClass = true;
    },
    removecDownClass() {
      this.isCUpClass = false;
    },
    reset() {
      location.reload();
    },
    bookedemail() {
      fetch("/bookedemails", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((data) => {
          this.bookedemails = data.emails;
        })
        .catch((err) => {
          this.errormessage = err.message;
        });
    },
    slots() {
      fetch("/slots", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((data) => {
          this.availableSlots = data.slots;
        })
        .catch((err) => {
          this.errormessage = "all slots are booked";
        });
    },
    submitForm() {
      // Perform form submission logic here
      // Remove the selected slot from the available slots
      this.loading = true; // Set loading state to true
      fetch("/email", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          selectedSlot: this.selectedSlot,
        }),
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error("Slot booking failed");
          }
        })
        .then((data) => {
          this.bookedemail();
          this.slots();
          this.name = "";
          this.email = "";
          this.selectedSlot = "";
          this.message =
            "Slot has been booked successfully! Please Check your mail!";
          setTimeout(() => {
            this.message = "";
          }, 5000);
        })
        .catch((err) => {
          this.errormessage = err.message;
          this.slots();
          this.name = "";
          this.email = "";
          this.selectedSlot = "";
          setTimeout(() => {
            this.errormessage = "";
            location.reload();
          }, 5000);
          console.error(err.message);
        })
        .finally(() => {
          this.loading = false; // Set loading state back to false after request completes
        });
    },
  },
});

export default home;
