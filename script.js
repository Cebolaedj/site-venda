function criarCardProduto(produto, docId) {
    const promptDiv = document.createElement('div');
    promptDiv.className = 'prompt';
    
    const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    promptDiv.innerHTML = `
        <div class="label">${produto.categoria}</div>
        <div class="prompt-image">
            <img src="${produto.imagem}" alt="Capa do livro ${produto.nome}" loading="lazy">
        </div>
        <div class="prompt-info">
            <h3>${produto.nome}</h3>
            <p>${precoFormatado}</p>
            <p class="autor">Autor: ${produto.autor}</p>
        </div>
        <div class="prompt-actions">
            <button class="edit-btn" data-id="${docId}">Editar</button>
            <button class="delete-btn" data-id="${docId}">Excluir</button>
        </div>
        <button class="ver-completo-btn" data-id="${docId}">Ver completo</button>
    `;

    return promptDiv;
}

const db = firebase.firestore();

function carregarProdutos() {
    db.collection("produtos").get().then((querySnapshot) => {
        const container = document.querySelector('.content');
        container.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const produto = doc.data();
            const card = criarCardProduto(produto, doc.id);
            container.appendChild(card);
        });
    }).catch(console.error);
}

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

function criarCardProduto(produto, docId) {
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
      <p class="autor">Autor: ${produto.autor}</p>
    </div>
    <div class="prompt-actions">
      <button class="edit-btn" data-id="${docId}">Editar</button>
      <button class="delete-btn" data-id="${docId}">Excluir</button>
    </div>
    <button class="subscribe-button ver-completo-btn" data-id="${docId}">Ver completo</button>
  `;

  return promptDiv;
}

//Cadastro de Produtos
const formCadastroProduto = document.getElementById("form-cadastro-produto");
formCadastroProduto.addEventListener('submit', (e) => {
    e.preventDefault();

    const db = firebase.firestore();
    const editingId = formCadastroProduto.getAttribute('data-editing-id');

    const produto = {
        nome: document.getElementById('produto-nome').value,
        autor: document.getElementById('produto-autor').value,
        preco: document.getElementById('produto-preco').value,
        imagem: document.getElementById('produto-imagem').value,
        categoria: document.getElementById('produto-categoria').value,
        descricao: document.getElementById('produto-descricao').value
    };

    if (editingId) {
        // Atualiza o produto existente
        db.collection("produtos").doc(editingId).update(produto)
            .then(() => {
                alert("Produto atualizado com sucesso!");
                formCadastroProduto.reset();
                formCadastroProduto.removeAttribute('data-editing-id');
                document.querySelector('#form-cadastro-produto button[type="submit"]').textContent = 'Cadastrar Produto';
                modalCadastroProduto.classList.remove('show');
                carregarProdutos();
            })
            .catch((error) => {
                console.error("Erro ao atualizar produto: ", error);
                alert("Falha ao atualizar o produto. Verifique o console para mais detalhes.");
            });
    } else {
        // Cadastra novo produto
        db.collection("produtos").add(produto)
            .then((docRef) => {
                console.log("Produto salvo com o ID: ", docRef.id);
                alert("Produto cadastrado com sucesso!");
                formCadastroProduto.reset();
                modalCadastroProduto.classList.remove('show');
                carregarProdutos();
            })
            .catch((error) => {
                console.error("Erro ao salvar produto: ", error);
                alert("Falha ao cadastrar o produto. Verifique o console para mais detalhes.");
            });
    }
});

//Carregar todos os produtos do Firestore
function carregarProdutos() {
    const db = firebase.firestore();
    const container = document.querySelector('.content');
    const categorySelect = document.getElementById('categorySelect');
    
    container.innerHTML = '<div class="loading">Carregando produtos...</div>';

    db.collection("produtos").get()
        .then((querySnapshot) => {
            container.innerHTML = '';
            
            if (querySnapshot.empty) {
                container.innerHTML = '<div class="no-results">Nenhum produto cadastrado ainda.</div>';
                return;
            }

            const categoriasUnicas = new Set(["Todos"]); // Inicia com "Todos"

            querySnapshot.forEach((doc) => {
                const produto = doc.data();
                if (produto.categoria) {
                    categoriasUnicas.add(produto.categoria);
                }
                
                const card = criarCardProduto(produto, doc.id);
                container.appendChild(card);
                adicionarEventosAoCard(card, doc.id);
            });

            atualizarCategoriasNoFiltro(categoriasUnicas);
        })
        .catch((error) => {
            console.error("Erro ao carregar produtos:", error);
            container.innerHTML = `
                <div class="error">
                    Erro ao carregar produtos. 
                    <button onclick="carregarProdutos()">Tentar novamente</button>
                </div>`;
        });
}

function atualizarCategoriasNoFiltro(categorias) {
    const categorySelect = document.getElementById('categorySelect');
    
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }

    const categoriasOrdenadas = Array.from(categorias).sort();
    
    categoriasOrdenadas.forEach(categoria => {
        if (categoria !== "Todos") {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categorySelect.appendChild(option);
        }
    });
}

// Função auxiliar para adicionar eventos
function adicionarEventosAoCard(card, docId) {
    // Evento para "Ver completo"
    card.querySelector('.ver-completo-btn').addEventListener('click', () => {
        window.location.href = `detalhes.html?id=${docId}`;
    });
    
    // Evento para editar
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        editarProduto(docId);
    });
    
    // Evento para excluir
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deletarProduto(docId);
    });
}

window.onload = carregarProdutos;
});

//Excluir Produtos
async function deletarProduto(docId) {
    if (!confirm('Tem certeza?')) return;
    
    try {
        await db.collection("produtos").doc(docId).delete();
        document.querySelector(`.prompt [data-id="${docId}"]`)?.closest('.prompt')?.remove();
    } catch (error) {
        console.error("Erro real:", error);
        alert(`Erro REAL: ${error.message}`);
    }
}

//Editar produto
function editarProduto(docId) {
    const db = firebase.firestore();
    const modal = document.getElementById('modal-cadastro-produto');
    const form = document.getElementById('form-cadastro-produto');
    
    form.reset();
    
    if (form.hasAttribute('data-editing-id')) {
        form.removeAttribute('data-editing-id');
    }
    
    form.setAttribute('data-editing-id', docId);
    
    db.collection("produtos").doc(docId).get()
        .then((doc) => {
            if (doc.exists) {
                const produto = doc.data();
                
                document.getElementById('produto-nome').value = produto.nome || '';
                document.getElementById('produto-autor').value = produto.autor || '';
                document.getElementById('produto-preco').value = produto.preco || '';
                document.getElementById('produto-imagem').value = produto.imagem || '';
                document.getElementById('produto-categoria').value = produto.categoria || '';
                document.getElementById('produto-descricao').value = produto.descricao || '';
                
                const submitBtn = form.querySelector("button[type='submit']");
                submitBtn.textContent = 'Atualizar';
                
                modal.classList.add('show');
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar produto:", error);
            alert('Erro ao carregar produto para edição');
        });
}
function atualizarProdutoNoDOM(elemento, produto) {
    const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    elemento.querySelector('.label').textContent = produto.categoria;
    elemento.querySelector('h3').textContent = produto.nome;
    elemento.querySelector('.prompt-info p').textContent = precoFormatado;
    elemento.querySelector('.prompt-description p').textContent = `Autor: ${produto.autor}`;
    elemento.querySelector('.prompt-image img').src = produto.imagem;
    elemento.querySelector('.prompt-image img').alt = `Capa do livro ${produto.nome}`;
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('ver-completo-btn')) {
    e.preventDefault();
    const docId = e.target.getAttribute('data-id');
    abrirDetalhesProduto(docId);
  }
});

function abrirDetalhesProduto(docId) {
  if (!docId) {
    console.error('ID do produto não encontrado');
    return;
  }
  
  window.location.href = `detalhes.html?id=${docId}`;
}

// [Seu código existente de autenticação e produtos...]

// ========== GERENCIAMENTO DE CLIENTES ==========
const modalCadastroCliente = document.getElementById("modal-cadastro-cliente");
const btnCadastrarCliente = document.getElementById("btn-cadastrar-cliente");
const formCadastroCliente = document.getElementById("form-cadastro-cliente");

// Mostrar seção de clientes
btnCadastrarCliente.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("produtos-container").style.display = "none";
  document.getElementById("clientes-section").style.display = "block";
  carregarClientes();
});

// Voltar para produtos
document.getElementById("fechar-clientes").addEventListener("click", function(e) {
    e.preventDefault();
    
    // Esconde a seção de clientes
    document.getElementById("clientes-section").style.display = "none";
    
    // Mostra a seção de produtos
    document.querySelector(".content").style.display = "grid";
    
    // Recarrega os produtos
    if(typeof carregarProdutos === "function") {
        carregarProdutos();
    } else {
        console.error("Função carregarProdutos não encontrada!");
        location.reload(); // Fallback
    }
});

// Abrir modal de cadastro
document.getElementById("clientes-section").addEventListener("click", (e) => {
  if (e.target.classList.contains("add-cliente-btn")) {
    e.preventDefault();
    modalCadastroCliente.classList.add("show");
  }
});

// Fechar modal
modalCadastroCliente.querySelector(".close-button").addEventListener("click", () => {
  modalCadastroCliente.classList.remove("show");
});

// Cadastrar/Editar cliente
document.addEventListener('click', function(e) {
  // Botão Editar
  if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
    const clienteId = e.target.dataset.id || e.target.closest('[data-id]').dataset.id;
    if (clienteId) editarCliente(clienteId);
  }
  
  // Botão Excluir
  if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
    const clienteId = e.target.dataset.id || e.target.closest('[data-id]').dataset.id;
    if (clienteId) deletarCliente(clienteId);
  }
});

// No formulário de cadastro de cliente, modifique o submit:
formCadastroCliente.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const clienteData = {
    nome: document.getElementById("cliente-nome").value,
    cpf: document.getElementById("cliente-cpf").value,
    email: document.getElementById("cliente-email").value,
    endereco: document.getElementById("cliente-endereco").value,
    telefone: document.getElementById("cliente-telefone").value,
    dataCadastro: firebase.firestore.FieldValue.serverTimestamp()
  };

  const db = firebase.firestore();
  const clienteId = formCadastroCliente.getAttribute("data-editing-id");

  if (clienteId) {
    // Edição
    db.collection("clientes").doc(clienteId).update(clienteData)
      .then(() => {
        alert("Cliente atualizado com sucesso!");
        modalCadastroCliente.classList.remove("show");
        formCadastroCliente.removeAttribute("data-editing-id"); // Limpa o ID de edição
        formCadastroCliente.reset(); // Limpa o formulário
        carregarClientes();
      })
      .catch(console.error);
  } else {
    // Cadastro novo
    db.collection("clientes").add(clienteData)
      .then(() => {
        alert("Cliente cadastrado com sucesso!");
        modalCadastroCliente.classList.remove("show");
        formCadastroCliente.reset(); // Limpa o formulário
        carregarClientes();
      })
      .catch(console.error);
  }
});

// E modifique a função editarCliente para garantir que o botão de submit volte ao normal após cancelar:
function editarCliente(id) {
  const db = firebase.firestore();
  
  db.collection("clientes").doc(id).get()
    .then((doc) => {
      if (doc.exists) {
        const cliente = doc.data();
        
        // Preenche o formulário
        document.getElementById("cliente-nome").value = cliente.nome || "";
        document.getElementById("cliente-cpf").value = cliente.cpf || "";
        document.getElementById("cliente-email").value = cliente.email || "";
        document.getElementById("cliente-endereco").value = cliente.endereco || "";
        document.getElementById("cliente-telefone").value = cliente.telefone || "";
        
        // Configura o formulário para edição
        formCadastroCliente.setAttribute("data-editing-id", id);
        formCadastroCliente.querySelector("button[type='submit']").textContent = "Atualizar Cliente";
        
        // Abre o modal
        modalCadastroCliente.classList.add("show");
      }
    })
    .catch(console.error);
}

// Adicione também um evento para limpar o formulário quando o modal for fechado
modalCadastroCliente.querySelector(".close-button").addEventListener("click", () => {
  formCadastroCliente.removeAttribute("data-editing-id");
  formCadastroCliente.reset();
  formCadastroCliente.querySelector("button[type='submit']").textContent = "Cadastrar Cliente";
  modalCadastroCliente.classList.remove("show");
});

// Função deletarCliente atualizada
async function deletarCliente(id) {
  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    try {
      await firebase.firestore().collection("clientes").doc(id).delete();
      carregarClientes(); // Recarrega a lista
      alert("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente");
    }
  }
}

// Carregar clientes
// Substitua a função carregarClientes por:
async function carregarClientes() {
  try {
    const db = firebase.firestore();
    const container = document.getElementById("clientes-list");
    container.innerHTML = '<div class="loading">Carregando clientes...</div>';

    const querySnapshot = await db.collection("clientes").orderBy("nome").get();
    
    if (querySnapshot.empty) {
      container.innerHTML = `
        <div class="no-results">
          Nenhum cliente cadastrado.
          <button class="add-cliente-btn" onclick="abrirModalCliente()">
            + Adicionar Cliente
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    querySnapshot.forEach(doc => {
      const cliente = doc.data();
      const card = document.createElement('div');
      card.className = 'cliente-card';
      card.innerHTML = `
        <h3>${cliente.nome || 'Não informado'}</h3>
        <p><strong>CPF:</strong> ${cliente.cpf || 'Não informado'}</p>
        <p><strong>E-mail:</strong> ${cliente.email || 'Não informado'}</p>
        <p><strong>Endereço:</strong> ${cliente.endereco || 'Não informado'}</p>
        <p><strong>Telefone:</strong> ${cliente.telefone || 'Não informado'}</p>
        <div class="cliente-actions">
          <button class="edit-btn" data-id="${doc.id}">Editar</button>
          <button class="delete-btn" data-id="${doc.id}">Excluir</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    document.getElementById("clientes-list").innerHTML = `
      <div class="error">
        Erro ao carregar clientes. 
        <button onclick="carregarClientes()">Tentar novamente</button>
      </div>
    `;
  }
}

// Adicione esta função para abrir o modal
function abrirModalCliente() {
  formCadastroCliente.reset();
  formCadastroCliente.removeAttribute("data-editing-id");
  modalCadastroCliente.classList.add("show");
}
        
// Substitua o evento do botão por:
document.getElementById("fechar-clientes").addEventListener("click", function(e) {
  e.preventDefault();
  
  // Esconde a seção de clientes
  document.getElementById("clientes-section").style.display = "none";
  
  // Mostra a seção de produtos
  document.querySelector(".content").style.display = "grid";
  
  // Garante que o menu mobile fique escondido
  if (window.innerWidth <= 768) {
    document.querySelector('.mobile-nav').style.display = "flex";
  }
  
  // Força o recarregamento dos produtos
  carregarProdutos();
});

// Criar card de cliente
function criarCardCliente(cliente, id) {
  const card = document.createElement("div");
  card.className = "cliente-card";
  card.innerHTML = `
    <h3>${cliente.nome}</h3>
    <p><strong>CPF:</strong> ${cliente.cpf}</p>
    <p><strong>E-mail:</strong> ${cliente.email}</p>
    <p><strong>Endereço:</strong> ${cliente.endereco}</p>
    <p><strong>Telefone:</strong> ${cliente.telefone}</p>
    <div class="cliente-actions">
      <button class="edit-btn" data-id="${doc.id}">Editar</button>
      <button class="delete-btn" data-id="${doc.id}">Excluir</button>
    </div>
  `;
  
  // Eventos dos botões
  card.querySelector(".edit-cliente-btn").addEventListener("click", () => editarCliente(id));
  card.querySelector(".delete-cliente-btn").addEventListener("click", () => deletarCliente(id));
  
  return card;
}

// Editar cliente
function editarCliente(id) {
  const db = firebase.firestore();
  
  db.collection("clientes").doc(id).get()
    .then((doc) => {
      if (doc.exists) {
        const cliente = doc.data();
        
        // Preenche o formulário
        document.getElementById("cliente-nome").value = cliente.nome || "";
        document.getElementById("cliente-cpf").value = cliente.cpf || "";
        document.getElementById("cliente-email").value = cliente.email || "";
        document.getElementById("cliente-endereco").value = cliente.endereco || "";
        document.getElementById("cliente-telefone").value = cliente.telefone || "";
        
        // Configura o formulário para edição
        formCadastroCliente.setAttribute("data-editing-id", id);
        formCadastroCliente.querySelector("button[type='submit']").textContent = "Atualizar Cliente";
        
        // Abre o modal
        modalCadastroCliente.classList.add("show");
      }
    })
    .catch(console.error);
}

// Deletar cliente
function deletarCliente(id) {
  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    firebase.firestore().collection("clientes").doc(id).delete()
      .then(() => {
        alert("Cliente excluído com sucesso!");
        carregarClientes();
      })
      .catch(console.error);
  }
}

// Filtro de clientes
document.getElementById("searchClientInput").addEventListener("input", (e) => {
  const termo = e.target.value.toLowerCase();
  const cards = document.querySelectorAll(".cliente-card");
  
  cards.forEach(card => {
    const texto = card.textContent.toLowerCase();
    card.style.display = texto.includes(termo) ? "block" : "none";
  });
});

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // [Seu código de inicialização existente...]
  
  // Carrega produtos por padrão
  carregarProdutos();
});

// Solução definitiva - adicione no final do script.js
setTimeout(() => {
  const btnCliente = document.getElementById("btn-cadastrar-cliente");
  if (btnCliente) {
    btnCliente.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Botão funcionando!");
      document.querySelector(".content").style.display = "none";
      document.getElementById("clientes-section").style.display = "block";
      if (typeof carregarClientes === 'function') {
        carregarClientes();
      } else {
        console.error("Função carregarClientes não existe!");
      }
    });
  }
}, 1000);

console.log("Firestore:", firebase.firestore());
console.log("Coleção clientes:", db.collection("clientes"));
console.log("Elementos encontrados:");
console.log("Seção clientes:", document.getElementById("clientes-section"));
console.log("Botão adicionar:", document.querySelector(".add-cliente-btn"));
console.log("Botão voltar:", document.getElementById("fechar-clientes"));
console.log("Elementos encontrados:");
console.log("Seção clientes:", document.getElementById("clientes-section"));
console.log("Botão adicionar:", document.querySelector(".add-cliente-btn"));
console.log("Botão voltar:", document.getElementById("fechar-clientes"));
console.log("Botão clicado - ID:", clienteId);
console.log("Documento encontrado:", doc.exists, doc.data());