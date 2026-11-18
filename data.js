/* =========================================================
   data.js — DADOS FICTÍCIOS da demo "Pão pra Todos"
   Nenhuma padaria, endereço ou pessoa aqui é real.
   ========================================================= */

// Onde o usuário "está" no mapa simulado (posição em % do mapa)
const localUsuario = {
  bairro: 'Vila Trigal',
  cidade: 'São Paulo',
  x: 50,
  y: 58,
};

// Números de impacto mostrados na tela inicial
const impactoGeral = {
  kgSalvos: 1240,
  refeicoes: 3100,
  padarias: 48,
};

// A padaria que está "logada" na Área da padaria
const minhaPadaria = {
  nome: 'Padaria Pão Dourado',
  endereco: 'Rua dos Trigais, 120 – Vila Trigal',
  distancia: 450, // distância até o usuário, em metros
  impactoMes: {
    kgDoados: 86,
    pessoasAlimentadas: 312,
    ofertasPublicadas: 27,
    metaKg: 100, // meta para a próxima conquista
  },
};

/*
  Lista de ofertas.
  Campos de cada oferta:
  - id            número único
  - padaria       nome da padaria
  - endereco      endereço fictício
  - itens         lista de itens do kit
  - tipo          "doacao" (grátis) ou "venda" (preço simbólico)
  - preco         preço simbólico (0 para doação)
  - precoOriginal quanto custaria normalmente
  - distancia     em metros
  - dia           "hoje" ou "amanhã"
  - horario       janela de retirada
  - quantidade    quantos kits ainda restam
  - reservas      quantos kits já foram reservados
  - x, y          posição do pino no mapa simulado (em %)
  - emoji         ícone da oferta
*/
const ofertas = [
  {
    id: 1,
    padaria: 'Padaria Pão Dourado',
    endereco: 'Rua dos Trigais, 120 – Vila Trigal',
    itens: ['6 pães franceses', '2 sonhos'],
    tipo: 'doacao',
    preco: 0,
    precoOriginal: 14.5,
    distancia: 450,
    dia: 'hoje',
    horario: '19h–20h',
    quantidade: 3,
    reservas: 2,
    x: 32,
    y: 50,
    emoji: '🥖',
  },
  {
    id: 2,
    padaria: 'Lanchonete Esquina do Sabor',
    endereco: 'Av. Aurora, 845 – Vila Trigal',
    itens: ['4 coxinhas', '3 esfihas de carne', '2 pães de queijo'],
    tipo: 'venda',
    preco: 4.9,
    precoOriginal: 18.0,
    distancia: 650,
    dia: 'hoje',
    horario: '20h–21h',
    quantidade: 2,
    reservas: 1,
    x: 70,
    y: 66,
    emoji: '🥟',
  },
  {
    id: 3,
    padaria: 'Panificadora Grão de Ouro',
    endereco: 'Rua das Acácias, 56 – Jardim Moinho',
    itens: ['1 bolo de cenoura com chocolate (inteiro)'],
    tipo: 'venda',
    preco: 7.9,
    precoOriginal: 32.0,
    distancia: 1200,
    dia: 'hoje',
    horario: '18h–19h',
    quantidade: 1,
    reservas: 0,
    x: 78,
    y: 34,
    emoji: '🍰',
  },
  {
    id: 4,
    padaria: 'Confeitaria Doce Manhã',
    endereco: 'Rua Professor Lima, 310 – Vila Trigal',
    itens: ['6 pães doces', '4 sonhos de creme'],
    tipo: 'doacao',
    preco: 0,
    precoOriginal: 24.0,
    distancia: 900,
    dia: 'hoje',
    horario: '19h–20h',
    quantidade: 4,
    reservas: 1,
    x: 22,
    y: 72,
    emoji: '🍩',
  },
  {
    id: 5,
    padaria: 'Padaria Forno de Pedra',
    endereco: 'Rua do Moinho, 77 – Jardim Moinho',
    itens: ['2 pães italianos', '1 baguete'],
    tipo: 'venda',
    preco: 5.0,
    precoOriginal: 22.0,
    distancia: 1800,
    dia: 'hoje',
    horario: '20h–21h',
    quantidade: 2,
    reservas: 0,
    x: 20,
    y: 22,
    emoji: '🍞',
  },
  {
    id: 6,
    padaria: 'Lanchonete Cantinho da Vila',
    endereco: 'Praça da Matriz, 12 – Vila Trigal',
    itens: ['5 mistos quentes', '3 pães de queijo'],
    tipo: 'venda',
    preco: 3.5,
    precoOriginal: 26.0,
    distancia: 280,
    dia: 'hoje',
    horario: '18h–19h',
    quantidade: 5,
    reservas: 2,
    x: 62,
    y: 48,
    emoji: '🥪',
  },
  {
    id: 7,
    padaria: 'Padaria Trigo & Fermento',
    endereco: 'Av. Central, 1500 – Parque das Espigas',
    itens: ['10 pães franceses', '1 pão de forma'],
    tipo: 'doacao',
    preco: 0,
    precoOriginal: 20.0,
    distancia: 2900,
    dia: 'hoje',
    horario: '20h–21h',
    quantidade: 6,
    reservas: 0,
    x: 84,
    y: 90,
    emoji: '🧺',
  },
  {
    id: 8,
    padaria: 'Padaria Pão Dourado',
    endereco: 'Rua dos Trigais, 120 – Vila Trigal',
    itens: ['4 croissants', '2 fatias de bolo de fubá'],
    tipo: 'venda',
    preco: 2.0,
    precoOriginal: 19.0,
    distancia: 450,
    dia: 'hoje',
    horario: '20h–21h',
    quantidade: 2,
    reservas: 0,
    x: 32,
    y: 41,
    emoji: '🥐',
  },
  {
    id: 9,
    padaria: 'Panificadora Grão de Ouro',
    endereco: 'Rua das Acácias, 56 – Jardim Moinho',
    itens: ['8 pães de leite', '2 roscas doces'],
    tipo: 'doacao',
    preco: 0,
    precoOriginal: 16.0,
    distancia: 1200,
    dia: 'amanhã',
    horario: '18h–19h',
    quantidade: 3,
    reservas: 0,
    x: 78,
    y: 25,
    emoji: '🥯',
  },
  {
    id: 10,
    padaria: 'Lanchonete Esquina do Sabor',
    endereco: 'Av. Aurora, 845 – Vila Trigal',
    itens: ['6 salgados assados variados', '2 enroladinhos de salsicha'],
    tipo: 'venda',
    preco: 9.9,
    precoOriginal: 30.0,
    distancia: 650,
    dia: 'amanhã',
    horario: '19h–20h',
    quantidade: 4,
    reservas: 0,
    x: 70,
    y: 75,
    emoji: '🌭',
  },
  {
    // Esta oferta já foi retirada: só aparece em "Meus anúncios de hoje"
    id: 11,
    padaria: 'Padaria Pão Dourado',
    endereco: 'Rua dos Trigais, 120 – Vila Trigal',
    itens: ['3 baguetes', '1 pão de forma integral'],
    tipo: 'doacao',
    preco: 0,
    precoOriginal: 21.0,
    distancia: 450,
    dia: 'hoje',
    horario: '18h–19h',
    quantidade: 0,
    reservas: 3,
    retirado: true,
    x: 32,
    y: 50,
    emoji: '🥖',
  },
];
