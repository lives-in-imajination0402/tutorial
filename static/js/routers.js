import home from "./components/home.js";
import addslots from "./components/addslots.js";

const routes = [
  { path: "/", component: home },
  { path: "/addslots", component: addslots },
];

const router = new VueRouter({
  routes,
});

export default router;
