/* ============================================
   MY BODY, MY CARE - Admin Dashboard JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  loadDashboard();
});

// ========== Section Navigation ==========
function showSection(sectionId, linkEl) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(function (s) {
    s.classList.remove('active');
  });

  // Show target section
  var target = document.getElementById('section-' + sectionId);
  if (target) target.classList.add('active');

  // Update nav links
  document.querySelectorAll('.admin-nav a').forEach(function (a) {
    a.classList.remove('active');
  });
  if (linkEl) linkEl.classList.add('active');

  // Close sidebar on mobile
  var sidebar = document.getElementById('adminSidebar');
  if (sidebar) sidebar.classList.remove('open');
}

function toggleSidebar() {
  var sidebar = document.getElementById('adminSidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ========== Load Dashboard Data ==========
function loadDashboard() {
  loadStats();
  loadNewsList();
  loadGalleryList();
  loadTeamList();
  loadMessages();
}

// ========== Statistics ==========
function loadStats() {
  var stats = JSON.parse(localStorage.getItem('mbmc_stats') || '{"girlsEducated":100,"kitsDistributed":100,"schoolsVisited":3,"healthcarePros":3}');

  document.getElementById('input-girls').value = stats.girlsEducated || 100;
  document.getElementById('input-kits').value = stats.kitsDistributed || 100;
  document.getElementById('input-schools').value = stats.schoolsVisited || 3;
  document.getElementById('input-healthcare').value = stats.healthcarePros || 3;

  document.getElementById('stat-girls').textContent = stats.girlsEducated || 100;
  document.getElementById('stat-kits').textContent = stats.kitsDistributed || 100;
  document.getElementById('stat-schools').textContent = stats.schoolsVisited || 3;
  document.getElementById('stat-healthcare').textContent = stats.healthcarePros || 3;
}

function saveStats(e) {
  e.preventDefault();
  var stats = {
    girlsEducated: parseInt(document.getElementById('input-girls').value) || 0,
    kitsDistributed: parseInt(document.getElementById('input-kits').value) || 0,
    schoolsVisited: parseInt(document.getElementById('input-schools').value) || 0,
    healthcarePros: parseInt(document.getElementById('input-healthcare').value) || 0
  };
  localStorage.setItem('mbmc_stats', JSON.stringify(stats));
  loadStats();
  showNotification('Statistics updated successfully!');
}

// ========== News / Blog Posts ==========
function addNewsPost(e) {
  e.preventDefault();

  var post = {
    id: Date.now(),
    title: document.getElementById('news-title').value,
    category: document.getElementById('news-category').value,
    date: document.getElementById('news-date').value || new Date().toISOString().split('T')[0],
    content: document.getElementById('news-content').value,
    createdAt: new Date().toISOString()
  };

  var posts = JSON.parse(localStorage.getItem('mbmc_news') || '[]');
  posts.unshift(post);
  localStorage.setItem('mbmc_news', JSON.stringify(posts));

  document.getElementById('newsForm').reset();
  loadNewsList();
  showNotification('Blog post published successfully!');
}

function loadNewsList() {
  var posts = JSON.parse(localStorage.getItem('mbmc_news') || '[]');
  var container = document.getElementById('newsList');

  if (posts.length === 0) {
    container.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;">No posts published yet.</p>';
    return;
  }

  var html = '<table class="admin-table"><thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
  posts.forEach(function (post) {
    html += '<tr>' +
      '<td><strong>' + escapeHtml(post.title) + '</strong></td>' +
      '<td><span class="admin-badge info">' + escapeHtml(post.category) + '</span></td>' +
      '<td>' + escapeHtml(post.date) + '</td>' +
      '<td><button class="btn btn-sm" style="background:#E53935;color:#fff;padding:0.3rem 0.8rem;font-size:0.75rem;" onclick="deleteNewsPost(' + post.id + ')">Delete</button></td>' +
      '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function deleteNewsPost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  var posts = JSON.parse(localStorage.getItem('mbmc_news') || '[]');
  posts = posts.filter(function (p) { return p.id !== id; });
  localStorage.setItem('mbmc_news', JSON.stringify(posts));
  loadNewsList();
  showNotification('Post deleted.');
}

// ========== Gallery ==========
document.addEventListener('DOMContentLoaded', function () {
  var fileInput = document.getElementById('gallery-file');
  if (fileInput) {
    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function (ev) {
          document.getElementById('galleryPreview').style.display = 'block';
          document.getElementById('galleryPreviewImg').src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

function addGalleryPhoto(e) {
  e.preventDefault();

  var fileInput = document.getElementById('gallery-file');
  var file = fileInput.files[0];
  if (!file) return;

  // Check file size (limit to 2MB for localStorage)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image must be smaller than 2MB for storage in browser. Please compress the image.');
    return;
  }

  var reader = new FileReader();
  reader.onload = function (ev) {
    var photo = {
      id: Date.now(),
      data: ev.target.result,
      caption: document.getElementById('gallery-caption').value,
      category: document.getElementById('gallery-category').value,
      createdAt: new Date().toISOString()
    };

    var photos = JSON.parse(localStorage.getItem('mbmc_gallery') || '[]');
    photos.unshift(photo);
    localStorage.setItem('mbmc_gallery', JSON.stringify(photos));

    document.getElementById('galleryForm').reset();
    document.getElementById('galleryPreview').style.display = 'none';
    loadGalleryList();
    showNotification('Photo uploaded successfully!');
  };
  reader.readAsDataURL(file);
}

function loadGalleryList() {
  var photos = JSON.parse(localStorage.getItem('mbmc_gallery') || '[]');
  var container = document.getElementById('galleryList');

  if (photos.length === 0) {
    container.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;grid-column:1/-1;">No photos uploaded yet.</p>';
    return;
  }

  var html = '';
  photos.forEach(function (photo) {
    html += '<div class="gallery-item-admin">' +
      '<img src="' + photo.data + '" class="gallery-thumb" alt="' + escapeHtml(photo.caption) + '">' +
      '<p style="font-size:0.75rem;color:var(--gray-700);margin:0.3rem 0 0;">' + escapeHtml(photo.caption) + '</p>' +
      '<button class="delete-btn" onclick="deleteGalleryPhoto(' + photo.id + ')">&#10005;</button>' +
      '</div>';
  });
  container.innerHTML = html;
}

function deleteGalleryPhoto(id) {
  if (!confirm('Delete this photo?')) return;
  var photos = JSON.parse(localStorage.getItem('mbmc_gallery') || '[]');
  photos = photos.filter(function (p) { return p.id !== id; });
  localStorage.setItem('mbmc_gallery', JSON.stringify(photos));
  loadGalleryList();
  showNotification('Photo deleted.');
}

// ========== Team ==========
function addTeamMember(e) {
  e.preventDefault();

  var name = document.getElementById('team-name').value;
  var role = document.getElementById('team-role').value;
  var bio = document.getElementById('team-bio').value;
  var photoInput = document.getElementById('team-photo');

  if (photoInput.files && photoInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function (ev) {
      saveTeamMember(name, role, bio, ev.target.result);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveTeamMember(name, role, bio, null);
  }
}

function saveTeamMember(name, role, bio, photo) {
  var member = {
    id: Date.now(),
    name: name,
    role: role,
    bio: bio,
    photo: photo,
    createdAt: new Date().toISOString()
  };

  var team = JSON.parse(localStorage.getItem('mbmc_team') || '[]');
  team.push(member);
  localStorage.setItem('mbmc_team', JSON.stringify(team));

  document.getElementById('teamForm').reset();
  loadTeamList();
  showNotification('Team member added!');
}

function loadTeamList() {
  var team = JSON.parse(localStorage.getItem('mbmc_team') || '[]');
  var container = document.getElementById('teamList');

  if (team.length === 0) {
    container.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;">No team members added yet.</p>';
    return;
  }

  var html = '<table class="admin-table"><thead><tr><th>Photo</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead><tbody>';
  team.forEach(function (member) {
    var photoCell = member.photo ?
      '<img src="' + member.photo + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">' :
      '<div style="width:40px;height:40px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;">' +
      member.name.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase() + '</div>';
    html += '<tr>' +
      '<td>' + photoCell + '</td>' +
      '<td><strong>' + escapeHtml(member.name) + '</strong></td>' +
      '<td>' + escapeHtml(member.role) + '</td>' +
      '<td><button class="btn btn-sm" style="background:#E53935;color:#fff;padding:0.3rem 0.8rem;font-size:0.75rem;" onclick="deleteTeamMember(' + member.id + ')">Delete</button></td>' +
      '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function deleteTeamMember(id) {
  if (!confirm('Remove this team member?')) return;
  var team = JSON.parse(localStorage.getItem('mbmc_team') || '[]');
  team = team.filter(function (m) { return m.id !== id; });
  localStorage.setItem('mbmc_team', JSON.stringify(team));
  loadTeamList();
  showNotification('Team member removed.');
}

// ========== Messages ==========
function loadMessages() {
  var messages = JSON.parse(localStorage.getItem('mbmc_messages') || '[]');
  var container = document.getElementById('messagesList');
  var recentContainer = document.getElementById('recentMessages');

  if (messages.length === 0) {
    if (container) container.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;">No messages yet.</p>';
    if (recentContainer) recentContainer.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;">No messages yet.</p>';
    return;
  }

  // Full messages list
  if (container) {
    var html = '<table class="admin-table"><thead><tr><th>From</th><th>Subject</th><th>Date</th><th>Message</th><th>Actions</th></tr></thead><tbody>';
    messages.forEach(function (msg, index) {
      var date = new Date(msg.date).toLocaleDateString();
      html += '<tr>' +
        '<td><strong>' + escapeHtml(msg.firstName) + ' ' + escapeHtml(msg.lastName) + '</strong><br><span style="font-size:0.8rem;color:var(--gray-500);">' + escapeHtml(msg.email) + '</span></td>' +
        '<td><span class="admin-badge ' + (msg.read ? 'success' : 'warning') + '">' + escapeHtml(msg.subject) + '</span></td>' +
        '<td>' + date + '</td>' +
        '<td style="max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(msg.message) + '</td>' +
        '<td><button class="btn btn-sm" style="background:#E53935;color:#fff;padding:0.3rem 0.8rem;font-size:0.75rem;" onclick="deleteMessage(' + index + ')">Delete</button></td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // Recent messages (dashboard)
  if (recentContainer) {
    var recentHtml = '<table class="admin-table"><thead><tr><th>From</th><th>Subject</th><th>Date</th></tr></thead><tbody>';
    messages.slice(0, 5).forEach(function (msg) {
      recentHtml += '<tr>' +
        '<td>' + escapeHtml(msg.firstName) + ' ' + escapeHtml(msg.lastName) + '</td>' +
        '<td>' + escapeHtml(msg.subject) + '</td>' +
        '<td>' + new Date(msg.date).toLocaleDateString() + '</td>' +
        '</tr>';
    });
    recentHtml += '</tbody></table>';
    recentContainer.innerHTML = recentHtml;
  }
}

function deleteMessage(index) {
  if (!confirm('Delete this message?')) return;
  var messages = JSON.parse(localStorage.getItem('mbmc_messages') || '[]');
  messages.splice(index, 1);
  localStorage.setItem('mbmc_messages', JSON.stringify(messages));
  loadMessages();
  showNotification('Message deleted.');
}

// ========== Export / Import ==========
function exportData() {
  var data = {
    stats: JSON.parse(localStorage.getItem('mbmc_stats') || '{}'),
    news: JSON.parse(localStorage.getItem('mbmc_news') || '[]'),
    gallery: JSON.parse(localStorage.getItem('mbmc_gallery') || '[]'),
    team: JSON.parse(localStorage.getItem('mbmc_team') || '[]'),
    messages: JSON.parse(localStorage.getItem('mbmc_messages') || '[]'),
    exportedAt: new Date().toISOString()
  };

  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'mbmc-data-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification('Data exported! Save the JSON file in your data/ folder.');
}

function importData() {
  var fileInput = document.getElementById('importFile');
  if (!fileInput.files || !fileInput.files[0]) {
    alert('Please select a JSON file to import.');
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var data = JSON.parse(e.target.result);
      if (data.stats) localStorage.setItem('mbmc_stats', JSON.stringify(data.stats));
      if (data.news) localStorage.setItem('mbmc_news', JSON.stringify(data.news));
      if (data.gallery) localStorage.setItem('mbmc_gallery', JSON.stringify(data.gallery));
      if (data.team) localStorage.setItem('mbmc_team', JSON.stringify(data.team));
      if (data.messages) localStorage.setItem('mbmc_messages', JSON.stringify(data.messages));
      loadDashboard();
      showNotification('Data imported successfully!');
    } catch (err) {
      alert('Invalid JSON file. Please check the file format.');
    }
  };
  reader.readAsText(fileInput.files[0]);
}

// ========== Notification Helper ==========
function showNotification(message) {
  var existing = document.querySelector('.admin-notification');
  if (existing) existing.remove();

  var div = document.createElement('div');
  div.className = 'admin-notification';
  div.style.cssText = 'position:fixed;top:1rem;right:1rem;background:#4CAF50;color:#fff;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;font-family:var(--font-heading);font-size:0.9rem;animation:slideIn 0.3s ease;';
  div.textContent = message;
  document.body.appendChild(div);

  setTimeout(function () {
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.3s ease';
    setTimeout(function () { div.remove(); }, 300);
  }, 3000);
}

// ========== Utility: Escape HTML ==========
function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
