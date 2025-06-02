function showSection(section) {
    const sections = [
        "dashboard", "performance", "anouncements", "Teacher", "Student",
        "Grade1", "Grade2", "Grade3", "Grade4", "Grade5", "Grade6"
    ];

    // Hide all sections
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // Show the selected section
    const toShow = document.getElementById(section);
    if (toShow) toShow.style.display = "block";
}
// Toggle the dropdown menu for a section
function toggleDropdown(event, dropdownId) {
    event.preventDefault();

    // Close all dropdowns and reset their icons
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.classList.remove('active', 'open');
        const icon = btn.querySelector('.dropdown-arrow');
        if (icon) {
            icon.classList.remove('fa-angle-up');
            icon.classList.add('fa-angle-down');
        }
    });

    const btn = event.currentTarget;
    const icon = btn.querySelector('.dropdown-arrow');
    btn.classList.add('active');
    btn.classList.toggle('open');

    // Hide all other dropdowns
    document.querySelectorAll('.dropdown-content').forEach(menu => {
        if (menu.id !== dropdownId) menu.style.display = 'none';
    });

    // Toggle current dropdown open/close
    const dropdown = document.getElementById(dropdownId);
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        if (icon) {
            icon.classList.remove('fa-angle-up');
            icon.classList.add('fa-angle-down');
        }
        btn.classList.remove('open');
    } else {
        dropdown.style.display = 'block';
        if (icon) {
            icon.classList.remove('fa-angle-down');
            icon.classList.add('fa-angle-up');
        }
        btn.classList.add('open');
    }
}

// Close dropdowns when clicking outside of them
document.addEventListener('click', function (event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-content').forEach(menu => {
            menu.style.display = 'none';
        });
        document.querySelectorAll('.dropdown-btn').forEach(btn => {
            btn.classList.remove('active', 'open');
            const icon = btn.querySelector('.dropdown-arrow');
            if (icon) {
                icon.classList.remove('fa-angle-up');
                icon.classList.add('fa-angle-down');
            }
        });
    }
});

// Set sidebar link as active when clicked (main level links)
document.querySelectorAll('.sidebar > a').forEach(link => {
    link.addEventListener('click', function () {
        // Remove active from all sidebar links and buttons
        document.querySelectorAll('.sidebar a, .sidebar .dropdown-btn').forEach(l => {
            l.classList.remove('active');
        });

        // Add active to clicked link
        link.classList.add('active');

        // Close dropdowns
        document.querySelectorAll('.dropdown-content').forEach(menu => {
            menu.style.display = 'none';
        });
    });
});

