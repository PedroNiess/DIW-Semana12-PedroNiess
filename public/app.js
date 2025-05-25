function gerarCards() {
  const container = document.getElementById("cards-container");
  if (!container) return;

  fetch("http://localhost:3000/receitas")
    .then(response => response.json())
    .then(receitas => {
      receitas.forEach(receita => {
        const card = document.createElement("div");
        card.classList.add("card", "p-3", "m-2");

        card.innerHTML = `
          <img src="${receita.imagem}" alt="${receita.nome}" class="card-img-top">
          <div class="card-body">
            <h3 class="card-title">${receita.nome}</h3>
            <p class="card-text">${receita.descricao}</p>
            <a href="detalhes.html?id=${receita.id}" class="btn-detalhes">Ver detalhes</a>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(error => {
      container.innerHTML = `<p>Erro ao carregar receitas.</p>`;
      console.error(error);
    });
}

function gerarDetalhes() {
  const container = document.getElementById("detalhes-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  if (!id || isNaN(id)) {
    container.innerHTML = `<p>ID inválido.</p>`;
    return;
  }

  fetch(`http://localhost:3000/receitas/?id=${id}`)
    .then(response => response.json())
    .then(receitas => {
      if (!receitas.length) throw new Error("Receita não encontrada");
      const receita = receitas[0];

      container.innerHTML = `
        <div class="card detalhes">
          <img src="${receita.imagem}" alt="${receita.nome}" />
          <div class="card-body">
            <h2>${receita.nome}</h2>
            <p>${receita.descricao}</p>
            <h4>Ingredientes:</h4>
            <ul>${receita.ingredientes.map(i => `<li>${i}</li>`).join("")}</ul>
            <h4>Modo de Preparo:</h4>
            <ol>${receita.modoPreparo?.map(p => `<li>${p}</li>`).join("") || "<li>Não informado</li>"}</ol>
          </div>
        </div>
      `;
    })
    .catch(error => {
      container.innerHTML = `<p>${error.message}</p>`;
      console.error("Erro ao carregar detalhes:", error);
    });
}


document.addEventListener("DOMContentLoaded", () => {
  gerarCards();
  gerarDetalhes();
});
