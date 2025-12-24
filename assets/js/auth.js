// assets/js/auth.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Protege páginas internas
const protectedPages = ["/dashboard.html", "/calendar.html", "/diary.html", "/monthly.html"];

function redirectIfNotAuth() {
  const path = window.location.pathname;
  if (protectedPages.some(p => path.endsWith(p))) {
    onAuthStateChanged(auth, user => {
      if (!user) {
        window.location.href = "/index.html"; // volta para login
      }
    });
  }
}
redirectIfNotAuth();

// Login com e-mail e senha
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login bem-sucedido:", userCredential.user);
    window.location.href = "dashboard.html"; // redireciona após login
  } catch (err) {
    const el = document.getElementById("login-error");
    if (el) {
      el.textContent = "Credenciais inválidas";
      el.classList.remove("hidden");
    }
  }
}

// Bind somente na página de login
const loginForm = document.getElementById("login-form");
if (loginForm) loginForm.addEventListener("submit", handleLogin);

// Logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}
