const apiBase = 'http://localhost/clinic2.0/api/user.php';
const responseBox = document.getElementById("response");

function toggleForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  loginForm.classList.toggle("hidden");
  registerForm.classList.toggle("hidden");
}

// Login Handler
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await axios.post(`${apiBase}?operation=login`, {
      email,
      password
    });

    if (res.data.success) {
      const { id, fullName, role, message } = res.data;

      // Store in localStorage
      localStorage.setItem('id', id);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('role', role);

      // Redirect based on role
      if (role === "doctor") {
        window.location.href = "doctor_dashboard.html";
      } else if (role === "secretary") {
        window.location.href = "secretary_dashboard.html";
      } else if (role === "patient") {
        window.location.href = "patient_dashboard.html";
      } else {
        responseBox.textContent = "Unknown role.";
      }
    } else {
      responseBox.textContent = res.data.message;
    }
  } catch (err) {
    responseBox.textContent = err.response?.data?.message || "Login error.";
  }
});

// Register Handler
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fullName = document.getElementById("registerFullName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const role = document.getElementById("registerRole").value;

  try {
    const res = await axios.post(`${apiBase}?operation=register`, {
      fullName,
      email,
      password,
      role
    });

    responseBox.textContent = res.data.message;
  } catch (err) {
    responseBox.textContent = err.response?.data?.message || "Registration error.";
  }
});
