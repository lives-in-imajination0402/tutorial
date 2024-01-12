const addslots = Vue.component("addslots", {
  template: `
    <div class="container">
      <div style="margin-top:100px;" class="container">
      <h5 v-if="message" class="alert alert-success">{{ message }}</h5>
      <h5 v-if="errormessage" class="alert alert-danger">{{ errormessage }}</h5>
      </div>
    </div>
    `,
  data() {
    return {
      message: "",
      errormessage: "",
    };
  },
  mounted() {
    this.addslots();
  },
  methods: {
    addslots() {
      fetch("/addslots", {
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
          this.message = data.message;
          setTimeout(() => {
            this.message = "";
            this.$router.push("/");
            location.reload();
          }, 5000);
        })
        .catch((err) => {
          this.errormessage = err.message;
        });
    },
  },
});

export default addslots;
