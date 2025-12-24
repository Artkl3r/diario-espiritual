// assets/js/common.js

import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/**
 * Protege páginas internas: se não houver usuário logado, redireciona para login
 */
export function protectPage() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "/index.html";
    }
  });
}

/**
 * Inicializa o botão de logout (presente em todas as páginas internas)
 */
export function initLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "/index.html";
    });
  }
}

/**
 * Função para destacar o link ativo na navbar lateral
 */
export function highlightActiveNav() {
  const path = window.location.pathname;
  const links = document.querySelectorAll("aside nav a");
  links.forEach((link) => {
    if (path.endsWith(link.getAttribute("href"))) {
      link.classList.add("bg-green-50", "text-green-700");
    } else {
      link.classList.remove("bg-green-50", "text-green-700");
    }
  });
}

/**
 * Utilitário para formatar datas em pt-BR
 */
export function formatDate(date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Utilitário para gerar IDs únicos (para eventos, diário, etc.)
 */
export function generateId() {
  return crypto.randomUUID();
}
