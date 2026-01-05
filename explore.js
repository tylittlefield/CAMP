const scene = document.getElementById("scene");
const hour = new Date().getHours();

if (hour >= 7 && hour < 17) {
  scene.classList.add("day");
} else {
  scene.classList.add("night");
}
