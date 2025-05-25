const API_URL = 'http://localhost:3000/receitas';

/* --------------------------------------
    FUNÇÃO AUXILIAR - DETECTA PÁGINA
-------------------------------------- */
function getPaginaAtual() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1);
}

/* --------------------------------------
    INDEX.HTML - GERAR CARDS
-------------------------------------- */
function gerarCards() {
    const container = document.getElementById("cards-container");
    if (!container) return;

    fetch(API_URL)
        .then(response => response.json())
        .then(receitas => {
            container.innerHTML = '';

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

/* --------------------------------------
    DETALHES.HTML - GERAR DETALHES
-------------------------------------- */
function gerarDetalhes() {
    const container = document.getElementById("detalhes-container");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));

    if (!id || isNaN(id)) {
        container.innerHTML = `<p>ID inválido.</p>`;
        return;
    }

    fetch(`${API_URL}/${id}`)
        .then(response => response.json())
        .then(receita => {
            container.innerHTML = `
                <div class="card detalhes">
                    <img src="${receita.imagem}" alt="${receita.nome}" />
                    <div class="card-body">
                        <h2>${receita.nome}</h2>
                        <p>${receita.descricao}</p>
                        <h4>Ingredientes:</h4>
                        <ul>${receita.ingredientes.map(i => `<li>${i}</li>`).join('')}</ul>
                        <h4>Modo de Preparo:</h4>
                        <ol>${receita.modoPreparo.map(p => `<li>${p}</li>`).join('')}</ol>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            container.innerHTML = `<p>${error.message}</p>`;
            console.error("Erro ao carregar detalhes:", error);
        });
}

/* --------------------------------------
    ADMIN.HTML - CARREGAR TABELA
-------------------------------------- */
function carregarReceitas() {
    const tabela = document.getElementById('tabela-receitas');
    if (!tabela) return;

    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            tabela.innerHTML = '';

            data.forEach(receita => {
                const linha = document.createElement('tr');

                linha.innerHTML = `
                    <td>${receita.id}</td>
                    <td>${receita.nome}</td>
                    <td>${receita.descricao}</td>
                    <td>${receita.tempoPreparo}</td>
                    <td>
                        <a href="edit.html?id=${receita.id}">
                            <button>Editar</button>
                        </a>
                        <button onclick="deletarReceita(${receita.id})">Deletar</button>
                    </td>
                `;

                tabela.appendChild(linha);
            });
        });
}

/* --------------------------------------
    ADMIN.HTML - DELETAR RECEITA
-------------------------------------- */
function deletarReceita(id) {
    const confirmar = confirm('Deseja realmente excluir essa receita?');

    if (confirmar) {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        })
            .then(() => carregarReceitas());
    }
}

/* --------------------------------------
    CADASTRO.HTML - CADASTRAR RECEITA
-------------------------------------- */
function inicializarCadastro() {
    const form = document.getElementById('form-cadastro');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const nome = document.getElementById('nome').value;
            const descricao = document.getElementById('descricao').value;
            const tempoPreparo = document.getElementById('tempoPreparo').value;
            const imagem = document.getElementById('imagem').value;
            const ingredientes = document.getElementById('ingredientes').value.split(',').map(i => i.trim());
            const modoPreparo = document.getElementById('modoPreparo').value.split(';').map(p => p.trim());

            const novoId = await gerarProximoId();

            const novaReceita = {
                id: `${novoId}`,
                nome,
                descricao,
                tempoPreparo,
                ingredientes,
                modoPreparo,
                imagem
            };

            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaReceita)
            })
                .then(() => {
                    alert('Receita cadastrada com sucesso!');
                    window.location.href = 'admin.html';
                })
                .catch(error => {
                    console.error('Erro ao cadastrar:', error);
                    alert('Erro ao cadastrar receita.');
                });
        });
    }
}


/* --------------------------------------
    EDIT.HTML - CARREGAR DADOS E SALVAR
-------------------------------------- */
function carregarDadosParaEdicao() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('ID não encontrado na URL!');
        window.location.href = 'admin.html';
        return;
    }

    fetch(`${API_URL}/${id}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Receita não encontrada!');
            }
            return res.json();
        })
        .then(receita => {
            document.getElementById('nome').value = receita.nome;
            document.getElementById('descricao').value = receita.descricao;
            document.getElementById('tempoPreparo').value = receita.tempoPreparo;
            document.getElementById('ingredientes').value = receita.ingredientes.join(', ');
            document.getElementById('modoPreparo').value = receita.modoPreparo.join('; ');
            document.getElementById('imagem').value = receita.imagem;
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
            alert('Receita não encontrada!');
            window.location.href = 'admin.html';
        });
}

function salvarEdicao() {
    const formEditar = document.getElementById('form-editar');
    if (formEditar) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        formEditar.addEventListener('submit', function (e) {
            e.preventDefault();

            const receitaAtualizada = {
                id: Number(id),
                nome: document.getElementById('nome').value,
                descricao: document.getElementById('descricao').value,
                tempoPreparo: document.getElementById('tempoPreparo').value,
                ingredientes: document.getElementById('ingredientes').value.split(',').map(i => i.trim()),
                modoPreparo: document.getElementById('modoPreparo').value.split(';').map(p => p.trim()),
                imagem: document.getElementById('imagem').value
            };

            fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(receitaAtualizada)
            })
                .then(() => {
                    alert('Receita atualizada com sucesso!');
                    window.location.href = 'admin.html';
                })
                .catch(error => {
                    console.error('Erro ao atualizar:', error);
                    alert('Erro ao atualizar receita.');
                });
        });
    }
}


/* --------------------------------------
    GERAR PRÓXIMO ID
-------------------------------------- */
async function gerarProximoId() {
    const resposta = await fetch(API_URL);
    const receitas = await resposta.json();

    if (receitas.length === 0) {
        return 1;
    }

    const ids = receitas.map(r => Number(r.id));
    const maiorId = Math.max(...ids);

    return maiorId + 1;
}

/* --------------------------------------
    DISPARO DAS FUNÇÕES POR PÁGINA
-------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const pagina = getPaginaAtual();

    if (pagina === 'index.html') {
        gerarCards();
    }

    if (pagina === 'detalhes.html') {
        gerarDetalhes();
    }

    if (pagina === 'admin.html') {
        carregarReceitas();
    }

    if (pagina === 'cadastro.html') {
        inicializarCadastro();
    }

    if (pagina === 'edit.html') {
        carregarDadosParaEdicao();
        salvarEdicao();
    }
});
