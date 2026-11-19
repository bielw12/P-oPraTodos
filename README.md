# 🥖 Pão pra Todos — Demo navegável

Demo só de telas (sem backend) da plataforma **Pão pra Todos**, que conecta padarias e lanchonetes com sobras do dia a famílias e instituições que precisam de comida. Projeto da Global Solution (FIAP).

## Como abrir

1. Baixe ou clone esta pasta.
2. Dê **duplo clique em `index.html`**. Ele abre no navegador, sem servidor e sem instalar nada.
3. Precisa de internet, porque o Tailwind e a fonte Poppins vêm por CDN.
4. Para recomeçar a demo do zero, basta **recarregar a página (F5)**. Tudo fica só na memória.

No computador o app aparece dentro de uma moldura de celular. No celular de verdade ele ocupa a tela toda.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Estrutura das telas, moldura do celular e barra inferior |
| `styles.css` | Estilos que o Tailwind não cobre (moldura, mapa, chips, animações, toast) |
| `data.js` | Ofertas e padarias fictícias |
| `app.js` | Navegação por hash e toda a lógica (filtros, mapa, reserva, publicação) |
| `logo/` | Logo e logotipo em SVG e PNG, ícone do app e prancha de apresentação |

## Identidade visual

O símbolo mostra **duas mãos (verde, doação) oferecendo um pão francês (caramelo, padaria) com um coração (coral, cuidado)**. Na demo, a marca aparece na tela de abertura, no topo do início, no ícone da aba, no centro do QR code e no selo de conquista da padaria.

| Cor | Hex | Uso |
|---|---|---|
| Caramelo | `#E8892B` | o pão, botões principais |
| Verde doação | `#2E9E5B` | as mãos, ofertas de doação |
| Coral | `#E0603A` | o coração, favoritos e alertas |
| Marrom | `#3B2A1E` | textos |
| Creme | `#FFF8EE` | fundo |

Fonte: **Poppins**. Slogan: **Comida boa não é lixo.**

## Telas

- `#home`: início com contadores de impacto
- `#ofertas`: lista com filtros (Todas, Doação, Até R$ 5, Mais perto, Retirada hoje)
- `#mapa`: mapa simulado com pinos clicáveis
- `#oferta/ID`: detalhe da oferta e botão Reservar
- `#reserva`: código de retirada e QR code simulado
- `#padaria`: anunciar sobras, meus anúncios e impacto do mês

## Roteiro para um vídeo de ~30 s

1. **Abertura**: a logo aparece por ~2 s (clique nela para pular).
2. **Início**: mostre a frase e os contadores subindo e clique em **Quero buscar comida**.
3. **Ofertas**: clique no chip **🎁 Doação**.
4. Clique em **🗺️ Mapa** e depois em um pino verde ("Grátis").
5. No mini card, clique em **Ver oferta**.
6. **Detalhe**: clique em **Reservar grátis**. A quantidade diminui.
7. **Reserva confirmada**: mostre o código e o QR code.
8. Na barra inferior, clique em **Padaria** e depois em **✨ Exemplo** (preenche o formulário).
9. Clique em **Publicar oferta**. Aparece o toast e o anúncio novo surge em "Meus anúncios".
10. (Extra) Clique em **Ofertas** para mostrar a oferta nova com o selo **NOVO** no topo.

> Todos os nomes, endereços e números são fictícios.
