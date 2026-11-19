/* =========================================================
   app.js — navegação entre telas e lógica da demo
   "Pão pra Todos".

   Tudo fica na memória (variáveis JS). Ao recarregar a
   página, a demo volta ao estado inicial — ótimo para
   gravar o vídeo várias vezes.
   ========================================================= */

// =========================================================
// 1. ESTADO DA APLICAÇÃO
// =========================================================
const estado = {
  // Filtros ligados/desligados na tela de ofertas
  filtros: { doacao: false, ate5: false, perto: false, hoje: false },
  ultimaReserva: null,   // última reserva feita pelo usuário
  pinoAberto: null,      // id da oferta aberta no mapa
  rotaAtual: 'home',
  rotaAnterior: 'ofertas',
  // Valores escolhidos no formulário da padaria
  form: { categoria: '🥖', tipo: 'doacao', horario: '19h–20h', quantidade: 3 },
};

// Lugares livres no mapa para os pinos das novas ofertas da padaria
const POSICOES_NOVAS = [
  { x: 42, y: 31 },
  { x: 16, y: 43 },
  { x: 44, y: 22 },
  { x: 10, y: 58 },
];
let novasPublicadas = 0;

// =========================================================
// 2. FUNÇÕES DE AJUDA (formatação e busca)
// =========================================================

