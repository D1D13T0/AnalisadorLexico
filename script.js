/*
 * Analisador Léxico – Lista de Exercícios 2, Exercício 2, letra L
 *
 * L(G) = { x | x ∈ (a, b, c)* onde o número de a's é par se x inicia com c,
 *          caso contrário, o número de b's deve ser ímpar }
 *
 * Autômato Finito Determinístico M = (Q, Σ, δ, q0, F)
 *   Q  = { q0, q1, q2, q3, q4, qE }
 *   Σ  = { a, b, c }
 *   q0 = estado inicial
 *   F  = { q1, q4 }
 *
 *   q0 – nada lido ainda
 *   q1 – iniciou com c e o número de a's é par     (final)
 *   q2 – iniciou com c e o número de a's é ímpar
 *   q3 – iniciou com a/b e o número de b's é par
 *   q4 – iniciou com a/b e o número de b's é ímpar (final)
 *   qE – estado de erro (leu símbolo que não pertence a Σ)
 */

// ===================== DEFINIÇÃO DO AUTÔMATO =====================
const AUTOMATO = {
  estados: ['q0', 'q1', 'q2', 'q3', 'q4', 'qE'],
  alfabeto: ['a', 'b', 'c'],
  inicial: 'q0',
  finais: ['q1', 'q4'],
  estadoErro: 'qE',

  // Função de transição δ(estado, símbolo) -> próximo estado
  transicoes: {
    q0: { a: 'q3', b: 'q4', c: 'q1' },
    q1: { a: 'q2', b: 'q1', c: 'q1' },
    q2: { a: 'q1', b: 'q2', c: 'q2' },
    q3: { a: 'q3', b: 'q4', c: 'q3' },
    q4: { a: 'q4', b: 'q3', c: 'q4' },
    qE: { a: 'qE', b: 'qE', c: 'qE' },
  },
};

// δ: devolve o próximo estado. Símbolo fora do alfabeto leva ao estado de erro.
function delta(estado, simbolo) {
  const linha = AUTOMATO.transicoes[estado];
  if (linha && Object.prototype.hasOwnProperty.call(linha, simbolo)) {
    return linha[simbolo];
  }
  return AUTOMATO.estadoErro;
}

function ehFinal(estado) {
  return AUTOMATO.finais.includes(estado);
}

// ===================== ESTADO DA ANÁLISE =====================
let caminho = [AUTOMATO.inicial]; // estados visitados na sentença atual
let simbolos = [];                // símbolos lidos na sentença atual
let textoCompleto = '';           // tudo o que aparece na caixa de entrada
let ultimoResultado = null;       // resultado da última sentença finalizada
const historico = [];

const estadoAtual = () => caminho[caminho.length - 1];

// Lê um símbolo: aplica δ e troca o estado do autômato
function lerSimbolo(simbolo) {
  const proximo = delta(estadoAtual(), simbolo);
  simbolos.push(simbolo);
  caminho.push(proximo);
  textoCompleto += simbolo;
  ultimoResultado = null;
  render();
}

// Desfaz o último símbolo (Backspace) voltando ao estado anterior
function apagarSimbolo() {
  if (simbolos.length === 0) return;
  simbolos.pop();
  caminho.pop();
  textoCompleto = textoCompleto.slice(0, -1);
  render();
}

// Espaço: decide se a sentença é reconhecida (estado atual ∈ F) e reinicia o autômato
function finalizarSentenca() {
  if (simbolos.length === 0) {
    mostrarAviso('Digite uma sentença antes do espaço.');
    return;
  }
  const estadoFinal = estadoAtual();
  ultimoResultado = {
    sentenca: simbolos.join(''),
    caminho: [...caminho],
    simbolos: [...simbolos],
    aceita: ehFinal(estadoFinal),
  };
  historico.unshift(ultimoResultado);

  textoCompleto += ' ';
  caminho = [AUTOMATO.inicial];
  simbolos = [];
  render();
}

function limparTudo() {
  caminho = [AUTOMATO.inicial];
  simbolos = [];
  textoCompleto = '';
  ultimoResultado = null;
  historico.length = 0;
  mostrarAviso('');
  render();
  entrada.focus();
}

// ===================== ENTRADA DO USUÁRIO =====================
const entrada = document.getElementById('entrada');
let timerAviso = null;

function mostrarAviso(msg) {
  const el = document.getElementById('aviso');
  el.textContent = msg;
  clearTimeout(timerAviso);
  if (msg) timerAviso = setTimeout(() => (el.textContent = ''), 2500);
}

// Trata um caractere digitado: espaço separa sentenças, letras são símbolos do autômato
function processarCaractere(tecla) {
  if (tecla === ' ') {
    finalizarSentenca();
    return;
  }
  const ch = tecla.toLowerCase();
  if (ch >= 'a' && ch <= 'z') {
    if (ch !== tecla) mostrarAviso(`Maiúscula "${tecla}" convertida para "${ch}" (somente minúsculas).`);
    lerSimbolo(ch);
  } else {
    mostrarAviso(`Símbolo especial "${tecla}" desconsiderado.`);
  }
}

