import { createApp } from "vue";
import Game from "./Game.vue";
// import Keyboard from "./Keyboard.vue";
import "./game.css";

// resize for scaling the board size
window.addEventListener("resize", onResize);
// set size on startup
onResize();

function onResize() {
  // get actual vh on mobile
  document.body.style.setProperty("--vh", window.innerHeight + "px");
}

createApp(Game).mount("#app");
// createApp(Keyboard).mount("#app");
