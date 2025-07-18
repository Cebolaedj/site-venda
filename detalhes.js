document.addEventListener('DOMContentLoaded', () => {

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (productId) {
    carregarDetalhesProduto(productId);
  } else {

    window.location.href = 'index.html';
  }
});

function carregarDetalhesProduto(productId) {
  const db = firebase.firestore();
  
  db.collection("produtos").doc(productId).get()
    .then((doc) => {
      if (doc.exists) {
        const produto = doc.data();
        exibirDetalhesProduto(produto);
      } else {

        window.location.href = 'index.html';
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar produto:", error);
      window.location.href = 'index.html';
    });
}

function exibirDetalhesProduto(produto) {

  const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  
  document.getElementById('detail-product-name').textContent = produto.nome;
  document.getElementById('detail-product-category').textContent = produto.categoria;
  document.getElementById('detail-product-price').textContent = precoFormatado;
  document.getElementById('detail-product-author').textContent = `Autor: ${produto.autor}`;
  document.getElementById('detail-product-image').src = produto.imagem;
  document.getElementById('detail-product-image').alt = `Capa do livro ${produto.nome}`;
  const descricaoElement = document.getElementById('detail-product-description');
  
  if (produto.descricao) {
    descricaoElement.innerHTML = produto.descricao
      .replace(/\n/g, '<br>'); // Converte quebras de linha para HTML
  } else {
    descricaoElement.textContent = 'Descrição não disponível';
  }

  
  document.title = `${produto.nome} | Bibliosky`;
}


function abrirDetalhesProduto(docId) {
  window.open(`detalhes.html?id=${docId}`, '_blank');
;
}

console.log("Iniciando carregamento...");
firebase.firestore().collection("produtos").get()
  .then(snap => {
    console.log(`Encontrados ${snap.size} produtos`);
    snap.forEach(doc => console.log("Produto:", doc.id, doc.data()));
  })
  .catch(err => console.error("Erro Firestore:", err));