// Interface & Menu
const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

registerLink.addEventListener('click', () => {
  wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
  wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', () => {
  wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
  wrapper.classList.remove('active-popup');
});

document.querySelector(".btnLogin-popup").addEventListener("click", function () {
  const nav = document.getElementById("navigation");
  nav.classList.remove("active");
});

// Firebase Auth
const auth = firebase.auth();

const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');

// Registro
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = registerForm.querySelector('input[type="email"]').value;
  const password = document.getElementById("register-password").value;
  const name = document.getElementById("register-name").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return user.updateProfile({
        displayName: name
      }).then(() => {
        window.location.href = "home.html";
      });
    })
    .catch((error) => {
      registerForm.querySelector('#error-message').textContent = "Erro: " + error.message;
    });
});

// Login
document.getElementById("error-message").textContent = "";

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const errorMsg = document.querySelector(".form-box.login #error-message");
  errorMsg.textContent = "";

  const email = loginForm.querySelector('input[type="email"]').value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
  .then(() => {
    const successMsg = document.createElement("p");
    successMsg.textContent = "Login realizado com sucesso!";
    successMsg.style.color = "green";
    loginForm.appendChild(successMsg);

    setTimeout(() => {
      successMsg.remove();
      wrapper.classList.remove('active-popup');
    }, 1500);
  })

.catch((error) => {
  const errorMsg = document.querySelector(".form-box.login #error-message");
  let mensagemAmigavel = ""; 

  switch (error.code) {
    case 'auth/invalid-credential':
      mensagemAmigavel = "Email ou senha inválidos.";
      break;
    case 'auth/invalid-email':
      mensagemAmigavel = "O formato do email digitado é inválido.";
      break;
    case 'auth/too-many-requests':
      mensagemAmigavel = "Muitas tentativas de login. Tente novamente mais tarde.";
      break;
    case 'auth/network-request-failed':
      mensagemAmigavel = "Erro de conexão. Verifique sua internet.";
      break;
    default:
      mensagemAmigavel = "Senha incorreta ou email incorretos. Tente novamente.";
      console.error("Erro de login não tratado:", error); // Isso mostra o erro original no console, só para você.
      break;
  }

  // Exibimos a mensagem amigável para o usuário
  errorMsg.textContent = mensagemAmigavel;
});
});

// Exibir informações do usuário logado
firebase.auth().onAuthStateChanged((user) => {
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const userNameSpan = document.getElementById("user-name");

  if (user) {
    const nome = user.displayName || user.email.split('@')[0];
    logoutBtn.style.display = "inline-block";
    userNameSpan.textContent = nome;
    userNameSpan.style.display = "inline-block";
  } else {
    userInfo.textContent = "";
    logoutBtn.style.display = "none";
    userNameSpan.textContent = "";
    userNameSpan.style.display = "none";
  }
});

// Redefinir senha
document.getElementById("forgot-password").addEventListener("click", () => {
  const email = prompt("Digite seu e-mail para redefinir a senha:");
  if (email) {
    auth.sendPasswordResetEmail(email)
      .then(() => {
        alert("Email de redefinição enviado!");
      })
      .catch((error) => {
        alert("Erro: " + error.message);
      });
  }
});

// Mostrar/ocultar senha
function togglePassword(inputId, iconElement) {
  const passwordInput = document.getElementById(inputId);
  const icon = iconElement.querySelector("ion-icon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.setAttribute("name", "eye-outline");
  } else {
    passwordInput.type = "password";
    icon.setAttribute("name", "eye-off-outline");
  }
}

// Botão de logout
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    console.log("Logout realizado com sucesso!");
    logoutBtn.style.display = "none";
    const userInfo = document.getElementById("user-info");
    userInfo.textContent = "";
  }).catch((error) => {
    console.error("Erro ao fazer logout:", error);
  });
});

firebase.auth().onAuthStateChanged(function(user) {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userNameSpan = document.getElementById("user-name");

  if (user) {
    // Oculta botão de login
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

  } else {
    // Mostra botão de login
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    userNameSpan.textContent = "";
  }
});

// Substitua sua função filterPrompts por esta versão final:
function filterPrompts() {
  const input = document.getElementById('searchInput').value.toUpperCase();
  const category = document.getElementById('categorySelect').value;
  const prompts = document.getElementsByClassName('prompt');
  
  // NOVO: Criamos um contador para os itens visíveis
  let visibleCount = 0;

  for (let i = 0; i < prompts.length; i++) {
    const h3 = prompts[i].querySelector('h3').textContent.toUpperCase();
    const label = prompts[i].querySelector('.label').textContent;

    const matchesText = h3.includes(input);
    const matchesCategory = (category === "Todos") || (category === label);

    if (matchesText && matchesCategory) {
      prompts[i].style.display = "";
      visibleCount++; // NOVO: Incrementa o contador se o item for visível
    } else {
      prompts[i].style.display = "none";
    }
  }

  // NOVO: Bloco de código para verificar o contador e mostrar/esconder a mensagem
  const noResultsMessage = document.getElementById('no-results-message');
  if (visibleCount === 0) {
    noResultsMessage.style.display = 'block'; // Mostra a mensagem se não houver resultados
  } else {
    noResultsMessage.style.display = 'none'; // Esconde a mensagem se houver resultados
  }
}

  document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("focus", () => {
      document.querySelector("header").classList.add("search-focus");
    });

    searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        document.querySelector("header").classList.remove("search-focus");
      }, 200);
    });
  }
});