// 4.9 -> "R$ 4,90"
function formatarPreco(valor) {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// 450 -> "450 m"   |   1200 -> "1,2 km"
function formatarDistancia(metros) {
  if (metros < 1000) return metros + ' m';
  return (metros / 1000).toFixed(1).replace('.', ',') + ' km';
}

// ['6 pães', '2 sonhos'] -> "6 pães + 2 sonhos"
function resumoItens(oferta) {
  return oferta.itens.join(' + ');
}

// "hoje, 19h–20h"
function textoHorario(oferta) {
  return oferta.dia + ', ' + oferta.horario;
}

function buscarOferta(id) {
  return ofertas.find(function (o) { return o.id === id; });
}

// Oferta que ainda pode ser reservada
function estaDisponivel(oferta) {
  return !oferta.retirado && oferta.quantidade > 0;
}

// Etiqueta de preço: selo verde "DOAÇÃO" ou preço com o original riscado
function htmlPreco(oferta, tamanho) {
  if (oferta.tipo === 'doacao') {
    return '<span class="inline-block bg-doacao-500 text-white text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full">DOAÇÃO</span>';
  }
  const grande = tamanho === 'grande';
  let html = '<div class="text-right leading-tight">';
  html += '<div class="font-bold text-caramelo-600 ' + (grande ? 'text-2xl' : 'text-[15px]') + '">' + formatarPreco(oferta.preco) + '</div>';
  if (oferta.precoOriginal) {
    html += '<div class="line-through text-marrom-300 ' + (grande ? 'text-sm' : 'text-[11px]') + '">' + formatarPreco(oferta.precoOriginal) + '</div>';
  }
  html += '</div>';
  return html;
}

// =========================================================
// 3. NAVEGAÇÃO POR HASH (#home, #ofertas, #oferta/3 ...)
// =========================================================
const TELAS = ['home', 'ofertas', 'mapa', 'oferta', 'reserva', 'padaria'];

// Qual aba da barra inferior fica acesa em cada tela
const ABA_DA_TELA = {
  home: 'home',
  ofertas: 'ofertas',
  mapa: 'mapa',
  oferta: 'ofertas',
  reserva: 'ofertas',
  padaria: 'padaria',
};

function navegar() {
  // Ex.: "#oferta/3" -> tela = "oferta", parametro = "3"
  const hash = location.hash.replace('#', '') || 'home';
  const partes = hash.split('/');
  let tela = partes[0];
  const parametro = partes[1];
  if (!TELAS.includes(tela)) tela = 'home';

  // Guarda de onde o usuário veio (para o botão "voltar")
  if (tela !== estado.rotaAtual) {
    estado.rotaAnterior = estado.rotaAtual;
    estado.rotaAtual = tela;
  }

  // Esconde todas as telas e mostra só a escolhida
  document.querySelectorAll('.tela').forEach(function (secao) {
    secao.classList.remove('ativa');
  });
  const secao = document.getElementById('tela-' + tela);
  void secao.offsetWidth; // "reinicia" a animação de entrada
  secao.classList.add('ativa');

  // Acende a aba certa na barra inferior
  document.querySelectorAll('[data-aba]').forEach(function (aba) {
    aba.classList.toggle('ativo', aba.dataset.aba === ABA_DA_TELA[tela]);
  });

  // Avisa a moldura qual tela está aberta (muda a cor da barra de status)
  document.getElementById('celular').dataset.tela = tela;

  // Volta a rolagem para o topo
  document.getElementById('conteudo').scrollTop = 0;

  // Monta o conteúdo de cada tela
  if (tela === 'home') animarContadores();
  if (tela === 'ofertas') renderizarOfertas();
  if (tela === 'mapa') {
    // Só mantém o mini card aberto se o usuário está voltando do detalhe
    if (estado.rotaAnterior !== 'oferta') estado.pinoAberto = null;
    renderizarMapa();
  }
  if (tela === 'oferta') renderizarDetalhe(Number(parametro));
  if (tela === 'reserva') renderizarReserva();
  if (tela === 'padaria') renderizarPadaria();
}

// Botão "voltar" do detalhe: volta para a lista ou para o mapa
function voltar() {
  location.hash = estado.rotaAnterior === 'mapa' ? '#mapa' : '#ofertas';
}

// =========================================================
// 4. TELA INÍCIO — contadores animados
// =========================================================
function animarContadores() {
  document.querySelectorAll('.contador').forEach(function (el) {
    const alvo = Number(el.dataset.alvo);
    const duracao = 1200; // ms
    const inicio = performance.now();

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - progresso, 3); // desacelera no final
      el.textContent = Math.round(alvo * suave).toLocaleString('pt-BR');
      if (progresso < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  });
}

// =========================================================
// 5. TELA OFERTAS — filtros e lista
// =========================================================

// Aplica os filtros ligados sobre os dados do data.js
function ofertasFiltradas() {
  const f = estado.filtros;
  let lista = ofertas.filter(function (o) { return !o.retirado; });

  if (f.doacao) lista = lista.filter(function (o) { return o.tipo === 'doacao'; });
  // Doação é grátis, então também entra em "Até R$ 5"
  if (f.ate5) lista = lista.filter(function (o) { return o.tipo === 'doacao' || o.preco <= 5; });
  if (f.hoje) lista = lista.filter(function (o) { return o.dia === 'hoje'; });

  // Ordenação: "Mais perto" ordena por distância
  lista = lista.slice(); // cópia, para não bagunçar o array original
  if (f.perto) lista.sort(function (a, b) { return a.distancia - b.distancia; });

  // Ofertas esgotadas vão para o fim da lista
  lista.sort(function (a, b) { return (b.quantidade > 0) - (a.quantidade > 0); });
  return lista;
}

// Liga/desliga um filtro quando o chip é clicado
function alternarFiltro(nome) {
  if (nome === 'todas') {
    estado.filtros = { doacao: false, ate5: false, perto: false, hoje: false };
  } else {
    estado.filtros[nome] = !estado.filtros[nome];
  }
  renderizarOfertas();
}

// Atualiza a aparência dos chips
function atualizarChips() {
  const f = estado.filtros;
  const nenhum = !f.doacao && !f.ate5 && !f.perto && !f.hoje;
  document.querySelectorAll('#chips-filtros .chip').forEach(function (chip) {
    const nome = chip.dataset.filtro;
    const ligado = nome === 'todas' ? nenhum : f[nome];
    chip.classList.toggle('ativo', ligado);
  });
}

// HTML de um card de oferta
function htmlCardOferta(oferta, indice) {
  const esgotado = oferta.quantidade <= 0;
  const restam = esgotado
    ? '<span class="font-semibold text-marrom-300">esgotado</span>'
    : '<span class="font-semibold ' + (oferta.quantidade <= 2 ? 'text-coral-500' : 'text-caramelo-600') + '">restam ' + oferta.quantidade + '</span>';
  const selosNovo = oferta.nova
    ? '<span class="text-[9px] font-bold bg-caramelo-500 text-white px-1.5 py-0.5 rounded-md ml-1 align-middle">NOVO</span>'
    : '';

  return (
    '<a href="#oferta/' + oferta.id + '" class="card flex gap-3 bg-white rounded-2xl p-3 shadow-sm ' + (esgotado ? 'opacity-50' : '') + '" style="animation-delay:' + (indice * 45) + 'ms">' +
      '<div class="shrink-0 w-[68px] h-[68px] rounded-xl grid place-items-center text-[34px] ' + (oferta.tipo === 'doacao' ? 'bg-doacao-50' : 'bg-caramelo-50') + '">' + oferta.emoji + '</div>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="flex items-start justify-between gap-2">' +
          '<div class="min-w-0">' +
            '<h3 class="font-semibold text-[13.5px] text-marrom-900 leading-snug truncate">' + oferta.padaria + '</h3>' +
            '<p class="text-[12px] text-marrom-500 leading-snug line-clamp-2">' + resumoItens(oferta) + selosNovo + '</p>' +
          '</div>' +
          '<div class="shrink-0">' + htmlPreco(oferta) + '</div>' +
        '</div>' +
        '<div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-marrom-500">' +
          '<span>📍 ' + formatarDistancia(oferta.distancia) + '</span>' +
          '<span>🕖 ' + textoHorario(oferta) + '</span>' +
          restam +
        '</div>' +
      '</div>' +
    '</a>'
  );
}

function renderizarOfertas() {
  atualizarChips();
  const lista = ofertasFiltradas();
  const container = document.getElementById('lista-ofertas');
  const disponiveis = lista.filter(estaDisponivel).length;

  document.getElementById('contagem-ofertas').textContent =
    disponiveis === 1 ? '1 oferta disponível perto de você' : disponiveis + ' ofertas disponíveis perto de você';

  if (lista.length === 0) {
    container.innerHTML =
      '<div class="text-center py-12 text-marrom-500">' +
        '<div class="text-5xl mb-3">🔍</div>' +
        '<p class="font-semibold text-marrom-700">Nenhuma oferta com esses filtros</p>' +
        '<p class="text-xs mt-1">Tente tirar algum filtro.</p>' +
      '</div>';
    return;
  }
  container.innerHTML = lista.map(htmlCardOferta).join('');
}

// =========================================================
// 6. TELA MAPA — pinos e mini card
// =========================================================
function renderizarMapa() {
  // Posiciona o "Você está aqui"
  const voce = document.getElementById('pino-voce');
  voce.style.left = localUsuario.x + '%';
  voce.style.top = localUsuario.y + '%';

  const lista = ofertas.filter(estaDisponivel);
  document.getElementById('contagem-mapa').textContent = lista.length + ' ofertas';

  // Cria um pino para cada oferta disponível (verde = doação, laranja = venda)
  document.getElementById('mapa-pinos').innerHTML = lista.map(function (o, i) {
    const classeTipo = o.tipo === 'doacao' ? 'pino-doacao' : 'pino-venda';
    const texto = o.tipo === 'doacao' ? 'Grátis' : formatarPreco(o.preco);
    return (
      '<button type="button" class="pino ' + classeTipo + (estado.pinoAberto === o.id ? ' selecionado' : '') + '"' +
        ' data-id="' + o.id + '"' +
        ' style="left:' + o.x + '%; top:' + o.y + '%; animation-delay:' + (i * 60) + 'ms"' +
        ' aria-label="' + o.padaria + '">' +
        '<span>' + o.emoji + '</span><span>' + texto + '</span>' +
      '</button>'
    );
  }).join('');

  // Se o pino aberto não existe mais (ex.: esgotou), fecha o card
  if (estado.pinoAberto && !lista.some(function (o) { return o.id === estado.pinoAberto; })) {
    estado.pinoAberto = null;
  }
  renderizarMiniCard();
}

// Abre o mini card de um pino
function abrirPino(id) {
  estado.pinoAberto = id;
  document.querySelectorAll('.pino').forEach(function (pino) {
    pino.classList.toggle('selecionado', Number(pino.dataset.id) === id);
  });
  renderizarMiniCard(true);
}

function fecharPino() {
  estado.pinoAberto = null;
  document.querySelectorAll('.pino').forEach(function (pino) { pino.classList.remove('selecionado'); });
  renderizarMiniCard();
}

function renderizarMiniCard(animar) {
  const card = document.getElementById('mapa-card');
  const oferta = estado.pinoAberto ? buscarOferta(estado.pinoAberto) : null;

  if (!oferta) {
    card.classList.remove('aberto');
    card.innerHTML = '';
    return;
  }

  card.innerHTML =
    '<div class="bg-white rounded-3xl p-3.5 shadow-2xl">' +
      '<div class="flex gap-3">' +
        '<div class="shrink-0 w-14 h-14 rounded-xl grid place-items-center text-3xl ' + (oferta.tipo === 'doacao' ? 'bg-doacao-50' : 'bg-caramelo-50') + '">' + oferta.emoji + '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="flex items-start justify-between gap-2">' +
            '<h3 class="font-semibold text-[13.5px] text-marrom-900 leading-snug">' + oferta.padaria + '</h3>' +
            '<button type="button" onclick="fecharPino()" class="shrink-0 -mt-1 -mr-1 w-7 h-7 rounded-full text-marrom-300 hover:bg-marrom-100" aria-label="Fechar">✕</button>' +
          '</div>' +
          '<p class="text-[12px] text-marrom-500 leading-snug">' + resumoItens(oferta) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="flex items-center justify-between mt-2.5">' +
        '<div class="text-[11px] text-marrom-500 space-x-2">' +
          '<span>📍 ' + formatarDistancia(oferta.distancia) + '</span>' +
          '<span>🕖 ' + textoHorario(oferta) + '</span>' +
        '</div>' +
        htmlPreco(oferta) +
      '</div>' +
      '<a href="#oferta/' + oferta.id + '" class="botao ' + (oferta.tipo === 'doacao' ? 'botao-verde' : 'botao-principal') + ' mt-3 !py-3 text-sm">Ver oferta →</a>' +
    '</div>';

  // Reinicia a animação de subida quando troca de pino
  if (animar) {
    card.classList.remove('aberto');
    void card.offsetWidth;
  }
  card.classList.add('aberto');
}

// =========================================================
// 7. TELA DETALHE DA OFERTA
// =========================================================
function renderizarDetalhe(id) {
  const tela = document.getElementById('tela-oferta');
  const oferta = buscarOferta(id);

  if (!oferta) {
    tela.innerHTML =
      '<div class="text-center px-8 py-24">' +
        '<div class="text-5xl mb-3">🥲</div>' +
        '<p class="font-semibold text-marrom-700">Oferta não encontrada</p>' +
        '<a href="#ofertas" class="botao botao-principal mt-6">Voltar às ofertas</a>' +
      '</div>';
    return;
  }

  const doacao = oferta.tipo === 'doacao';
  const esgotado = oferta.quantidade <= 0 || oferta.retirado;
  const total = oferta.quantidade + (oferta.reservas || 0);
  const porcentagem = total > 0 ? Math.round((oferta.quantidade / total) * 100) : 0;

  // Quanto a pessoa economiza
  let economia = '';
  if (!doacao && oferta.precoOriginal) {
    const pct = Math.round((1 - oferta.preco / oferta.precoOriginal) * 100);
    economia = '<span class="text-[11px] font-semibold text-doacao-600 bg-doacao-50 px-2 py-0.5 rounded-full">-' + pct + '%</span>';
  }

  const listaItens = oferta.itens.map(function (item) {
    return '<li class="flex items-center gap-2.5 py-1.5"><span class="w-5 h-5 rounded-full bg-caramelo-50 text-caramelo-600 grid place-items-center text-[11px]">✓</span>' + item + '</li>';
  }).join('');

  // Texto e cor do botão principal
  let botao;
  if (esgotado) {
    botao = '<button type="button" class="botao" disabled>Esgotado</button>';
  } else {
    botao = '<button type="button" id="botao-reservar" onclick="reservar(' + oferta.id + ')" class="botao ' + (doacao ? 'botao-verde' : 'botao-principal') + '">' +
      (doacao ? '🎁 Reservar grátis' : 'Reservar por ' + formatarPreco(oferta.preco)) + '</button>';
  }

  tela.innerHTML =
    // Topo colorido com o emoji grande
    '<div class="relative ' + (doacao ? 'bg-gradient-to-b from-doacao-100 to-creme' : 'bg-gradient-to-b from-caramelo-100 to-creme') + ' pt-3 pb-6">' +
      '<div class="flex items-center justify-between px-4">' +
        '<button type="button" onclick="voltar()" class="w-10 h-10 rounded-full bg-white/90 shadow-sm grid place-items-center text-lg text-marrom-700 hover:bg-white" aria-label="Voltar">←</button>' +
        '<span class="text-[12px] font-semibold text-marrom-700">Detalhes da oferta</span>' +
        '<button type="button" onclick="favoritar(this)" class="botao-favorito w-10 h-10 rounded-full bg-white/90 shadow-sm grid place-items-center hover:bg-white" aria-label="Favoritar">' +
          '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="text-[88px] text-center mt-3 leading-none flutuar">' + oferta.emoji + '</div>' +
    '</div>' +

    '<div class="relative px-5 space-y-4">' +
      // Nome, endereço e preço
      '<div class="flex items-start justify-between gap-3">' +
        '<div class="min-w-0">' +
          '<h1 class="text-xl font-bold text-marrom-900 leading-tight">' + oferta.padaria + '</h1>' +
          '<p class="text-[12px] text-marrom-500 mt-1">' + oferta.endereco + '</p>' +
          '<p class="text-[12px] font-medium text-caramelo-600 mt-0.5">📍 a ' + formatarDistancia(oferta.distancia) + ' de você</p>' +
        '</div>' +
        '<div class="shrink-0 flex flex-col items-end gap-1">' + htmlPreco(oferta, 'grande') + economia + '</div>' +
      '</div>' +

      // Itens
      '<div class="bg-white rounded-2xl p-4 shadow-sm">' +
        '<h2 class="text-[11px] font-semibold uppercase tracking-widest text-marrom-500 mb-1">O que vem no kit</h2>' +
        '<ul class="text-[13.5px] text-marrom-900">' + listaItens + '</ul>' +
      '</div>' +

      // Horário e quantidade
      '<div class="grid grid-cols-2 gap-3">' +
        '<div class="bg-white rounded-2xl p-3.5 shadow-sm">' +
          '<p class="text-[11px] text-marrom-500">🕖 Retirada</p>' +
          '<p class="font-semibold text-marrom-900 text-[14px] mt-0.5 capitalize">' + textoHorario(oferta) + '</p>' +
        '</div>' +
        '<div class="bg-white rounded-2xl p-3.5 shadow-sm">' +
          '<p class="text-[11px] text-marrom-500">📦 Disponível</p>' +
          '<p id="texto-restam" class="font-semibold text-marrom-900 text-[14px] mt-0.5">' + (esgotado ? 'Esgotado' : 'Restam ' + oferta.quantidade) + '</p>' +
          '<div class="barra-restante mt-1.5"><div style="width:' + porcentagem + '%"></div></div>' +
        '</div>' +
      '</div>' +

      // Observações
      '<div class="flex gap-2 flex-wrap text-[11.5px]">' +
        '<span class="bg-white rounded-full px-3 py-1.5 shadow-sm text-marrom-700">🥖 Produzido hoje</span>' +
        '<span class="bg-white rounded-full px-3 py-1.5 shadow-sm text-marrom-700">🛍️ Traga sua sacola</span>' +
        '<span class="bg-white rounded-full px-3 py-1.5 shadow-sm text-marrom-700">⭐ 4,9 (128)</span>' +
      '</div>' +
      '<p class="text-[11.5px] text-marrom-500 leading-relaxed pb-2">' +
        (doacao
          ? 'Doação gratuita. Reserve só o que for buscar, assim outra família também pode aproveitar.'
          : 'Preço simbólico para cobrir parte do custo e evitar o desperdício. Pagamento na retirada (Pix ou dinheiro).') +
      '</p>' +
    '</div>' +

    // Botão fixo no rodapé
    '<div class="rodape-fixo">' + botao + '</div>';
}

// Coração de favoritar (só visual), na cor coral da marca
function favoritar(botao) {
  const ligado = botao.classList.toggle('ativo');
  mostrarToast(ligado ? '❤️ Salvo nos favoritos' : 'Removido dos favoritos');
}

// Faz a reserva: diminui a quantidade e vai para a confirmação
function reservar(id) {
  const oferta = buscarOferta(id);
  if (!oferta || !estaDisponivel(oferta)) {
    mostrarToast('Ops! Essa oferta acabou de esgotar.', 'erro');
    return;
  }

  // Pequena "carga" para parecer um app de verdade
  const botao = document.getElementById('botao-reservar');
  botao.disabled = true;
  botao.textContent = 'Reservando...';

  setTimeout(function () {
    oferta.quantidade = oferta.quantidade - 1;
    oferta.reservas = (oferta.reservas || 0) + 1;

    estado.ultimaReserva = {
      codigo: gerarCodigo(),
      oferta: oferta,
    };
    location.hash = '#reserva';
  }, 650);
}

// Código de retirada no formato "PPT-4821"
function gerarCodigo() {
  return 'PPT-' + Math.floor(1000 + Math.random() * 9000);
}

// =========================================================
// 8. TELA RESERVA CONFIRMADA
// =========================================================
function renderizarReserva() {
  const tela = document.getElementById('tela-reserva');
  const reserva = estado.ultimaReserva;

  if (!reserva) {
    tela.innerHTML =
      '<div class="text-center px-8 py-24">' +
        '<div class="text-5xl mb-3">🧺</div>' +
        '<p class="font-semibold text-marrom-700">Você ainda não tem reservas</p>' +
        '<p class="text-xs text-marrom-500 mt-1">Escolha uma oferta perto de você.</p>' +
        '<a href="#ofertas" class="botao botao-principal mt-6">Ver ofertas</a>' +
      '</div>';
    return;
  }

  const o = reserva.oferta;

  tela.innerHTML =
    '<div class="relative overflow-hidden px-5 pt-8 pb-8 text-center">' +
      htmlConfetes() +
      '<div class="check-sucesso">' +
        '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' +
      '</div>' +
      '<h1 class="text-[22px] font-bold text-marrom-900 mt-6">Reserva confirmada!</h1>' +
      '<p class="text-[13px] text-marrom-500 mt-1">Seu kit está guardado. É só buscar no horário. 💛</p>' +

      // Código + QR code
      '<div class="codigo-retirada rounded-3xl p-5 mt-6">' +
        '<p class="text-[11px] font-semibold uppercase tracking-widest text-marrom-500">Código de retirada</p>' +
        '<p class="text-[32px] font-extrabold tracking-wider text-caramelo-600 mt-1">' + reserva.codigo + '</p>' +
        '<div class="w-40 h-40 mx-auto mt-3 p-2 bg-white rounded-xl">' + gerarQRCode(reserva.codigo) + '</div>' +
        '<p class="text-[11px] text-marrom-500 mt-2">Mostre este código no balcão</p>' +
      '</div>' +

      // Informações da retirada
      '<div class="bg-white rounded-2xl p-4 shadow-sm mt-4 text-left space-y-3 text-[13px]">' +
        '<div class="flex gap-3"><span>' + o.emoji + '</span><div><p class="font-semibold text-marrom-900">' + o.padaria + '</p><p class="text-marrom-500 text-[12px]">' + resumoItens(o) + '</p></div></div>' +
        '<div class="flex gap-3"><span>🕖</span><div><p class="font-semibold text-marrom-900 capitalize">' + textoHorario(o) + '</p><p class="text-marrom-500 text-[12px]">Chegue dentro da janela de retirada</p></div></div>' +
        '<div class="flex gap-3"><span>📍</span><div><p class="font-semibold text-marrom-900">' + o.endereco + '</p><p class="text-marrom-500 text-[12px]">a ' + formatarDistancia(o.distancia) + ' de você</p></div></div>' +
        '<div class="flex gap-3"><span>' + (o.tipo === 'doacao' ? '🎁' : '💰') + '</span><div><p class="font-semibold text-marrom-900">' + (o.tipo === 'doacao' ? 'Doação — grátis' : formatarPreco(o.preco) + ' na retirada') + '</p><p class="text-marrom-500 text-[12px]">' + (o.tipo === 'doacao' ? 'Não é preciso pagar nada' : 'Pix ou dinheiro') + '</p></div></div>' +
      '</div>' +

      '<a href="#ofertas" class="botao botao-principal mt-5">Voltar às ofertas</a>' +
      '<p class="text-[11px] text-marrom-300 mt-3">Não vai conseguir ir? Cancele para outra pessoa aproveitar.</p>' +
    '</div>';
}

// Confetes coloridos caindo (só decoração)
function htmlConfetes() {
  const cores = ['#E8892B', '#2E9E5B', '#F9CB93', '#8B5A33', '#F0A04B'];
  let html = '';
  for (let i = 0; i < 18; i++) {
    html += '<span class="confete" style="left:' + (5 + i * 5.2) + '%; background:' + cores[i % cores.length] + '; animation-delay:' + (i % 6) * 0.12 + 's"></span>';
  }
  return html;
}

/*
  QR code SIMULADO: não é um QR de verdade, é uma grade de
  quadradinhos gerada a partir do código (sempre igual para o
  mesmo código), com os 3 "olhos" nos cantos para parecer real.
*/
function gerarQRCode(texto) {
  const n = 25; // grade 25 x 25

  // "Semente" baseada no texto para os quadradinhos não mudarem
  let semente = 0;
  for (let i = 0; i < texto.length; i++) semente = (semente * 31 + texto.charCodeAt(i)) % 233280;
  function aleatorio() {
    semente = (semente * 9301 + 49297) % 233280;
    return semente / 233280;
  }

  // Desenha um "olho" (quadrado de 7x7) com canto em (linha, coluna)
  function olho(l, c) {
    return (
      '<rect x="' + c + '" y="' + l + '" width="7" height="7" fill="#3B2A1E"/>' +
      '<rect x="' + (c + 1) + '" y="' + (l + 1) + '" width="5" height="5" fill="#fff"/>' +
      '<rect x="' + (c + 2) + '" y="' + (l + 2) + '" width="3" height="3" fill="#3B2A1E"/>'
    );
  }

  // Está em uma das áreas reservadas para os olhos?
  function areaDoOlho(l, c) {
    return (l < 8 && c < 8) || (l < 8 && c >= n - 8) || (l >= n - 8 && c < 8);
  }

  let quadrados = '';
  for (let l = 0; l < n; l++) {
    for (let c = 0; c < n; c++) {
      if (areaDoOlho(l, c)) continue;
      if (aleatorio() > 0.52) {
        quadrados += '<rect x="' + c + '" y="' + l + '" width="1.02" height="1.02"/>';
      }
    }
  }

  return (
    '<svg viewBox="0 0 ' + n + ' ' + n + '" width="100%" height="100%" shape-rendering="crispEdges">' +
      '<g fill="#3B2A1E">' + quadrados + '</g>' +
      olho(0, 0) + olho(0, n - 7) + olho(n - 7, 0) +
      // Símbolo da marca no meio do QR
      '<rect x="9" y="9" width="7" height="7" rx="1.6" fill="#fff"/>' +
      '<image href="logo/simbolo.svg" x="9.4" y="9.4" width="6.2" height="6.2"/>' +
    '</svg>'
  );
}

// =========================================================
// 9. ÁREA DA PADARIA — formulário, anúncios e impacto
// =========================================================

// Marca um botão de opção como ativo dentro do seu grupo
function marcarOpcao(grupoId, botaoAtivo) {
  document.querySelectorAll('#' + grupoId + ' .opcao').forEach(function (b) {
    b.classList.toggle('ativo', b === botaoAtivo);
  });
}

function escolherTipo(tipo) {
  estado.form.tipo = tipo;
  marcarOpcao('opcoes-tipo', document.querySelector('#opcoes-tipo [data-tipo="' + tipo + '"]'));
  // O campo de preço só aparece para "Preço simbólico"
  document.getElementById('bloco-preco').classList.toggle('escondido', tipo !== 'venda');
}

function mudarQuantidade(delta) {
  estado.form.quantidade = Math.min(20, Math.max(1, estado.form.quantidade + delta));
  document.getElementById('qtd-valor').textContent = estado.form.quantidade;
}

// "4,90" -> 4.9
function lerPreco(texto) {
  return parseFloat(String(texto).replace(',', '.'));
}

// Preenche o formulário com um exemplo (ajuda na gravação do vídeo)
function preencherExemplo() {
  document.getElementById('campo-itens').value = '10 pães franceses, 4 pães de queijo';
  marcarOpcao('opcoes-categoria', document.querySelector('[data-categoria="🥖"]'));
  estado.form.categoria = '🥖';
  estado.form.quantidade = 4;
  document.getElementById('qtd-valor').textContent = 4;
  escolherTipo('doacao');
  estado.form.horario = '20h–21h';
  marcarOpcao('opcoes-horario', document.querySelector('[data-horario="20h–21h"]'));
}

function publicarOferta(evento) {
  evento.preventDefault();

  const campoItens = document.getElementById('campo-itens');
  const campoPreco = document.getElementById('campo-preco');
  campoItens.classList.remove('erro');
  campoPreco.classList.remove('erro');

  // Transforma "6 pães, 2 sonhos" em ['6 pães', '2 sonhos']
  const itens = campoItens.value
    .split(/[,;\n+]/)
    .map(function (t) { return t.trim(); })
    .filter(function (t) { return t.length > 0; });

  if (itens.length === 0) {
    campoItens.classList.add('erro');
    campoItens.focus();
    mostrarToast('Descreva os itens da oferta 🙂', 'erro');
    return;
  }

  let preco = 0;
  let precoOriginal = 0;
  if (estado.form.tipo === 'venda') {
    preco = lerPreco(campoPreco.value);
    if (!(preco > 0)) {
      campoPreco.classList.add('erro');
      campoPreco.focus();
      mostrarToast('Informe o preço simbólico', 'erro');
      return;
    }
    precoOriginal = lerPreco(document.getElementById('campo-preco-original').value) || 0;
  }

  // Escolhe um lugar livre no mapa para o novo pino
  const posicao = POSICOES_NOVAS[novasPublicadas % POSICOES_NOVAS.length];
  novasPublicadas++;

  // Monta a nova oferta (mesmo formato do data.js)
  const novaOferta = {
    id: Math.max.apply(null, ofertas.map(function (o) { return o.id; })) + 1,
    padaria: minhaPadaria.nome,
    endereco: minhaPadaria.endereco,
    itens: itens,
    tipo: estado.form.tipo,
    preco: preco,
    precoOriginal: precoOriginal,
    distancia: minhaPadaria.distancia,
    dia: 'hoje',
    horario: estado.form.horario,
    quantidade: estado.form.quantidade,
    reservas: 0,
    x: posicao.x,
    y: posicao.y,
    emoji: estado.form.categoria,
    nova: true,
  };

  // Coloca no começo da lista para aparecer primeiro em #ofertas
  ofertas.unshift(novaOferta);
  minhaPadaria.impactoMes.ofertasPublicadas++;

  // Limpa o formulário
  campoItens.value = '';
  campoPreco.value = '';
  document.getElementById('campo-preco-original').value = '';

  mostrarToast('Oferta publicada! 🎉', 'sucesso');
  renderizarPadaria(novaOferta.id);

  // Rola a tela até o novo anúncio, para mostrar que ele entrou na lista
  document.getElementById('anuncio-' + novaOferta.id).scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Status do anúncio para a padaria
function statusDoAnuncio(oferta) {
  if (oferta.retirado) return { texto: 'Retirado', classe: 'status-retirado' };
  if (oferta.reservas > 0) return { texto: 'Reservado', classe: 'status-reservado' };
  return { texto: 'Disponível', classe: 'status-disponivel' };
}

function renderizarPadaria(idDestaque) {
  // ----- Meus anúncios de hoje -----
  const meus = ofertas
    .filter(function (o) { return o.padaria === minhaPadaria.nome && o.dia === 'hoje'; })
    .sort(function (a, b) { return (a.retirado ? 1 : 0) - (b.retirado ? 1 : 0); });

  document.getElementById('meus-anuncios').innerHTML = meus.map(function (o) {
    const status = statusDoAnuncio(o);
    let detalhe;
    if (o.retirado) detalhe = o.reservas + ' kits entregues ✔';
    else detalhe = 'Restam ' + o.quantidade + ' · ' + o.reservas + (o.reservas === 1 ? ' reserva' : ' reservas');

    const tag = o.retirado ? 'div' : 'a';
    const link = o.retirado ? '' : ' href="#oferta/' + o.id + '"';

    return (
      '<' + tag + link + ' id="anuncio-' + o.id + '" class="card flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm ' + (o.id === idDestaque ? 'destaque-novo' : '') + (o.retirado ? ' opacity-70' : '') + '">' +
        '<div class="shrink-0 w-11 h-11 rounded-xl grid place-items-center text-2xl ' + (o.tipo === 'doacao' ? 'bg-doacao-50' : 'bg-caramelo-50') + '">' + o.emoji + '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<p class="text-[12.5px] font-semibold text-marrom-900 truncate">' + resumoItens(o) + '</p>' +
          '<p class="text-[11px] text-marrom-500">' + (o.tipo === 'doacao' ? 'Doação' : formatarPreco(o.preco)) + ' · ' + o.horario + '</p>' +
          '<p class="text-[11px] text-marrom-300">' + detalhe + '</p>' +
        '</div>' +
        '<span class="status ' + status.classe + '">' + status.texto + '</span>' +
      '</' + tag + '>'
    );
  }).join('');

  // ----- Seu impacto este mês -----
  const imp = minhaPadaria.impactoMes;
  const progresso = Math.min(100, Math.round((imp.kgDoados / imp.metaKg) * 100));

  document.getElementById('card-impacto').innerHTML =
    '<div class="rounded-3xl p-5 text-white shadow-lg bg-gradient-to-br from-caramelo-500 to-marrom-700">' +
      '<p class="text-[11px] font-semibold uppercase tracking-widest text-white/80">Seu impacto este mês</p>' +
      '<div class="grid grid-cols-3 gap-2 mt-3 text-center">' +
        '<div><p class="text-2xl font-bold">' + imp.kgDoados + '<span class="text-sm"> kg</span></p><p class="text-[10.5px] text-white/80 leading-tight">doados</p></div>' +
        '<div><p class="text-2xl font-bold">' + imp.pessoasAlimentadas + '</p><p class="text-[10.5px] text-white/80 leading-tight">pessoas alimentadas</p></div>' +
        '<div><p class="text-2xl font-bold">' + imp.ofertasPublicadas + '</p><p class="text-[10.5px] text-white/80 leading-tight">ofertas publicadas</p></div>' +
      '</div>' +
      // Conquista
      '<div class="flex items-center gap-3 bg-white/15 rounded-2xl p-3 mt-4">' +
        '<div class="w-12 h-12 rounded-full bg-white grid place-items-center shadow"><img src="logo/simbolo.svg" alt="" class="w-9"></div>' +
        '<div class="flex-1">' +
          '<p class="text-[13px] font-semibold">Selo "Doador de Alimentos"</p>' +
          '<p class="text-[10.5px] text-white/80">Conquista desbloqueada este mês!</p>' +
        '</div>' +
      '</div>' +
      '<div class="mt-3">' +
        '<div class="flex justify-between text-[10.5px] text-white/85"><span>Próximo: Padaria Solidária Ouro</span><span>' + imp.kgDoados + '/' + imp.metaKg + ' kg</span></div>' +
        '<div class="h-2 bg-white/25 rounded-full mt-1 overflow-hidden"><div class="h-full bg-white rounded-full" style="width:' + progresso + '%"></div></div>' +
      '</div>' +
    '</div>';
}

// =========================================================
// 10. TOAST (mensagem rápida que aparece e some)
// =========================================================
function mostrarToast(mensagem, tipo) {
  const toast = document.createElement('div');
  toast.className = 'toast' + (tipo ? ' toast-' + tipo : '');
  toast.textContent = mensagem;
  document.getElementById('toasts').appendChild(toast);

  setTimeout(function () { toast.classList.add('saindo'); }, 2300);
  setTimeout(function () { toast.remove(); }, 2650);
}

// =========================================================
// 11. MOLDURA — diminui o celular se a janela for baixa
// =========================================================
function ajustarMoldura() {
  const celular = document.getElementById('celular');
  if (window.innerWidth < 520) {
    celular.style.transform = '';
    return;
  }
  const alturaComBorda = 844 + 26 + 40; // celular + borda + respiro
  const escala = Math.min(1, window.innerHeight / alturaComBorda);
  celular.style.transform = escala < 1 ? 'scale(' + escala + ')' : '';
}

// =========================================================
// 12. INÍCIO: liga os eventos e abre a primeira tela
// =========================================================
function iniciar() {
  // Chips de filtro
  document.querySelectorAll('#chips-filtros .chip').forEach(function (chip) {
    chip.addEventListener('click', function () { alternarFiltro(chip.dataset.filtro); });
  });

  // Botão "alterar" localização (só visual)
  document.querySelectorAll('.botao-alterar').forEach(function (b) {
    b.addEventListener('click', function () {
      mostrarToast('📍 Na versão completa você escolhe outro endereço');
    });
  });

  // Pinos do mapa (um único "ouvinte" para todos os pinos)
  document.getElementById('mapa').addEventListener('click', function (e) {
    const pino = e.target.closest('.pino');
    if (pino) {
      abrirPino(Number(pino.dataset.id));
    } else if (!e.target.closest('#mapa-card')) {
      fecharPino(); // clicou no fundo do mapa
    }
  });

  // Formulário da padaria
  document.querySelectorAll('#opcoes-categoria .opcao').forEach(function (b) {
    b.addEventListener('click', function () {
      estado.form.categoria = b.dataset.categoria;
      marcarOpcao('opcoes-categoria', b);
    });
  });
  document.querySelectorAll('#opcoes-tipo .opcao').forEach(function (b) {
    b.addEventListener('click', function () { escolherTipo(b.dataset.tipo); });
  });
  document.querySelectorAll('#opcoes-horario .opcao').forEach(function (b) {
    b.addEventListener('click', function () {
      estado.form.horario = b.dataset.horario;
      marcarOpcao('opcoes-horario', b);
    });
  });
  document.getElementById('qtd-menos').addEventListener('click', function () { mudarQuantidade(-1); });
  document.getElementById('qtd-mais').addEventListener('click', function () { mudarQuantidade(1); });
  document.getElementById('botao-exemplo').addEventListener('click', preencherExemplo);
  document.getElementById('form-oferta').addEventListener('submit', publicarOferta);

  // Navegação por hash
  window.addEventListener('hashchange', navegar);
  window.addEventListener('resize', ajustarMoldura);

  ajustarMoldura();
  navegar();
  mostrarAbertura();
}

// Tela de abertura com a logo: some sozinha depois de ~2 s (ou ao clicar)
function mostrarAbertura() {
  const abertura = document.getElementById('abertura');
  let fechada = false;

  function fechar() {
    if (fechada) return;
    fechada = true;
    abertura.classList.add('sumindo');
    setTimeout(function () { abertura.remove(); }, 450);
    // Os contadores da tela inicial animam depois que a abertura some
    if (estado.rotaAtual === 'home') animarContadores();
  }

  abertura.addEventListener('click', fechar);
  setTimeout(fechar, 1900);
}

iniciar();
