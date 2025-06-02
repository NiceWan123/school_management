function getAnnouncements() {
  return JSON.parse(localStorage.getItem("announcements") || "[]");
}
function saveAnnouncements(list) {
  localStorage.setItem("announcements", JSON.stringify(list));
}
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

// ------- Image Preview Before Post -------
let selectedImages = [];
let selectedImageFiles = [];
const imageInput = document.getElementById('imageInput');
const previewImagesDiv = document.getElementById('previewImages');

imageInput.addEventListener('change', function() {
  selectedImageFiles = Array.from(this.files);
  updateImagePreviews();
});

function updateImagePreviews() {
  previewImagesDiv.innerHTML = '';
  selectedImages = [];
  selectedImageFiles.forEach((file, idx) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      selectedImages[idx] = e.target.result;
      const wrapper = document.createElement('div');
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      wrapper.innerHTML = `
        <img src="${e.target.result}" class="preview-image">
        <button class="remove-preview-img" data-idx="${idx}" title="Remove">&times;</button>
      `;
      previewImagesDiv.appendChild(wrapper);
      wrapper.querySelector('.remove-preview-img').onclick = function(ev) {
        ev.preventDefault();
        selectedImageFiles.splice(idx, 1);
        updateImagePreviews();
        // Reset input for re-upload
        imageInput.value = '';
      };
    };
    reader.readAsDataURL(file);
  });
}

// ------- Announcement CRUD -------
function renderAnnouncements() {
  const list = getAnnouncements();
  const container = document.getElementById('announcementList');
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = `
      <div style="color:#bdbdbd; text-align:center; margin-top:40px; font-size:18px;">
        <i style="font-size:28px; opacity:.5;" class="fa fa-bullhorn"></i><br>
        No announcements yet.
      </div>`;
    return;
  }
  list.forEach((item, idx) => {
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
      <button class="remove-btn" data-index="${idx}">Remove</button>
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
        <form class="comment-form" autocomplete="off">
          <input type="text" class="comment-author" placeholder="Name..." maxlength="20" style="width:90px;">
          <input type="text" class="comment-input" placeholder="Write a comment..." maxlength="120" required>
          <button type="submit" title="Post Comment"><i class="fa fa-paper-plane"></i></button>
        </form>
      </div>
    `;
    container.appendChild(div);

    // Attach comment form handler
    const commentForm = div.querySelector('.comment-form');
    commentForm.onsubmit = function(e) {
      e.preventDefault();
      const author = commentForm.querySelector('.comment-author').value.trim() || "User";
      const text = commentForm.querySelector('.comment-input').value.trim();
      if (!text) return;
      addComment(idx, author, text);
      commentForm.reset();
    };
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = function() {
      const index = parseInt(this.getAttribute('data-index'), 10);
      removeAnnouncement(index);
    }
  });
}

function removeAnnouncement(idx) {
  const list = getAnnouncements();
  list.splice(idx, 1);
  saveAnnouncements(list);
  renderAnnouncements();
}

document.getElementById('postAnnouncement').onsubmit = async function(e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const details = document.getElementById('details').value.trim();
  const images = await handleImages();
  const newAnnouncement = {
    title,
    details,
    images,
    postedAt: new Date().toISOString(),
    comments: []
  };
  const list = getAnnouncements();
  list.unshift(newAnnouncement);
  saveAnnouncements(list);
  renderAnnouncements();
  this.reset();
  selectedImages = [];
  selectedImageFiles = [];
  previewImagesDiv.innerHTML = '';

  if (window.parent && window.parent !== window) {
    window.parent.postMessage("announcementPosted", "*");
  }
};

async function handleImages() {
  // Use selectedImageFiles instead of image input directly
  const images = [];
  for (const file of selectedImageFiles) {
    if (!file.type.startsWith("image/")) continue;
    const dataUrl = await new Promise((res) => {
      const reader = new FileReader();
      reader.onload = e => res(e.target.result);
      reader.readAsDataURL(file);
    });
    images.push(dataUrl);
  }
  return images;
}

// -------- COMMENT LOGIC --------
function addComment(postIdx, author, text) {
  const list = getAnnouncements();
  if (!list[postIdx].comments) list[postIdx].comments = [];
  list[postIdx].comments.push({
    author,
    text,
    postedAt: new Date().toISOString()
  });
  saveAnnouncements(list);
  renderAnnouncements();
}

renderAnnouncements();


function getAnnouncements() {
    try {
        return JSON.parse(localStorage.getItem("dashboard_announcements")) || [];
    } catch {
        return [];
    }
}
function saveAnnouncements(arr) {
    localStorage.setItem("dashboard_announcements", JSON.stringify(arr));
}

// After announcement is posted:
function saveAndRender(obj) {
    const announcements = getAnnouncements();
    announcements.push(obj);
    saveAnnouncements(announcements);

    // Optionally, to trigger the dashboard to update instantly (if form is in another tab/iframe):
    window.dispatchEvent(new Event("storage"));
    // ...reset form, re-render local list, etc...
}

