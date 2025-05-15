// Gerar coordenadas
function gerarCoordenadas() {
  const tabuleiroContainer = document.createElement('div');
  tabuleiroContainer.className = 'grid-coordenadas';
  
  // Colunas (A-J)
  const colunas = document.createElement('div');
  colunas.className = 'colunas-labels';
  for (let i = 0; i < 10; i++) {
    const letra = String.fromCharCode(65 + i);
    colunas.innerHTML += `<div>${letra}</div>`;
  }

  // Linhas (1-10)
  const linhas = document.createElement('div');
  linhas.className = 'linhas-labels';
  for (let i = 1; i <= 10; i++) {
    const numero = i.toString().padStart(2, ' ');
    linhas.innerHTML += `<div>${i}</div>`;

  }

  tabuleiroContainer.appendChild(colunas);
  tabuleiroContainer.appendChild(linhas);
  tabuleiroContainer.appendChild(tabuleiro);
  document.querySelector('main').appendChild(tabuleiroContainer);
}

// Gerar grid e coordenadas
const tabuleiro = document.getElementById('tabuleiro');
for (let i = 0; i < 100; i++) {
  const celula = document.createElement('div');
  celula.classList.add('celula');
  celula.dataset.posicao = i;
  tabuleiro.appendChild(celula);
}
gerarCoordenadas();

// Tokens estilizados
function adicionarToken() {
  const tipo = document.getElementById('seletorPersonagem').value;
  const celulas = document.querySelectorAll('.celula');
  const indexAleatorio = Math.floor(Math.random() * celulas.length);
  const celula = celulas[indexAleatorio];

  if (!celula.querySelector('.token')) {
    const token = document.createElement('div');
    token.className = 'token';
    token.textContent = tipo;
    
    // Estilos para inimigos
    if (tipo === '👹') token.style.borderColor = '#ff0000';
    if (tipo === '👿') {
      token.style.borderColor = '#800080';
      token.style.boxShadow = '0 0 8px #490303';
    }

    // Drag and drop
    token.setAttribute('draggable', true);
    token.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.id);
      token.classList.add('dragging');
    });
    token.addEventListener('dragend', () => token.classList.remove('dragging'));
    
    celula.appendChild(token);
  }
  salvarEstado();
}

// Sistema de arraste
document.querySelectorAll('.celula').forEach(celula => {
  celula.addEventListener('dragover', e => e.preventDefault());
  celula.addEventListener('drop', e => {
    e.preventDefault();
    const tokenArrastado = document.querySelector('.dragging');
    if (tokenArrastado && !celula.querySelector('.token')) {
      celula.appendChild(tokenArrastado);
      salvarEstado();
    }
  });
});

// Sistema de troca de cenário
function mudarCenario(nome) {
  const tabuleiro = document.getElementById('tabuleiro');
  const botoes = document.querySelectorAll('.cenario-btn');
  
  // Atualiza visual dos botões
  botoes.forEach(btn => btn.classList.remove('ativo'));
  event.target.classList.add('ativo');
  
  // Altera a imagem de fundo
  tabuleiro.style.backgroundImage = `url('./img/${nome}.jpeg')`;

  salvarEstado();

}

// Função para redimensionar o grid conforme zoom (adicione isso)
function ajustarTamanhoGrid() {
  const tabuleiro = document.getElementById('tabuleiro');
  tabuleiro.style.transform = `scale(${zoomLevel})`;
}
// Salvar estado atual
function salvarEstado() {
  const estado = {
    cenario: document.getElementById('tabuleiro').style.backgroundImage,
    tokens: []
  };

  document.querySelectorAll('.celula').forEach((celula, index) => {
    const token = celula.querySelector('.token');
    if (token) {
      estado.tokens.push({
        posicao: parseInt(celula.dataset.posicao),
        posicao: index,
        tipo: token.textContent,
        corBorda: token.style.borderColor,
        // Adicione a sombra dos bosses
        sombra: token.style.boxShadow 
      });
    }
  });

  localStorage.setItem('nightfallSave', JSON.stringify(estado));
}

// Carregar estado salvo
function carregarEstado() {
  const salvo = localStorage.getItem('nightfallSave');
  if (!salvo) return;

  const estado = JSON.parse(salvo);
  
  // Carrega cenário
  document.getElementById('tabuleiro').style.backgroundImage = estado.cenario;
  
  // Carrega tokens
  estado.tokens.forEach(({ posicao, tipo, corBorda, sombra }) => {
    const celula = document.querySelector(`.celula[data-posicao="${posicao}"]`);
    if (celula && !celula.querySelector('.token')) {
      const token = document.createElement('div');
      token.className = 'token';
      token.textContent = tipo;
      token.style.borderColor = corBorda;
      token.style.boxShadow = sombra; // Restaura a sombra
      
      // Recria eventos de drag
      token.setAttribute('draggable', true);
      token.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
        token.classList.add('dragging');
      });
      token.addEventListener('dragend', () => token.classList.remove('dragging'));
      
      celula.appendChild(token);
    }
  });
}

// Sistema de remoção
let modoRemocaoAtivo = false;

function ativarModoRemocao() {
  const btnInicio = document.getElementById('btnIniciarRemocao');
  const btnConcluir = document.getElementById('btnConcluirRemocao');
  
  // Mostra botão de conclusão
  btnInicio.style.display = 'none';
  btnConcluir.style.display = 'inline-block';
  
  // Ativa modo
  document.body.classList.add('modo-remocao');
  
  // Adiciona evento de clique nas células
  const celulas = document.querySelectorAll('.celula');
  celulas.forEach(celula => {
    const listener = () => {
      const token = celula.querySelector('.token');
      if (token) {
        token.remove();
        salvarEstado();
      }
    };
    celula.addEventListener('click', listener);
    // Guarda referência para remover depois
    celula._remocaoListener = listener;
  });
}

function desativarModoRemocao() {
  const btnInicio = document.getElementById('btnIniciarRemocao');
  const btnConcluir = document.getElementById('btnConcluirRemocao');
  
  // Esconde botão de conclusão
  btnInicio.style.display = 'inline-block';
  btnConcluir.style.display = 'none';
  
  // Desativa modo
  document.body.classList.remove('modo-remocao');
  
  // Remove eventos de clique
  document.querySelectorAll('.celula').forEach(celula => {
    if (celula._remocaoListener) {
      celula.removeEventListener('click', celula._remocaoListener);
      delete celula._remocaoListener;
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('modo-remocao')) {
    desativarModoRemocao();
  }
});

function limparTabuleiro() {
  document.querySelectorAll('.token').forEach(token => token.remove());
  salvarEstado();
}

// Carregue o estado ao iniciar
window.addEventListener('load', () => {
  carregarEstado();
});
