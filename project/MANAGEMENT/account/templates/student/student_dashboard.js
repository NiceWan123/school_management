const hamburgerBtn = document.getElementById('hamburgerBtn');
const sideNav = document.getElementById('sideNav');
const dashboardHeader = document.getElementById('dashboardHeader');

function openMenu() {
  sideNav.classList.add('open');
  hamburgerBtn.classList.add('active');
  dashboardHeader.classList.add('hide');
}
function closeMenu() {
  sideNav.classList.remove('open');
  hamburgerBtn.classList.remove('active');
  dashboardHeader.classList.remove('hide');
}

// Toggle sidebar on hamburger click or hover
['click', 'mouseenter'].forEach(evt =>
  hamburgerBtn.addEventListener(evt, () => {
    if (!sideNav.classList.contains('open')) openMenu();
  })
);
// Close when mouse leaves sidebar
sideNav.addEventListener('mouseleave', closeMenu);

// Optionally, close sidebar when a nav link is clicked (on mobile)
document.querySelectorAll('.half-nav-menu .nav-item').forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

// Close sidebar when clicking outside (optional)
document.addEventListener('click', (e) => {
  if (
    sideNav.classList.contains('open') &&
    !sideNav.contains(e.target) &&
    !hamburgerBtn.contains(e.target)
  ) {
    closeMenu();
  }
});

// --- Radar/Starplot Chart Demo ---
// Define your stat data here:
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

function getGrade(value) {
  if (value >= 90) return "A";
  if (value >= 80) return "B";
  if (value >= 70) return "C";
  if (value >= 60) return "D";
  return "F";
}

function animateRadarChart(ctx, subjects, statValues) {
  // Animation setup
  let animationFrame, animStart = null;
  const duration = 2000; // ms
  const N = subjects.length;
  const max = 100;
  const size = ctx.canvas.width;
  const cx = size / 2, cy = size / 2, r = size * 0.32;
  window.radarDotPositions = [];

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function render(progress) {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);

    // Draw grid
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

    // Draw animated polygon
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

    // Dots and labels
    for (let i = 0; i < N; i++) {
      let angle = (Math.PI * 2 / N) * i - Math.PI / 2;
      let value = statValues[subjects[i]] ?? 0;
      let animValue = value * progress;
      let rr = r * (animValue / max);
      let x = Math.cos(angle) * rr;
      let y = Math.sin(angle) * rr;
      window.radarDotPositions[i] = { x: cx + x, y: cy + y, value, i, subject: subjects[i] };

      // Dot (smaller, as requested)
      let dotProgress = easeOutBack(progress);
      let dotRadius = size * 0.007 * dotProgress;
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = Math.max(0.7, progress);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Subject label (further from the radar)
      ctx.font = `bold ${Math.round(size*0.045)}px Montserrat, Arial`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let lx = Math.cos(angle) * (r + size*0.12); // increased from size*0.07 to size*0.12
      let ly = Math.sin(angle) * (r + size*0.06);
      ctx.fillText(subjects[i].toUpperCase(), lx, ly);
    }
    ctx.restore();
  }

  function loop(ts) {
    if (!animStart) animStart = ts;
    let elapsed = ts - animStart;
    let progress = Math.min(1, elapsed / duration);
    progress = easeOutBack(progress);
    render(progress);
    if (progress < 1) {
      animationFrame = requestAnimationFrame(loop);
    }
  }
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animStart = null;
  animationFrame = requestAnimationFrame(loop);
}

function setupRadarTooltip(subjects, statValues) {
  const canvas = document.getElementById('radar');
  const tooltip = document.getElementById('radar-tooltip');
  const size = canvas.width;
  const dotRadius = size * 0.014;

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
        if (Math.sqrt(dx*dx + dy*dy) < dotRadius + 3) {
          found = true;
          tooltip.style.display = "block";
          tooltip.innerHTML = `
            <b>${dot.subject.toUpperCase()}</b><br>
            Performance: <b>${dot.value}</b><br>
            Grade: <b>${getGrade(dot.value)}</b>
          `;
          let tooltipX = dot.x + 500, tooltipY = dot.y - 100; // closer to the dot
          tooltip.style.left = tooltipX + "px";
          tooltip.style.top = tooltipY + "px";
          break;
        }
      }
    }
    if (!found) {
      tooltip.style.display = "none";
    }
  };
  canvas.onmouseleave = function() {
    tooltip.style.display = "none";
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const subjects = Object.keys(stats);
  const statValues = stats;
  const canvas = document.getElementById('radar');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    animateRadarChart(ctx, subjects, statValues);
    setupRadarTooltip(subjects, statValues);
  }
});

// Announcement auto-rotation logic with dots
const announcements = [
  "No announcements yet.",
  "🎉 Welcome to the Cyberpunk Dashboard!",
  "✨ New feature: Dynamic calendar is live.",
  "🚧 Maintenance scheduled for Friday night.",
];
let currentAnnouncement = 0;
const annContent = document.getElementById("announcement-content");
const annDots = document.getElementById("announcement-dots");
let annInterval = null;

function renderAnnouncement(idx) {
  annContent.textContent = announcements[idx];
  // Update dots
  if (annDots) {
    annDots.innerHTML = "";
    for (let i = 0; i < announcements.length; i++) {
      const dot = document.createElement("div");
      dot.className = "announcement-dot" + (i === idx ? " active" : "");
      dot.addEventListener("click", () => {
        stopAnnouncementRotation();
        currentAnnouncement = i;
        renderAnnouncement(currentAnnouncement);
        startAnnouncementRotation();
      });
      annDots.appendChild(dot);
    }
  }
}

