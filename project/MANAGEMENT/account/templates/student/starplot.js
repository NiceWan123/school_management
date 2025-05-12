// Dummy data for stats (0-100)
const stats = {
  math: 80,
  science: 90,
  filipino: 60,
  mapeh: 70,
};

// Fill stat bars
function fillBars(side) {
  document.getElementById('math-' + side).style.width = stats.math + '%';
  document.getElementById('science-' + side).style.width = stats.science + '%';
  document.getElementById('filipino-' + side).style.width = stats.filipino + '%';
  document.getElementById('mapeh-' + side).style.width = stats.mapeh + '%';
}
fillBars('left');
fillBars('right');

// Radar chart drawing
function drawRadarChart(ctx, stats) {
  const values = [stats.math, stats.science, stats.filipino, stats.mapeh];
  const N = 4;
  const max = 100;
  const cx = 125, cy = 125, r = 100;

  // Draw grid
  ctx.save();
  ctx.translate(cx, cy);

  ctx.strokeStyle = "#00f0ff80";
  ctx.lineWidth = 2;
  for (let level = 1; level <= 4; level++) {
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      let angle = (Math.PI * 2 / N) * i - Math.PI / 2;
      let rr = r * (level / 4);
      let x = Math.cos(angle) * rr;
      let y = Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = "#00f0ff44";
  ctx.lineWidth = 1;
  for (let i = 0; i < N; i++) {
    let angle = (Math.PI * 2 / N) * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    ctx.stroke();
  }

  // Draw radar polygon
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    let angle = (Math.PI * 2 / N) * i - Math.PI / 2;
    let rr = r * (values[i] / max);
    let x = Math.cos(angle) * rr;
    let y = Math.sin(angle) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#00f0ff55";
  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // Draw points
  for (let i = 0; i < N; i++) {
    let angle = (Math.PI * 2 / N) * i - Math.PI / 2;
    let rr = r * (values[i] / max);
    let x = Math.cos(angle) * rr;
    let y = Math.sin(angle) * rr;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

// Draw radar chart on page load
window.onload = function () {
  const canvas = document.getElementById('radar');
  const ctx = canvas.getContext('2d');
  drawRadarChart(ctx, stats);

  // 3D Avatar Loader logic
  init3DAvatar();
};

function init3DAvatar() {
  const wrapper = document.getElementById('avatar-canvas-wrapper');
  wrapper.innerHTML = '';

  const width = wrapper.offsetWidth;
  const height = wrapper.offsetHeight;

  const scene = new THREE.Scene();
  scene.background = null;

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(0, 200, 100);
  scene.add(dirLight);

  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
  camera.position.set(0, 1.3, 3);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0); // transparent background
  wrapper.appendChild(renderer.domElement);

  let model = null;

  // FIXED: Correct extension for glTF file
  const glbUrl = "avatar.gltf"; // or "avatar.glb"

  // FIXED: Correct GLTFLoader usage for r150+
  const loader = new GLTFLoader();
  loader.load(glbUrl, function (gltf) {
    model = gltf.scene;
    // Center and scale the model nicely
    let box = new THREE.Box3().setFromObject(model);
    let size = box.getSize(new THREE.Vector3());
    let center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); // Center
    let maxDim = Math.max(size.x, size.y, size.z);
    let scale = 1.2 / maxDim; // fit into view
    model.scale.setScalar(scale);
    scene.add(model);
  }, undefined, function (error) {
    alert("Error loading avatar.gltf: " + error.message);
    console.error("Error loading GLTF:", error);
  });

  function animate() {
    requestAnimationFrame(animate);
    if (model) {
      model.rotation.y += 0.012; // gentle rotate
    }
    renderer.render(scene, camera);
  }
  animate();
}