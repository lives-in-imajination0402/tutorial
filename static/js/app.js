import router from "./routers.js";
import home from "./components/home.js";

new Vue({
  el: "#app",
  router: router,
  components: {
    home,
  },
  data: {
    message: "Hello Vue!",
  },
});