// Setup announcement form logic after page is loaded
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('announcement-form');
    const titleInput = document.getElementById('announcement-title');
    const detailInput = document.getElementById('announcement-detail');
    const imagesInput = document.getElementById('announcement-images');
    const list = document.getElementById('announcement-list');
    const ANNOUNCEMENT_KEY = 'dashboard_announcements';

    // Retrieve stored announcements from localStorage
    function getAnnouncements() {
        try {
            return JSON.parse(localStorage.getItem(ANNOUNCEMENT_KEY)) || [];
        } catch {
            return [];
        }
    }

    // Save announcements to localStorage
    function saveAnnouncements(arr) {
        localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(arr));
    }

    // Render all announcements in the list
    function renderAnnouncements() {
        list.innerHTML = '';
        const announcements = getAnnouncements();
        announcements.reverse().forEach((a, idx) => {
            const item = document.createElement('div');
            item.className = 'announcement-item';

            const content = document.createElement('div');
            content.className = 'announcement-content';

            // Render images if any
            let imgHtml = '';
            if (a.images && a.images.length > 0) {
                imgHtml = `<div class="announcement-img-group">` +
                    a.images.map(src => `<img src="${src}" class="announcement-img" alt="Announcement Image">`).join('') +
                    `</div>`;
            }

            // Insert announcement content
            content.innerHTML = `
                <div class="announcement-title-text">${a.title}</div>
                ${imgHtml}
                ${a.detail ? `<div class="announcement-combined">${a.detail}</div>` : ''}
                <div class="announcement-date">${a.date}</div>`;

            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-announcement-btn';
            removeBtn.innerHTML = '<i class="fa fa-trash"></i> Remove';
            removeBtn.onclick = function () {
                const all = getAnnouncements();
                const realIdx = all.length - 1 - idx;
                all.splice(realIdx, 1);
                saveAnnouncements(all);
                renderAnnouncements();
            };

            item.appendChild(content);
            item.appendChild(removeBtn);
            list.appendChild(item);
        });
    }

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = titleInput.value.trim();
        const detail = detailInput.value.trim();

        // Basic validation
        if (!title) {
            titleInput.focus();
            titleInput.style.borderColor = "#ff4d4f";
            setTimeout(() => titleInput.style.borderColor = "", 1200);
            return;
        }

        const date = new Date().toLocaleString();
        const files = Array.from(imagesInput.files);

        // Convert selected images to Base64 if any
        if (files.length > 0) {
            let count = files.length, loaded = 0;
            const imagesB64 = [];
            files.forEach((file, i) => {
                const reader = new FileReader();
                reader.onload = function (ev) {
                    imagesB64[i] = ev.target.result;
                    loaded++;
                    if (loaded === count) {
                        saveAndRender({ title, detail, date, images: imagesB64 });
                    }
                };
                reader.readAsDataURL(file);
            });
        } else {
            saveAndRender({ title, detail, date, images: [] });
        }
    });

    // Save the new announcement and re-render the list
    function saveAndRender(obj) {
        const announcements = getAnnouncements();
        announcements.push(obj);
        saveAnnouncements(announcements);
        renderAnnouncements();
        form.reset();
    }

    // Initial render on page load
    renderAnnouncements();
});

// Dynamically load student section content if needed
async function showSection(section) {
    const sections = [
        "dashboard", "performance", "anouncements", "Teacher", "Student",
        "Grade1", "Grade2", "Grade3", "Grade4", "Grade5", "Grade6"
    ];

    // Hide all sections
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    const toShow = document.getElementById(section);
    if (toShow) {
        toShow.style.display = "block";



          // Dynamically load teacher form (if not already loaded)
        if (section === "Teacher" && !toShow.hasAttribute('data-loaded')) {
            const response = await fetch('create-teacher-form.html');
            const html = await response.text();
            toShow.innerHTML = html;
            toShow.setAttribute('data-loaded', 'true');
        }
    }
}

// Setup form submission logic for student creation
function setupStudentForm() {
    const form = document.getElementById('studentAccountForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Placeholder for account creation logic
            document.getElementById('student-result').textContent = "Account created!";
        });
    }
}

// Setup modal behavior for enrollment buttons on Grades 1-6
document.addEventListener("DOMContentLoaded", function () {
    for (let i = 1; i <= 6; i++) {
        const enrollBtn = document.getElementById('enrollBtn' + i);
        const enrollModal = document.getElementById('enrollModal' + i);
        const closeEnrollModal = document.getElementById('closeEnrollModal' + i);
        const enrollFrame = document.getElementById('enrollFrame' + i);

        if (!enrollBtn) continue;

        const ENROLL_FORM_HTML = "enrollment_form.html";

        // Open modal with iframe form
        enrollBtn.addEventListener("click", function () {
            enrollFrame.src = ENROLL_FORM_HTML;
            enrollModal.style.display = "flex";
        });

        // Close modal when close button clicked
        closeEnrollModal.addEventListener("click", function () {
            enrollModal.style.display = "none";
            enrollFrame.src = "";
        });

        // Close modal if user clicks outside the iframe
        enrollModal.addEventListener("click", function (e) {
            if (e.target === enrollModal) {
                enrollModal.style.display = "none";
                enrollFrame.src = "";
            }
        });
    }
});

