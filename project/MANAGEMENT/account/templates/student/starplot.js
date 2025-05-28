import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/controls/OrbitControls.js';

const stats = {
  math: 80,
  science: 90,
  filipino: 60,
  mapeh: 70,
  pe: 40,
  ap: 100,
  esp: 80,
  english: 30
};

function labelToKey(label) {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fillBars(side = 'left', values = stats) {
  const statRows = document.querySelectorAll(`.stats-list.${side}-stats .stat-row`);
  statRows.forEach((row, idx) => {
    const label = row.querySelector('span')?.textContent.trim();
    if (!label) return;
    const key = labelToKey(label);
    const bar = row.querySelector(`.stat-bar-fill#${key}-${side}`);
    if (bar) {
      // Remove existing animation (if any)
      bar.style.animation = 'none';
      // Set final width CSS variable for this bar
      const fill = (values[key] ?? 0) + '%';
      bar.style.setProperty('--final-width', fill);
      bar.style.width = '0%';
      // Force reflow
      void bar.offsetWidth;
      // Add the animation, with a staggered delay
      bar.style.animation = `fillBarSlide 1.2s cubic-bezier(.7,0,.3,1) forwards`;
      bar.style.animationDelay = `${idx * 0.15}s`;
    }
  });
}

function getStatsFromDOM(side = 'left') {
  const statRows = document.querySelectorAll(`.stats-list.${side}-stats .stat-row`);
  const subjects = [];
  const statValues = {};
  statRows.forEach(row => {
    const label = row.querySelector('span')?.textContent.trim();
    if (!label) return;
    const key = labelToKey(label);
    subjects.push(key);
    statValues[key] = stats[key] ?? 0;
  });
  return { subjects, statValues };
}

function getGrade(value) {
  if (value >= 90) return "A";
  if (value >= 80) return "B";
  if (value >= 70) return "C";
  if (value >= 60) return "D";
  return "F";
}

// === ANIMATED RADAR CHART ===
let radarAnimationFrame = null;
let radarAnimStart = null;
let radarAnimDuration = 3000; // ms

function easeOutBack(t) {
  // Easing function for a little bounce
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

let lastDotIndex = -1;
function animateRadarChart(ctx, subjects, statValues) {
  const N = subjects.length;
  const max = 100;
  const size = ctx.canvas.width;
  const cx = size / 2, cy = size / 2, r = size * 0.30;

  // Store dot positions for tooltip and interaction
  window.radarDotPositions = [];

  function render(progress) {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);

    // Draw grid (static, not animated)
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
    ctx.strokeStyle = "#00f0ff44";
    ctx.lineWidth = 1;
    for (let i = 0; i < N; i++) {
      let angle = (Math.PI * 2 / N) * i - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      ctx.stroke();
    }

    // Draw polygon (animates out)
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      let angle = (Math.PI * 2 / N) * i - Math.PI / 2;
      let value = statValues[subjects[i]] ?? 0;
      let animValue = value * progress;
      let rr = r * (animValue / max);
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

    // Dots (animated out)
    for (let i = 0; i < N; i++) {
      let angle = (Math.PI * 2 / N) * i - Math.PI / 2;
      let value = statValues[subjects[i]] ?? 0;
      let animValue = value * progress;
      let rr = r * (animValue / max);
      let x = Math.cos(angle) * rr;
      let y = Math.sin(angle) * rr;
      // Save for tooltip logic
      window.radarDotPositions[i] = { x: cx + x, y: cy + y, value, i, subject: subjects[i] };

      // Animate dot scale (pop)
      let dotProgress = easeOutBack(progress);
      let dotRadius = size * 0.005 * dotProgress;

      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = Math.max(0.7, progress); // Fade in
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label (static position; could animate in as well)
      ctx.font = `bold ${Math.round(size*0.04)}px Montserrat, Arial`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let lx = Math.cos(angle) * (r + size*0.072);
      let ly = Math.sin(angle) * (r + size*0.072);
      ctx.fillText(subjects[i].toUpperCase(), lx, ly);
    }
    ctx.restore();
  }

  // Animation loop
  function animateDotFrame(ts) {
    if (!radarAnimStart) radarAnimStart = ts;
    let elapsed = ts - radarAnimStart;
    let progress = Math.min(1, elapsed / radarAnimDuration);
    progress = easeOutBack(progress);
    render(progress);
    if (progress < 1) {
      radarAnimationFrame = requestAnimationFrame(animateDotFrame);
    } else {
      radarAnimStart = null;
      radarAnimationFrame = null;
    }
  }

  // Start animation
  if (radarAnimationFrame) cancelAnimationFrame(radarAnimationFrame);
  radarAnimStart = null;
  radarAnimationFrame = requestAnimationFrame(animateDotFrame);
}

function setupRadarTooltip(subjects, statValues) {
  const canvas = document.getElementById('radar');
  const tooltip = document.getElementById('radar-tooltip');
  const size = canvas.width;
  const dotRadius = size * 0.03;

  canvas.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = false;

    if (window.radarDotPositions) {
      for (let i = 0; i < window.radarDotPositions.length; i++) {
        const dot = window.radarDotPositions[i];
        const dx = mx - dot.x;
        const dy = my - dot.y;
        if (Math.sqrt(dx*dx + dy*dy) < dotRadius + 2) {
          found = true;
          if (lastDotIndex !== i) {
            tooltip.style.display = "block";
            tooltip.innerHTML = `
              <b>${dot.subject.toUpperCase()}</b><br>
              Performance: <b>${dot.value}</b><br>
              Grade: <b>${getGrade(dot.value)}</b>
            `;
          }
          // Place tooltip smartly (avoid offscreen)
          let tooltipX = dot.x + 18, tooltipY = dot.y - 18;
          tooltip.style.left = tooltipX + "px";
          tooltip.style.top = tooltipY + "px";
          lastDotIndex = i;
          break;
        }
      }
    }
    if (!found) {
      tooltip.style.display = "none";
      lastDotIndex = -1;
    }
  };
  canvas.onmouseleave = function() {
    tooltip.style.display = "none";
    lastDotIndex = -1;
  }
}

