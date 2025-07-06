// Interface & Menu
const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');
const body = document.body; 

registerLink.addEventListener('click', ()=> {
wrapper.classList.add('active');
});

loginLink.addEventListener('click', ()=> {
wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', ()=> {
wrapper.classList.add('active-popup');
body.classList.add('body-overlay'); 
});

iconClose.addEventListener('click', ()=> {
wrapper.classList.remove('active-popup');
body.classList.remove('body-overlay');
});

window.addEventListener('click', (event) => {
if (wrapper.classList.contains('active-popup')) {
if (!wrapper.contains(event.target) && !btnPopup.contains(event.target)) {
wrapper.classList.remove('active-popup');
body.classList.remove('body-overlay'); 
}
}
});

// Firebase Auth
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');

const btnGoogleLogin = document.getElementById('btn-google-login');

btnGoogleLogin.addEventListener('click', () => {
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            console.log("Usuário logado com Google:", result.user);
            
            wrapper.classList.remove('active-popup');
            body.classList.remove('body-overlay');

        })
        .catch((error) => {
            console.error("Erro no login com Google:", error);
            const errorMessage = document.querySelector(".form-box.login #error-message");
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage.textContent = 'A janela de login foi fechada antes da conclusão.';
            } else {
                errorMessage.textContent = 'Ocorreu um erro ao tentar fazer login com o Google.';
            }
        });
});

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
      console.error("Erro de login não tratado:", error); 
      break;
  }

  errorMsg.textContent = mensagemAmigavel;
});
});

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

function filterPrompts() {
  const input = document.getElementById('searchInput').value.toUpperCase();
  const category = document.getElementById('categorySelect').value;
  const prompts = document.getElementsByClassName('prompt');
  
  let visibleCount = 0;

  for (let i = 0; i < prompts.length; i++) {
    const h3 = prompts[i].querySelector('h3').textContent.toUpperCase();
    const label = prompts[i].querySelector('.label').textContent;

    const matchesText = h3.includes(input);
    const matchesCategory = (category === "Todos") || (category === label);

    if (matchesText && matchesCategory) {
      prompts[i].style.display = "";
      visibleCount++; 
    } else {
      prompts[i].style.display = "none";
    }
  }

  const noResultsMessage = document.getElementById('no-results-message');
  if (visibleCount === 0) {
    noResultsMessage.style.display = 'block'; 
  } else {
    noResultsMessage.style.display = 'none'; 
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

const modalCadastroProduto = document.getElementById("modal-cadastro-produto");
const btnCadastrarProduto = document.getElementById("btn-cadastrar-produto");
const spanClose = modalCadastroProduto.getElementsByClassName("close-button")[0];

btnCadastrarProduto.onclick = function() {
  modalCadastroProduto.classList.add("show");
}

spanClose.onclick = function() {
  modalCadastroProduto.classList.remove("show");
}

window.onclick = function(event) {
  if (event.target == modalCadastroProduto) {
    modalCadastroProduto.classList.remove("show");
  }
}

function criarCardProduto(produto) {

  const promptDiv = document.createElement('div');
  promptDiv.className = 'prompt';

  const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  promptDiv.innerHTML = `
    <div class="label">${produto.categoria}</div>
    <div class="prompt-image"><img src="${produto.imagem}" alt="Capa do livro ${produto.nome}"></div>
    <div class="prompt-info">
      <h3>${produto.nome}</h3>
      <p>${precoFormatado}</p>
    </div>
    <div class="prompt-description">
      <p>Autor: ${produto.autor}</p>
    </div>
    <div class="subscribe-button" href="#">Ver completo</div>
  `;

  return promptDiv;
}

const formCadastroProduto = document.getElementById("form-cadastro-produto");
formCadastroProduto.addEventListener('submit', (e) => {
    e.preventDefault();

    const db = firebase.firestore();

    const produtoCadastrado = {
        nome: document.getElementById('produto-nome').value,
        autor: document.getElementById('produto-autor').value,
        preco: document.getElementById('produto-preco').value,
        imagem: document.getElementById('produto-imagem').value,
        categoria: document.getElementById('produto-categoria').value
    };

    db.collection("produtos").add(produtoCadastrado)
    .then((docRef) => {
        console.log("Produto salvo com o ID: ", docRef.id);
        
        const novoCard = criarCardProduto(produtoCadastrado);
        const containerDeProdutos = document.querySelector('.content');
        containerDeProdutos.prepend(novoCard);

        alert("Produto cadastrado com sucesso!");
        formCadastroProduto.reset();
        modalCadastroProduto.classList.remove('show');
    })
    .catch((error) => {
        console.error("Erro ao salvar produto: ", error);
        alert("Falha ao cadastrar o produto. Verifique o console para mais detalhes.");
    });
});

//Carregar todos os produtos do Firestore
function carregarProdutos() {
    const db = firebase.firestore();
    const containerDeProdutos = document.querySelector('.content');
    const categorySelect = document.getElementById('categorySelect');

  
    const categoriasUnicas = new Set();

    db.collection("produtos").get().then((querySnapshot) => {
        
        const promptsAntigos = containerDeProdutos.querySelectorAll('.prompt');
        promptsAntigos.forEach(prompt => prompt.remove());

        querySnapshot.forEach((doc) => {
            const produto = doc.data();

            if (produto.categoria) {
                categoriasUnicas.add(produto.categoria);
            }
            
            const card = criarCardProduto(produto);
            containerDeProdutos.appendChild(card);
        });

        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        categoriasUnicas.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categorySelect.appendChild(option);
        });

    }).catch((error) => {
        console.error("Erro ao carregar produtos ou categorias: ", error);
    });
}

window.onload = carregarProdutos;
});