function renderAnnouncements() {
    const list = document.getElementById('announcement-list');
    if (!list) return;
    list.innerHTML = '';
    const announcements = JSON.parse(localStorage.getItem('dashboard_announcements') || '[]');
    announcements.slice().reverse().forEach(a => {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        let imgHtml = '';
        if (a.images && a.images.length) {
            imgHtml = `<div class="announcement-img-group">` +
                a.images.map(src => `<img src="${src}" class="announcement-img" alt="Announcement Image">`).join('') +
                `</div>`;
        }
        item.innerHTML = `
            <div class="announcement-title-text">${a.title}</div>
            ${imgHtml}
            ${a.detail ? `<div class="announcement-combined">${a.detail}</div>` : ''}
            <div class="announcement-date">${a.date}</div>
        `;
        list.appendChild(item);
    });
}



// Initial render when dashboard loads
renderAnnouncements();

// Listen for localStorage changes (from announcement_form.html or other tabs/iframes)
window.addEventListener("storage", function (e) {
    if (e.key === "dashboard_announcements" || e.key === null) {
        renderAnnouncements();
    }
});

window.addEventListener("message", function(event) {
    if (event.data && event.data.action === "refreshAnnouncements") {
        renderAnnouncements();
    }
});


function renderAnnouncements() {
    const list = document.getElementById('announcement-list');
    if (!list) return;
    list.innerHTML = '';
    const announcements = JSON.parse(localStorage.getItem('dashboard_announcements') || '[]');
    if (announcements.length === 0) {
        list.innerHTML = `
            <div style="color:#bdbdbd; text-align:center; margin-top:40px; font-size:18px;">
                <i style="font-size:28px; opacity:.5;" class="fa fa-bullhorn"></i><br>
                No announcements yet.
            </div>`;
        return;
    }
    announcements.forEach((item, idx) => {
        // Default avatar: first letter of title (or "A")
        const avatarLetter = (item.title && item.title.length > 0) ? item.title[0].toUpperCase() : "A";
        const postedAt = item.postedAt || new Date().toISOString();

        // Comments
        let commentsHTML = '';
        if (item.comments && item.comments.length) {
            commentsHTML = `<div class="comment-list">` +
                item.comments.map(c => `
                    <div class="comment-item">
                        <div class="comment-avatar">${c.author ? c.author[0].toUpperCase() : "U"}</div>
                        <div>
                            <div class="comment-content">${c.text.replace(/\n/g, "<br>")}</div>
                            <div class="comment-meta">${c.author || "User"} &middot; ${timeAgo(c.postedAt)}</div>
                        </div>
                    </div>
                `).join('') +
                `</div>`;
        }

        const div = document.createElement('div');
        div.className = "announcement-item";
        div.innerHTML = `
            <div class="announcement-header">
                <div class="announcement-avatar">${avatarLetter}</div>
                <div class="announcement-userinfo">
                    <span class="announcement-title">${item.title}</span>
                    <span class="announcement-timestamp">${timeAgo(postedAt)}</span>
                </div>
            </div>
            <div class="announcement-details">${item.details.replace(/\n/g, "<br>")}</div>
            ${item.images && item.images.length ? `
                <div class="announcement-images-wrapper">
                    ${item.images.map(src => `<img src="${src}" class="announcement-image">`).join('')}
                </div>
            ` : ""}
            <div class="comments-section" data-post="${idx}">
                ${commentsHTML}
            </div>
        `;
        list.appendChild(div);
    });
}

// Helper function
function timeAgo(dateString) {
    const now = new Date();
    const postDate = new Date(dateString);
    const seconds = Math.floor((now - postDate) / 1000);

    if (seconds < 60) return "Just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return postDate.toLocaleDateString();
}

if (item.images && item.images.length) {
  html += `
    <div class="announcement-images-wrapper">
      <img src="${item.images[0]}" class="announcement-image">
    </div>
  `;
}