window.onload = function () {
  fillBars('left', stats);
  const { subjects, statValues } = getStatsFromDOM('left');
  document.querySelector('.radar-container').style.position = "relative";
  document.getElementById('radar').style.display = "block";
  document.getElementById('radar').style.position = "relative";
  const canvas = document.getElementById('radar');
  const ctx = canvas.getContext('2d');
  animateRadarChart(ctx, subjects, statValues); // Use animated radar!
  setupRadarTooltip(subjects, statValues);
  init3DAvatar();
};

// --- 3D AVATAR BG with ENTRANCE ANIMATION ---
export function init3DAvatar() {
  const bgDiv = document.getElementById('avatar-3d-bg');
  bgDiv.innerHTML = '';

  const width = window.innerWidth * 0.25;
  const height = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  bgDiv.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera.position.set(-2, 1.7, 4);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.5;
  controls.maxDistance = 4.5;
  controls.minPolarAngle = 0.4;
  controls.maxPolarAngle = 1.6;
  controls.autoRotate = false;
  controls.target.set(-2, 1.1, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const spotLight = new THREE.SpotLight(0xffffff, 1.5, 30, Math.PI/6, 1);
  spotLight.position.set(0, 14, 7);
  spotLight.castShadow = true;
  spotLight.shadow.bias = -0.0001;
  scene.add(spotLight);

  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  groundGeometry.rotateX(-Math.PI / 2);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x232c58,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.2,
    transparent: true,
    opacity: 0,
  });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.castShadow = false;
  groundMesh.receiveShadow = true;
  groundMesh.position.y = 0;
  groundMesh.position.x = -2;
  scene.add(groundMesh);

  // Animation variables
  let avatarMesh = null;
  let clock = new THREE.Clock();
  let avatarLoadedTime = null;
  const entranceDuration = 1.2; // seconds
  let avatarEntranceFinished = false;
  let finalY = 0; // Will be set after model is loaded
  let startY = 0; // Initial Y position for entrance

  // Helper to set opacity recursively on all mesh materials
  function setMeshOpacity(mesh, opacity) {
    mesh.traverse(child => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.transparent = true;
            mat.opacity = opacity;
            mat.needsUpdate = true;
          });
        } else {
          child.material.transparent = true;
          child.material.opacity = opacity;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  // Load GLB Model
  const loader = new GLTFLoader();
  loader.load('avatar.glb', (gltf) => {
    avatarMesh = gltf.scene;
    let box = new THREE.Box3().setFromObject(avatarMesh);
    let size = box.getSize(new THREE.Vector3());
    let center = box.getCenter(new THREE.Vector3());
    avatarMesh.position.sub(center);
    avatarMesh.position.y += size.y / 1.78;
    avatarMesh.position.x = -2;
    

    let maxDim = Math.max(size.x, size.y, size.z);
    let scale = 2.3 / maxDim;
    avatarMesh.scale.setScalar(scale);

    avatarMesh.rotation.y = Math.PI / 6;

    // --- Animate from below and invisible ---
    finalY = avatarMesh.position.y;
    startY = finalY - 0.7;      // Start slightly below
    avatarMesh.position.y = startY;
    setMeshOpacity(avatarMesh, 0);

    avatarMesh.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(avatarMesh);

    avatarLoadedTime = clock.getElapsedTime();
    avatarEntranceFinished = false;
  }, undefined, (error) => {
    alert("Error loading avatar.glb: " + error.message);
    console.error("Error loading GLTF:", error);
  });

  window.addEventListener('resize', () => {
    const w = window.innerWidth * 0.25;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Entrance animation
    if (avatarMesh && avatarLoadedTime !== null && !avatarEntranceFinished) {
      const t = Math.min(
        (clock.getElapsedTime() - avatarLoadedTime) / entranceDuration,
        1
      );
      const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1; // cubic ease out

      // Animate Y position and opacity
      avatarMesh.position.y = startY + (finalY - startY) * ease;
      setMeshOpacity(avatarMesh, ease);

      if (t >= 1) {
        avatarEntranceFinished = true;
      }
    }

    // After entrance: breathing & sway
    if (avatarMesh && avatarEntranceFinished) {
      const time = clock.getElapsedTime();
      avatarMesh.rotation.y = Math.PI / 6 + Math.sin(time * 0.7) * 0.18;
      avatarMesh.position.y = finalY + Math.sin(time * 1.3) * 0.05;
      setMeshOpacity(avatarMesh, 1); // Ensure full opacity
    }

    renderer.render(scene, camera);
  }
  animate();
}