function showNextAnnouncement() {
  currentAnnouncement = (currentAnnouncement + 1) % announcements.length;
  renderAnnouncement(currentAnnouncement);
}

function startAnnouncementRotation() {
  annInterval = setInterval(showNextAnnouncement, 4000);
}
function stopAnnouncementRotation() {
  if (annInterval) {
    clearInterval(annInterval);
    annInterval = null;
  }
}

renderAnnouncement(currentAnnouncement);
startAnnouncementRotation();

// CYBERPUNK FLATPICKR WITH YEAR POPUP
const fp = flatpickr("#calendar", {
  inline: true,
  defaultDate: "today",
  dateFormat: "Y-m-d",
  disableMobile: true,
  allowInput: false,
  prevArrow: "<span style='color: #00e4ff'>&lt;</span>",
  nextArrow: "<span style='color: #00e4ff'>&gt;</span>",
});

const calendarContainer = document.querySelector('.calendar-container');
const yearPopup = document.getElementById('yearPopup');

// Helper: Get years range (from current year +3 to 20 years ago)
function getYearRange() {
  const now = new Date().getFullYear();
  const oldest = now - 20;
  const latest = now + 3;
  let range = [];
  for (let y = latest; y >= oldest; y--) {
    range.push(y);
  }
  return range;
}

// Generate year options (scrollable)
function populateYearOptions(selectedYear) {
  yearPopup.innerHTML = '';
  const range = getYearRange();
  range.forEach(y => {
    const yearDiv = document.createElement('div');
    yearDiv.className = 'year-option' + (y === selectedYear ? ' selected' : '');
    yearDiv.textContent = y;
    yearDiv.addEventListener('click', function() {
      fp.changeYear(y);
      yearPopup.classList.remove('active');
    });
    yearPopup.appendChild(yearDiv);
  });

  // Scroll to selected year
  setTimeout(() => {
    const selected = yearPopup.querySelector('.year-option.selected');
    if (selected) {
      yearPopup.scrollTop = selected.offsetTop - yearPopup.clientHeight / 2 + selected.clientHeight / 2;
    }
  }, 0);
}

// Show popup when clicking year input
function enableYearPopup() {
  setTimeout(() => {
    const yearInput = document.querySelector('.flatpickr-current-month input.cur-year');
    if (!yearInput) return;
    yearInput.readOnly = true;
    yearInput.style.cursor = 'pointer';

    // Remove up/down nav arrows if present (fail-safe)
    const upArrow = yearInput.parentNode.querySelector('.arrowUp');
    const downArrow = yearInput.parentNode.querySelector('.arrowDown');
    if (upArrow) upArrow.style.display = 'none';
    if (downArrow) downArrow.style.display = 'none';

    yearInput.addEventListener('keydown', function(e) {
      e.preventDefault();
      return false;
    });

    yearInput.addEventListener('input', function(e) {
      e.target.value = fp.currentYear;
    });

    yearInput.addEventListener('click', function(e) {
      e.stopPropagation();
      populateYearOptions(parseInt(yearInput.value, 10));
      // Position popup under the input (centered)
      const rect = yearInput.getBoundingClientRect();
      const contRect = calendarContainer.getBoundingClientRect();
      yearPopup.style.top = (rect.bottom - contRect.top + 4) + 'px';
      yearPopup.style.left = (rect.left - contRect.left + rect.width / 2 - 60) + 'px';
      yearPopup.classList.add('active');
    });

    // Hide popup on outside click
    document.addEventListener('click', function(e) {
      if (!yearPopup.contains(e.target) && e.target !== yearInput) {
        yearPopup.classList.remove('active');
      }
    });
  }, 100);
}

// Initialize popup every time calendar is opened or ready
fp.config.onReady.push(enableYearPopup);
fp.config.onMonthChange.push(enableYearPopup);
fp.config.onYearChange.push(enableYearPopup);

const saved = localStorage.getItem('studentPhoto');
if (saved) document.getElementById('avatar-img').src = saved;

document.getElementById('photoInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(ev) {
    // ev.target.result is an ArrayBuffer (if readAsArrayBuffer is used)
    const arrayBuffer = ev.target.result;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false; // RapidAPI may not require cookies
    xhr.open('POST', 'https://image-background-remover-api.p.rapidapi.com/remove-bg');

    xhr.setRequestHeader('x-rapidapi-key', '55d79b2ef5mshf718267ae11fcc5p189225jsn61ea8a80d030');
    xhr.setRequestHeader('x-rapidapi-host', 'image-background-remover-api.p.rapidapi.com');
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    xhr.responseType = 'blob';

    xhr.onload = function() {
      if (xhr.status === 200) {
        // Update the image with the returned blob
        const url = URL.createObjectURL(xhr.response);
        document.getElementById('avatar-img').src = url;
        // Optionally save to localStorage:
        const reader2 = new FileReader();
        reader2.onload = function(e2) {
          localStorage.setItem('studentPhoto', e2.target.result);
        };
        reader2.readAsDataURL(xhr.response);
      } else {
        alert('Background removal failed: ' + xhr.statusText);
      }
    };

    xhr.onerror = function() {
      alert('Network error contacting background remover!');
    };

    xhr.send(arrayBuffer);
  };
  reader.readAsArrayBuffer(file);
});

xhr.onload = function() {
  if (xhr.status === 200) {
    // ... (success code)
  } else {
    // Inspect error details
    xhr.responseType = 'text';
    alert('Background removal failed: ' + xhr.status + '\n' + xhr.responseText);
    console.error(xhr.responseText);
  }
};