//
function updateEnrolledStudentsCount() {
    let students = JSON.parse(localStorage.getItem('enrolledStudents') || '[]');
    document.getElementById('enrolled-students').textContent = students.length;
}
document.addEventListener('DOMContentLoaded', updateEnrolledStudentsCount);
// Update in real-time if form is submitted in another tab
window.addEventListener('storage', updateEnrolledStudentsCount);

// Show excel-like record when card is clicked
document.getElementById('enrolled-students').onclick = function() {
    showEnrolledStudentsTable();
};

function showEnrolledStudentsTable() {
    let students = JSON.parse(localStorage.getItem('enrolledStudents') || '[]');
    let modal = document.createElement('div');
    modal.className = "modal-overlay";
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100vw;height:100vh;
        background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;
    `;

    let table = '<div style="background:#fff;padding:24px;max-height:80vh;overflow:auto;max-width:90vw;position:relative;">';
    table += '<button style="position:absolute;top:8px;right:8px;" onclick="this.closest(\'.modal-overlay\').remove()">Close</button>';
    table += '<h2>Enrolled Students</h2>';
    if (students.length === 0) {
        table += '<p>No enrolled students yet.</p>';
    } else {
        table += '<table border="1" cellpadding="6" style="border-collapse:collapse;"><thead><tr>';
        // Use all keys from the first student as columns
        Object.keys(students[0]).forEach(key => table += `<th>${key}</th>`);
        table += '</tr></thead><tbody>';
        students.forEach(student => {
            table += '<tr>';
            Object.keys(students[0]).forEach(key => table += `<td>${student[key] || ''}</td>`);
            table += '</tr>';
        });
        table += '</tbody></table>';
    }
    table += '</div>';
    modal.innerHTML = table;
    document.body.appendChild(modal);
}

window.addEventListener('DOMContentLoaded', function() {
    // Set hidden grade field from URL
    const params = new URLSearchParams(window.location.search);
    const grade = params.get('grade');
    if (grade) document.getElementById('gradeLevelInput').value = grade;
});

document.getElementById('enrollmentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Validate LRN
    const lrn = document.querySelector('input[name="lrn"]').value;
    if (lrn && !/^\d{12}$/.test(lrn)) {
        showResult('LRN must be a 12-digit number.', true);
        return;
    }

    // Gather all form data
    const formData = new FormData(this);
    const student = {};
    formData.forEach((value, key) => student[key] = value);

    // Save to localStorage
    let students = JSON.parse(localStorage.getItem('enrolledStudents') || '[]');
    students.push(student);
    localStorage.setItem('enrolledStudents', JSON.stringify(students));

    // Update dashboard/table live
    window.dispatchEvent(new Event('storage'));

    showResult('Enrollment form submitted successfully!');
    this.reset();
});

function showResult(msg, isError) {
    const res = document.getElementById('formResult');
    res.textContent = msg;
    res.style.color = isError ? '#d32f2f' : '#2e7d32';
}

document.addEventListener("DOMContentLoaded", function () {
    for (let i = 1; i <= 6; i++) {
        const enrollBtn = document.getElementById('enrollBtn' + i);
        const enrollModal = document.getElementById('enrollModal' + i);
        const closeEnrollModal = document.getElementById('closeEnrollModal' + i);
        const enrollFrame = document.getElementById('enrollFrame' + i);

        if (!enrollBtn) continue;

        enrollBtn.addEventListener("click", function () {
            enrollFrame.src = "enrollment_form.html?grade=" + i; // <--- THIS IS THE KEY LINE
            enrollModal.style.display = "flex";
        });

        closeEnrollModal.addEventListener("click", function () {
            enrollModal.style.display = "none";
            enrollFrame.src = "";
        });

        enrollModal.addEventListener("click", function (e) {
            if (e.target === enrollModal) {
                enrollModal.style.display = "none";
                enrollFrame.src = "";
            }
        });
    }
});