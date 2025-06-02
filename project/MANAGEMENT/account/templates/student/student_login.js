document.querySelector('.cyberpunk-login-box').addEventListener('submit', function(e) {
  e.preventDefault();
  const lrn = document.querySelector('input[name="lrn"]').value.trim();
  const password = document.querySelector('input[type="password"]').value;

  let accounts = [];
  try {
    const stored = localStorage.getItem('admin_accounts');
    if (stored) accounts = JSON.parse(stored);
  } catch (e) {}

  // Find matching account
  const account = accounts.find(acc => acc.lrn === lrn && acc.password === password);

  if (account) {
    // Success: optionally save current student info in sessionStorage/localStorage
    sessionStorage.setItem('student_lrn', account.lrn);
    sessionStorage.setItem('student_name', account.name);
    // Redirect to dashboard
    window.location.href = "/project/MANAGEMENT/account/templates/student/student_dashboard.html";
  } else {
    // Show error message (can be improved with a styled error div)
    if (!document.getElementById('login-error')) {
      const errorDiv = document.createElement('div');
      errorDiv.id = "login-error";
      errorDiv.style.color = "#ff00cc";
      errorDiv.style.textAlign = "center";
      errorDiv.style.marginTop = "12px";
      errorDiv.textContent = "Invalid LRN or Password.";
      document.querySelector('.cyberpunk-login-box').appendChild(errorDiv);
    }
  }
});