// beforeinput é disparado antes de o texto mudar, tanto no teclado físico quanto no virtual.
// O texto da caixa é controlado pelo analisador, por isso a alteração padrão é cancelada.
entrada.addEventListener('beforeinput', (e) => {
  e.preventDefault();
  if (e.inputType === 'insertText' && e.data) {
    for (const tecla of e.data) processarCaractere(tecla);
  } else if (e.inputType === 'deleteContentBackward') {
    apagarSimbolo();
  } else if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
    mostrarAviso('Colar texto não é permitido: digite a sentença.');
  }
});

// Segurança: qualquer alteração que escape do beforeinput (ex.: composição de acentos) é desfeita
entrada.addEventListener('input', () => sincronizarEntrada());
entrada.addEventListener('paste', (e) => e.preventDefault());
entrada.addEventListener('drop', (e) => e.preventDefault());

document.getElementById('btn-limpar').addEventListener('click', limparTudo);

function sincronizarEntrada() {
  entrada.value = textoCompleto;
  entrada.setSelectionRange(textoCompleto.length, textoCompleto.length);
}

// ===================== INTERFACE =====================
function montarTabela() {
  const tbody = document.querySelector('#tabela tbody');
  tbody.innerHTML = '';
  for (const estado of AUTOMATO.estados) {
    const tr = document.createElement('tr');
    tr.dataset.estado = estado;
    let prefixo = '';
    if (estado === AUTOMATO.inicial) prefixo += '→ ';
    if (ehFinal(estado)) prefixo += '* ';
    tr.innerHTML = `<td>${prefixo}${estado}</td>` +
      AUTOMATO.alfabeto.map((s) => `<td data-simbolo="${s}">${delta(estado, s)}</td>`).join('') +
      `<td data-simbolo="outro">${AUTOMATO.estadoErro}</td>`;
    tbody.appendChild(tr);
  }
}

function render() {
  sincronizarEntrada();
  const atual = estadoAtual();

  // Sentença e estado atual
  document.getElementById('sentenca-atual').textContent = simbolos.length ? simbolos.join('') : 'ε';
  const badge = document.getElementById('estado-atual');
  badge.textContent = atual;
  badge.className = 'valor estado-badge' +
    (ehFinal(atual) ? ' final' : '') + (atual === AUTOMATO.estadoErro ? ' erro' : '');

  // Resultado
  const res = document.getElementById('resultado');
  if (ultimoResultado) {
    res.textContent = `"${ultimoResultado.sentenca}" ` +
      (ultimoResultado.aceita ? '✔ RECONHECIDA' : '✘ REJEITADA');
    res.className = 'valor resultado ' + (ultimoResultado.aceita ? 'aceita' : 'rejeita');
  } else {
    res.textContent = simbolos.length
      ? `analisando… (q atual ${ehFinal(atual) ? 'é' : 'não é'} final)`
      : 'aguardando sentença…';
    res.className = 'valor resultado neutro';
  }

  // Caminho q0 -a-> q3 -b-> q4 ...
  const divCaminho = document.getElementById('caminho');
  divCaminho.innerHTML = caminho.map((est, i) => {
    const classe = i === caminho.length - 1 ? 'est atual' : 'est';
    const seta = i > 0 ? `<span class="sim">─${simbolos[i - 1]}→</span>` : '';
    return `${seta}<span class="${classe}">${est}</span>`;
  }).join('');

  // Diagrama: estado ativo
  document.querySelectorAll('.estado').forEach((g) => g.classList.remove('ativo'));
  document.getElementById(`st-${atual}`).classList.add('ativo');

  // Diagrama: última transição usada
  document.querySelectorAll('.aresta.ativa').forEach((a) => {
    a.classList.remove('ativa');
    a.setAttribute('marker-end', 'url(#seta)');
  });
  if (caminho.length > 1) {
    const de = caminho[caminho.length - 2];
    const aresta = document.getElementById(`e-${de}-${atual}`);
    if (aresta) {
      aresta.classList.add('ativa');
      aresta.setAttribute('marker-end', 'url(#seta-ativa)');
    }
  }

  // Tabela: linha do estado atual e célula da última transição
  document.querySelectorAll('#tabela tr').forEach((tr) => tr.classList.remove('linha-atual'));
  document.querySelectorAll('#tabela td.celula-usada').forEach((td) => td.classList.remove('celula-usada'));
  document.querySelector(`#tabela tr[data-estado="${atual}"]`).classList.add('linha-atual');
  if (caminho.length > 1) {
    const de = caminho[caminho.length - 2];
    const s = simbolos[simbolos.length - 1];
    const col = AUTOMATO.alfabeto.includes(s) ? s : 'outro';
    document.querySelector(`#tabela tr[data-estado="${de}"] td[data-simbolo="${col}"]`).classList.add('celula-usada');
  }

  renderHistorico();
}

function renderHistorico() {
  const tbody = document.querySelector('#historico tbody');
  document.getElementById('historico-vazio').style.display = historico.length ? 'none' : '';
  tbody.innerHTML = historico.map((h, i) => {
    const passos = h.caminho.map((est, j) => (j > 0 ? ` ─${h.simbolos[j - 1]}→ ` : '') + est).join('');
    return `<tr>
      <td>${historico.length - i}</td>
      <td>${h.sentenca}</td>
      <td>${passos}</td>
      <td class="${h.aceita ? 'ok' : 'nok'}">${h.aceita ? 'RECONHECIDA' : 'REJEITADA'}</td>
    </tr>`;
  }).join('');
}

montarTabela();
render();
