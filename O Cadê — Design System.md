# O Cadê? — Design System

Guia de interface para a IA construir o front-end (mobile e desktop) do sistema de Achados e Perdidos. Siga este documento ao pé da letra. Quando houver dúvida, escolha a opção que mais lembra um balcão físico de achados e perdidos, não um app de tecnologia genérico.

> **Escopo desta versão:** o front-end usa **apenas a API como ela existe hoje**, sem nenhuma alteração no back-end. A seção 16 (Contrato da API) é a fonte da verdade sobre o que existe. Se algo neste documento parecer exigir um dado que não está lá, a seção 16 vence. Não invente campos, rotas nem respostas.

## 1. Conceito

**Ideia central: o balcão de achados e perdidos.** Etiquetas de papel amarradas em barbante, canhotos destacáveis, carimbos, papel pardo, caneta esferográfica. A interface é prática, calorosa e humana: parece algo que uma pessoa organizada montou, não um template.

Todo item cadastrado é **um objeto que foi achado e está guardado no balcão** esperando o dono. Não existe distinção entre "perdido", "achado" ou "devolvido" no sistema; quando o dono busca o objeto, o item é excluído.

**Personalidade:** acolhedora, direta, um pouco bem-humorada, confiável. Fala como um atendente simpático, nunca como robô corporativo.

**Sensação desejada:** "alguém cuidou do meu objeto". Nada de frieza SaaS.

**Elementos de assinatura (use em todo o produto, com consistência):**

- **Cartão-etiqueta:** card de item com um furo circular no canto superior (onde passaria o barbante) e cantos levemente cortados.
- **Canhoto pontilhado:** linha tracejada separando a parte principal do card de uma faixa inferior com código/ação, como um ticket destacável.
- **Carimbo de data:** selo levemente girado (-2° a -3°), borda dupla, texto em caixa alta com fonte mono, indicando quando o objeto chegou ao balcão (ex.: `ACHADO · 03 NOV`).
- **Sombra dura:** sombra sem desfoque deslocada (3px 3px 0), cor da tinta. Nunca sombras difusas grandes.
- **Fita adesiva amarela:** detalhe decorativo pequeno (no máximo um por tela) em destaques ou na foto do item.

## 2. Regras anti "cara de IA" (obrigatórias)

A IA que construir a interface NÃO pode fazer nada da lista abaixo:

- Gradiente roxo/azul/rosa, gradiente em botões, texto com gradiente.
- Glassmorphism, blur de fundo decorativo, "blobs" e orbes coloridos.
- Emoji como ícone ou decoração (🔍📦✨🚀). Use ícones SVG de traço.
- Fonte Inter, Roboto ou Arial como identidade. Use as fontes definidas abaixo.
- Cards todos idênticos, centralizados, com sombra suave e raio 16+ por toda parte.
- Hero gigante com título genérico tipo "Encontre o que você perdeu de forma fácil e rápida".
- Linhas de 3 "features" com ícone dentro de círculo colorido.
- Textos vagos: "Bem-vindo(a) ao futuro", "Experiência incrível", "Soluções inovadoras".
- Botões pílula (raio total) em tudo. Botão grande e arredondado azul padrão.
- Placeholders tipo "Lorem ipsum" ou nomes "João Silva" repetidos. Use dados de exemplo realistas e variados (ver seção 12).
- Animações chamativas (bounce, pulse infinito, parallax, confete).
- Ilustrações 3D, mascotes e imagens de banco de imagens.
- Tudo perfeitamente simétrico. Pequenas assimetrias intencionais (carimbo girado, etiqueta torta) dão vida, mas só nos elementos de assinatura.
- Inventar dados que a API não fornece (status do item, nome do usuário logado, categorias, contagem de visualizações etc.).

## 3. Cores

Usar sempre via variáveis CSS. Nunca escrever hex solto nos componentes.

| Token | Hex | Uso |
| --- | --- | --- |
| `--papel` | `#F6F1E7` | Fundo geral da página |
| `--superficie` | `#FFFDF8` | Cards, inputs, modais |
| `--kraft` | `#E9DCC0` | Faixas, canhoto, áreas de destaque suave |
| `--tinta` | `#1F1B16` | Texto principal, bordas fortes, sombra dura |
| `--tinta-suave` | `#5C554B` | Texto secundário, legendas |
| `--linha` | `#D9D0BF` | Bordas leves, divisores |
| `--urucum` | `#C73A15` | Ação primária, links, foco de atenção |
| `--urucum-escuro` | `#A62E0E` | Hover/pressed do primário |
| `--mata` | `#1F5C4A` | Carimbo de data, sucesso |
| `--mata-claro` | `#DDEBE3` | Fundo de sucesso |
| `--fita` | `#F2B632` | Fita adesiva, destaque decorativo (nunca texto sobre fundo claro) |
| `--erro` | `#B3261E` | Erros de formulário |
| `--erro-claro` | `#F9DEDC` | Fundo de erro |
| `--aviso-claro` | `#FBEFC9` | Fundo de aviso (cooldown, limites) |

**Regras de uso**

- Proporção: 70% papel/superfície, 20% tinta, 8% urucum, 2% mata/fita.
- O urucum é raro e valioso. No máximo 1 botão primário por área visível.
- Informação nunca depende só da cor: sempre texto mais ícone.
- Contraste mínimo 4.5:1 para texto. Texto branco só sobre urucum ou mata. Texto tinta sobre fita.

**Modo escuro (opcional, mas se implementar, use exatamente isto):** fundo `#17140F`, superfície `#211D17`, tinta `#F3ECDD`, tinta-suave `#B5AC9C`, linha `#3A342B`, urucum `#F0714A`, mata `#6FC2A3`. Mantém o clima de papel, nunca preto puro.

```css
:root {
  --papel: #F6F1E7;
  --superficie: #FFFDF8;
  --kraft: #E9DCC0;
  --tinta: #1F1B16;
  --tinta-suave: #5C554B;
  --linha: #D9D0BF;
  --urucum: #C73A15;
  --urucum-escuro: #A62E0E;
  --mata: #1F5C4A;
  --mata-claro: #DDEBE3;
  --fita: #F2B632;
  --erro: #B3261E;
  --erro-claro: #F9DEDC;
  --aviso-claro: #FBEFC9;

  --sombra-dura: 3px 3px 0 var(--tinta);
  --sombra-dura-sm: 2px 2px 0 var(--tinta);
  --raio-sm: 6px;
  --raio-md: 10px;
  --raio-lg: 14px;
}
```

## 4. Tipografia

Carregar via Google Fonts com `font-display: swap` e fallback real.

| Papel | Fonte | Fallback | Onde |
| --- | --- | --- | --- |
| Títulos | **Bricolage Grotesque** (600/700) | `system-ui, sans-serif` | H1 a H3, números grandes, nome do produto |
| Texto | **Instrument Sans** (400/500/600) | `system-ui, sans-serif` | Corpo, botões, formulários, navegação |
| Dados | **IBM Plex Mono** (400/500) | `ui-monospace, monospace` | Códigos, IDs, datas, carimbos, 2FA, logs, rótulos |

**Escala (mobile / desktop)**

| Estilo | Mobile | Desktop | Peso | Entrelinha |
| --- | --- | --- | --- | --- |
| Display (só tela de login/vazios) | 34px | 48px | 700 | 1.05 |
| H1 | 28px | 36px | 700 | 1.1 |
| H2 | 22px | 26px | 600 | 1.2 |
| H3 | 18px | 20px | 600 | 1.25 |
| Corpo | 16px | 16px | 400 | 1.55 |
| Pequeno | 14px | 14px | 400 | 1.45 |
| Rótulo mono | 12px | 12px | 500 | 1.3, caixa alta, tracking 0.06em |

Regras: nunca abaixo de 14px para texto útil (12px só em rótulos mono caixa alta). Títulos com `letter-spacing: -0.01em`. Linhas de texto corrido com no máximo 70 caracteres. Sentence case nos títulos (só a primeira letra maiúscula), exceto carimbos.

## 5. Espaçamento, grade e raios

- Base de 4px. Escala: 4, 8, 12, 16, 20, 24, 32, 40, 56, 80.
- Padding lateral da página: 16px (mobile), 24px (tablet), 32px (desktop).
- Largura máxima de conteúdo: 1200px. Formulários e telas de auth: 440px. Detalhe do item: 1040px.
- Grade de itens: 1 coluna (< 480px, card horizontal compacto), 2 colunas (480 a 1023px), 3 colunas (1024 a 1279px), 4 colunas (≥ 1280px). Gap de 16px (mobile) e 24px (desktop).
- Raios: inputs e botões 8px; cards 10px; modais e bottom sheets 14px. Nunca raio total, exceto avatar e o furo da etiqueta.
- Bordas: 1.5px `--tinta` em elementos interativos principais e cards-etiqueta; 1px `--linha` em divisores e elementos secundários.

## 6. Breakpoints e estrutura de navegação

| Nome | Largura | Navegação |
| --- | --- | --- |
| Mobile | 0 a 639px | Barra superior simples + **tab bar inferior** |
| Tablet | 640 a 1023px | Barra superior com menu, sem sidebar; tab bar some |
| Desktop | ≥ 1024px | **Sidebar fixa à esquerda (248px)** + conteúdo |

**Itens de navegação**

| Item | Visitante | Logado |
| --- | --- | --- |
| Itens | Sim | Sim |
| Novo | Não | Sim |
| Relatórios | Sim (rotas públicas) | Sim |
| Registros (logs) | Não | Sim (no mobile, fica dentro de Conta) |
| Conta / Entrar | "Entrar" | "Conta" |

**Mobile (design principal; comece por ele)**

- Topo: 56px, título da tela em Bricolage 20px, ação contextual à direita.
- Tab bar inferior 64px (+ safe-area). Logado: Itens, Novo (botão central destacado em urucum, retangular com raio 10px, levemente elevado), Relatórios, Conta. Visitante: Itens, Relatórios, Entrar. Ícone de traço + rótulo de 12px. Item ativo com sublinhado grosso de 3px em urucum, não com bolha.
- Alvos de toque mínimo 44x44px. Espaço mínimo de 8px entre alvos.
- Respeitar `env(safe-area-inset-*)` e `viewport-fit=cover`.
- Formulários em uma coluna, botão primário fixo no rodapé quando o form for longo.
- Filtros e ordenação abrem em **bottom sheet** com raio 14px no topo e alça.

**Desktop**

- Sidebar papel-kraft com logotipo no topo, itens de navegação com ícone + texto, rodapé com o e-mail do usuário logado e botão Sair (ou botão "Entrar" para visitantes). Item ativo: fundo `--superficie`, borda 1.5px tinta, sombra dura pequena.
- Conteúdo em grade, cabeçalho de página com título H1 à esquerda e ações à direita.
- Filtros ficam numa barra horizontal acima da grade, não em sheet.
- Detalhe do item em duas colunas: foto grande à esquerda (55%), dados e ações à direita.
- Atalhos: `/` foca a busca, `N` abre novo item (só logado).

## 7. Logo e marca

- Wordmark "O Cadê?" em Bricolage Grotesque 700. O "?" em urucum.
- Ícone: etiqueta de barbante (retângulo com cantos superiores cortados e um furo) contendo um "?" em traço. Desenhar em SVG, 2px de traço, cor tinta.
- Favicon: a etiqueta em urucum com o "?" em papel.
- Nunca usar lupa genérica como logo.

## 8. Ícones e imagens

- Biblioteca única: **Lucide** (`lucide-react`, traço 1.75px, 20px padrão, 24px na tab bar). Cor herda do texto.
- Sem ícones preenchidos, sem emoji, sem misturar bibliotecas.
- Fotos de itens: proporção 4:3, `object-fit: cover`, raio 6px, borda 1px linha. Sem foto (`imageUrl` ausente): placeholder kraft com ícone `package-open` em traço e o texto "Sem foto" em mono.
- Carregamento de imagem: `loading="lazy"`, largura/altura definidas para evitar salto de layout, skeleton kraft pulsando suave.

## 9. Componentes

### 9.1 Botões

| Variante | Estilo | Uso |
| --- | --- | --- |
| Primário | Fundo urucum, texto branco, borda 1.5px tinta, sombra dura-sm. Hover: urucum-escuro. Pressed: sombra some e o botão desloca 2px (translate) | Ação principal da tela |
| Secundário | Fundo superfície, texto tinta, borda 1.5px tinta | Ações alternativas |
| Fantasma | Sem fundo/borda, texto tinta, sublinhado no hover | Ações terciárias, cancelar |
| Perigo | Fundo superfície, texto e borda `--erro`; ao confirmar, preenchido de `--erro` | Excluir |

Altura 44px (mobile) e 40px (desktop); padding horizontal 20px; texto 16px peso 600; verbo no infinitivo ("Registrar item", "Baixar PDF"). Estados obrigatórios: normal, hover, foco, pressed, desabilitado (opacidade 50%, sem sombra), carregando (spinner de 16px à esquerda + texto muda para "Salvando…"; largura não pode mudar).

### 9.2 Campos de formulário

- Rótulo sempre visível acima do campo (nunca só placeholder). Texto 14px peso 600.
- Input: altura 44px, fundo superfície, borda 1.5px tinta, raio 8px, padding 12px.
- Foco: anel de 3px `--fita` por fora da borda + borda tinta (não usar azul).
- Erro: borda `--erro`, mensagem abaixo com ícone `alert-circle` em 14px, texto `--erro`. Mensagem diz como resolver ("Use um e-mail como nome@dominio.com").
- Texto de ajuda em `--tinta-suave` 14px abaixo do campo.
- Senha: botão olho para mostrar/ocultar; mostrar requisitos antes de errar.
- Textarea com contador de caracteres no canto (apenas informativo; a API não define limite máximo).
- Selects nativos estilizados no mobile (melhor teclado/roda); no desktop pode haver menu custom acessível.

### 9.3 Cartão-etiqueta de item (componente principal)

Estrutura, de cima para baixo:

1. Foto 4:3 com o furo da etiqueta sobreposto no canto superior esquerdo (círculo 12px, fundo papel, borda 1.5px tinta) e fita amarela inclinada opcional.
2. Carimbo de data no canto superior direito da foto (`ACHADO · 03 NOV`), girado -3°.
3. Título H3 com o `name` (máx. 2 linhas, reticências).
4. Linha de metadados em mono 12px: ícone `map-pin` + `location`.
5. **Canhoto** (separado por linha tracejada 1.5px): código do item em mono (`#` + os 6 últimos caracteres do `id` em caixa alta, ex.: `#A4F29C`) à esquerda e ação "Ver detalhes" à direita.

Borda 1.5px tinta, raio 10px, sombra dura. Hover desktop: card sobe 2px e a sombra vira 5px 5px 0. Toda a área é clicável (link real, não div com onClick).

No mobile com 1 coluna, usar versão horizontal: foto quadrada de 96px à esquerda, texto à direita, canhoto vira rodapé fino.

### 9.4 Carimbo de data

- Mostra quando o objeto foi achado, usando o campo `date` do item: `ACHADO · 03 NOV` (dia + mês abreviado; incluir o ano só se for diferente do atual: `ACHADO · 03 NOV 2025`).
- Caixa alta, IBM Plex Mono 500, 12px, tracking 0.08em, padding 4px 10px.
- Borda dupla (1.5px + outline 1px com offset 2px) em `--mata`, texto `--mata`, fundo superfície, ícone `stamp` ou `check` à esquerda, rotação -2° a -3°.
- Em listas densas pode ficar sem rotação.
- Animação "batendo" (escala 1.15 → 1) só ao aparecer no detalhe logo após cadastrar.

### 9.5 Busca e filtros

Toda a lista vem de uma vez da API; busca, filtros e ordenação são feitos **no cliente**.

- Campo de busca largo com ícone `search` à esquerda e atalho `/` visível no desktop. Busca em `name`, `description` e `location`, sem diferenciar maiúsculas nem acentos.
- Filtro de período em chips retangulares (raio 6px), baseado em `date`: Todos, Últimos 7 dias, Últimos 30 dias, Mais antigos. Chip ativo preenchido de tinta com texto papel.
- Filtro de local: select com os valores distintos de `location` presentes na lista (ordem alfabética), mais a opção "Todos os locais".
- Ordenação: Mais recentes (padrão, por `date` decrescente), Mais antigos, Nome (A–Z).
- Contador de resultados em mono: "24 itens".
- Guardar busca e filtros na URL (query string) para permitir voltar e compartilhar.
- Estado sem resultado: ver seção 11.

### 9.6 Upload de imagem

- Área tracejada 1.5px (estilo cartão de papelaria), ícone `image-plus`, texto "Toque para escolher uma foto" (mobile) ou "Arraste uma foto ou clique para escolher" (desktop).
- Aceita só JPEG, PNG, WebP e GIF; máximo 5 MB. Mostrar a regra antes do erro, em mono 12px. Validar no cliente antes de enviar.
- Preview imediato com botões "Trocar" e "Remover". "Remover" só descarta a foto escolhida e ainda não enviada.
- Na edição, a foto atual aparece com o botão "Trocar foto". **A API não permite apagar a foto de um item existente**, então não exiba opção de remover a foto já salva.
- Erros específicos: "Esse arquivo tem 7,2 MB. O limite é 5 MB." e "Formato não aceito. Use JPEG, PNG, WebP ou GIF."
- No mobile, oferecer câmera (`accept` + `capture` opcional) e galeria.
- Durante o envio: barra de progresso fina em urucum; botão salvar fica em carregando.

### 9.7 Modal, bottom sheet e confirmação

- Desktop: modal 480px centralizado, raio 14px, borda 1.5px tinta, sombra dura, fundo escurecido `rgba(31,27,22,.5)` sem blur.
- Mobile: bottom sheet com alça de 4x40px.
- Excluir item: modal de confirmação com o nome do item, texto "Isso apaga o registro e a foto. Não dá para desfazer.", botão Perigo "Excluir item" e fantasma "Cancelar". Foco inicial em Cancelar.
- Fechar com Esc, clique fora (desktop) e arrastar (mobile). Prender o foco dentro e devolver ao elemento de origem.

### 9.8 Toasts e avisos

- Toast: faixa superfície com borda 1.5px tinta, sombra dura-sm, ícone à esquerda, some em 5s (erros ficam até fechar). Mobile: acima da tab bar. Desktop: canto inferior direito.
- Aviso inline (cooldown, limite): fundo `--aviso-claro`, borda 1px fita escurecida, texto tinta.
- Usar `aria-live="polite"` (sucesso) e `assertive` (erro).

### 9.9 Tabelas (logs no desktop)

- Cabeçalho em mono 12px caixa alta sobre fundo kraft; linhas com divisor 1px linha; zebra desligada; hover com fundo `--papel`.
- Dados técnicos (hora, método, rota) em mono 14px.
- No mobile a tabela vira lista de cards compactos (hora e método em cima, rota embaixo). Nunca rolagem horizontal para dados principais.

### 9.10 Badges de método HTTP (logs)

GET em mata-claro com texto mata; POST em kraft com texto tinta; PATCH e PUT em aviso-claro com texto tinta; DELETE em erro-claro com texto erro; qualquer outro (OPTIONS, HEAD) em superfície com borda linha e texto tinta-suave. Sempre mono 12px.

## 10. Telas e comportamento

Os detalhes de requisição e resposta de cada tela estão na seção 16.

### 10.1 Login (POST /auth/login)

- Mobile: tela única, logo no topo, formulário logo abaixo. Desktop: duas colunas; esquerda com painel kraft contendo uma composição de 3 etiquetas sobrepostas e levemente giradas com itens de exemplo (decorativa, `aria-hidden`); direita com o formulário (440px).
- Título: "Entre para cuidar dos achados". Campos: e-mail, senha. Botão primário "Continuar". Link "Criar conta" e link fantasma "Ver itens sem entrar".
- Depois de enviar: ir para a tela de 2FA, guardando o `challengeToken` e o e-mail digitado **em memória** (estado da aplicação, nunca localStorage nem URL).
- Erro 400 ou 401: mensagem única e genérica "E-mail ou senha incorretos", nunca dizer qual está errado.
- Erro 503 (falha ao enviar o e-mail com o código): "Não conseguimos enviar o código agora. Tente de novo em instantes."

### 10.2 Cadastro (POST /auth/register)

- Campos: nome (mín. 2 caracteres), e-mail, senha (mín. 8 caracteres; mostrar o requisito antes de errar). Validar no cliente com as mesmas regras.
- Sucesso (201): levar ao login com o e-mail pré-preenchido e toast verde "Conta criada. Agora é só entrar."
- Erro 400: "Confira os dados: nome com pelo menos 2 letras, e-mail válido e senha com 8 caracteres ou mais."
- Erro 500: a API hoje responde 500 também quando o e-mail já está cadastrado, sem diferenciar. Mostrar: "Não conseguimos criar a conta. Se esse e-mail já tem conta, é só entrar." com link para o login (e-mail pré-preenchido).

### 10.3 Verificação em dois fatores (POST /auth/2fa/verify e /resend)

Tela mais importante da autenticação; capriche.

- Se o usuário chegar aqui sem `challengeToken` em memória (ex.: recarregou a página), voltar ao login com o aviso "Por segurança, entre de novo."
- Título: "Digite o código que enviamos"; subtítulo com o e-mail digitado no login parcialmente ocultado (`m***@gmail.com`).
- **6 caixas** de 48x56px (mobile: 44x52px), IBM Plex Mono 24px, borda 1.5px tinta, foco com anel fita. Um único `input` oculto com `autocomplete="one-time-code"` e `inputmode="numeric"` para preencher automático e aceitar colar; as caixas só espelham o valor. Avanço automático, backspace volta, colar distribui os dígitos. Enviar automaticamente ao completar 6 dígitos.
- **Validade:** contador em mono "Código expira em 04:32", começando em `expiresIn` (300 s) recebido no login ou no reenvio. Ao zerar: bloquear as caixas, aviso "O código expirou." e botão "Reenviar código" em destaque (se ainda houver reenvios).
- **Tentativas (controle no cliente):** a API permite 5 tentativas por código, mas não informa quantas restam. Manter um contador local que começa em 5, diminui a cada resposta 401 e volta a 5 após um reenvio bem-sucedido. Mostrar "Código incorreto. Restam 3 tentativas." com shake leve nas caixas. Ao receber 429, bloquear os campos e mostrar "Muitas tentativas. Peça um novo código." (se ainda houver reenvios) ou levar ao login.
- **Reenvio (controle no cliente + resposta da API):** botão secundário "Reenviar código" desabilitado nos primeiros 60 s após o login e após cada reenvio, com texto "Reenviar em 0:42". Se a API responder 429 com `data.retryAfter`, usar esse valor no contador (ele vence o relógio local). Mostrar "Reenvio 1 de 3" com contador local. Após o 3º reenvio, ou se a API responder 429 sem `retryAfter`, desabilitar e mostrar "Limite de reenvios atingido. Entre de novo." com link para o login.
- Após reenvio bem-sucedido: trocar o `challengeToken` pelo novo, reiniciar validade, tentativas e cooldown, limpar as caixas e mostrar toast "Enviamos um novo código."
- Erro 401 com o contador de validade zerado: token expirou; tratar como expiração (acima).
- Sucesso (200): guardar o JWT de sessão (`data.token`) e o e-mail, descartar o `challengeToken`, ir para a rota que o usuário tentava acessar ou para Itens.

### 10.4 Lista de itens (GET /items)

- Rota pública. Cabeçalho: H1 "Achados no balcão", contador, botão "Registrar item" (desktop, só logado) ou botão Novo na tab bar (mobile, só logado).
- Busca, filtros e ordenação conforme 9.5. Ordenação padrão: mais recentes.
- Grade de cartões-etiqueta. Skeletons de 6 cartões no carregamento.
- Visitantes não logados veem a lista e o detalhe, mas não veem botões de criar, editar ou excluir. No topo/sidebar aparece "Entrar" em vez do usuário.
- A API devolve a lista completa (sem paginação). Renderizar todos; se passar de 60 itens, usar "Mostrar mais" no cliente em blocos de 24.

### 10.5 Detalhe do item (GET /items/:id)

- Rota pública. Foto grande (toque abre em tela cheia no mobile), carimbo de data, título H1 (`name`), descrição, local, data completa ("Achado em 3 de novembro de 2026") e código mono.
- Ações para logados: Editar (secundário) e Excluir (perigo, via modal). No mobile, ações num rodapé fixo.
- Exclusão (DELETE, resposta 204): toast "Item excluído" e voltar para a lista.
- 404: tela "Esse item não está mais no balcão" com link de volta (ver seção 11).

### 10.6 Criar e editar item (POST /items, PATCH /items/:id)

- Mobile: formulário em uma coluna com upload no topo. Desktop: duas colunas (upload à esquerda, campos à direita).
- Campos (exatamente os do schema `item.schema.ts`, todos obrigatórios na criação):

| Campo da API | Rótulo | Controle | Regra |
| --- | --- | --- | --- |
| `name` | Nome do objeto | input texto | não vazio (após trim). Ajuda: "Ex.: Garrafa térmica azul-marinho" |
| `description` | Descrição | textarea | não vazio. Ajuda: "Cor, marca, detalhes que ajudem o dono a reconhecer" |
| `location` | Onde foi achado | input texto com sugestões (`datalist`) dos locais já usados | não vazio |
| `date` | Data em que foi achado | input `type="date"` | formato `AAAA-MM-DD`; padrão hoje; não permitir data futura |
| `image` | Foto (opcional) | upload (9.6) | JPEG/PNG/WebP/GIF, até 5 MB |

- Enviar sempre como `multipart/form-data`.
- Edição: campos pré-preenchidos, enviar só o que mudou (PATCH parcial). Se nada mudou e não há foto nova, o botão "Salvar alterações" fica desabilitado. Trocar foto mostra a nova no lugar da antiga.
- Erros 400 de validação vêm com `data` = lista de issues do Zod (`path[0]` é o nome do campo): ligar cada mensagem ao campo correspondente. Erros 400 de upload vêm só com `message`: mostrar no componente de upload.
- Erro 502 ou 503 ao salvar com foto: "Não conseguimos guardar a foto agora. Tente de novo ou salve sem foto." mantendo os dados preenchidos.
- Botão "Registrar item" / "Salvar alterações" em carregando durante o envio; impedir duplo clique. Sucesso: toast "Item registrado" (ou "Alterações salvas") e ir para o detalhe.
- Aviso ao sair com alterações não salvas.

### 10.7 Relatórios e exportação (GET /items/report e /items/export)

Rotas públicas. Tela com dois blocos lado a lado no desktop, empilhados no mobile, cada um num cartão-etiqueta:

1. **Relatório em PDF:** descrição curta ("Lista de todos os objetos guardados no balcão, pronta para imprimir."), botão "Baixar PDF". Estado de carregamento "Gerando relatório…". Baixar como `relatorio-itens.pdf`.
2. **Exportar CSV:** campos Data inicial (`from`) e Data final (`to`) com seletor de data nativo (ambos opcionais), escolha de delimitador em controle segmentado (vírgula `,` ou ponto e vírgula `;`, padrão `;`, com dica "Use ponto e vírgula para abrir no Excel em português"), botão "Baixar CSV". Validar que a data inicial não é maior que a final. Após baixar, toast com o total lido do header `X-Total-Count`: "24 itens exportados".

Baixar via `fetch` (enviando o token se houver), `blob` e link temporário, usando o nome do arquivo do header `Content-Disposition`. Tratar erro com toast.

### 10.8 Registros de acesso (GET /logs/:date)

- Tela só para usuários logados. Seletor de data (padrão: hoje no fuso escolhido) e indicação do fuso usado, enviado no header `x-timezone` (padrão `Intl.DateTimeFormat().resolvedOptions().timeZone`). Permitir trocar o fuso num select (`Intl.supportedValuesOf('timeZone')`).
- Cabeçalho com `meta.total` em mono: "38 registros em 03/11/2026 · America/Fortaleza".
- Tabela (desktop) ou lista de cards (mobile) com **hora** (convertida de `timestamp` para o fuso escolhido, `HH:mm:ss`), **método** (badge) e **rota**. A API não informa status HTTP nem usuário; não exibir essas colunas. Mais recentes primeiro, estilo "livro de registro" em mono.
- Filtro rápido por método em chips (Todos, GET, POST, PATCH, DELETE), no cliente.
- Vazio: "Nenhum registro neste dia". Os logs ficam em memória e podem sumir; avisar em texto pequeno: "Registros ficam guardados apenas enquanto o servidor estiver ligado."
- Erro 400 (data ou fuso inválido): mensagem inline junto ao campo.

### 10.9 Conta

- A API não tem rota para dados do usuário. Mostrar apenas o e-mail usado no login (guardado junto com o token) e a validade da sessão, lida do campo `exp` do JWT (decodificar o payload só para exibição): "Sua sessão vale até 04/11/2026, 23:31".
- No mobile, link para "Registros de acesso".
- Botão "Sair": limpa token e e-mail e volta ao login. Não exibir nome do usuário.

## 11. Estados especiais (fazem a diferença)

Cada um com título curto, uma frase explicando e uma saída. Ilustração: composição simples em SVG de traço com etiquetas e barbante, 1 a 2 cores, nunca 3D.

| Situação | Gatilho | Título | Texto de apoio |
| --- | --- | --- | --- |
| Lista vazia | `data` vazio em GET /items | "O balcão está vazio" | "Ainda não há objetos registrados." + botão "Registrar item" (só logado) |
| Busca sem resultado | filtros do cliente zeram a lista | "Nada com esse nome" | "Tente outra palavra ou limpe os filtros." + botão Limpar filtros |
| 404 | GET /items/:id → 404 | "Esse item não está mais no balcão" | "Pode ter sido devolvido ou removido." + link Voltar à lista |
| **403 fim de semana** | qualquer rota → 403 | "O balcão fecha no fim de semana" | "O sistema volta a atender na segunda-feira." Sem botão de tentar de novo. Estilo: placa pendurada de "Fechado" em SVG. Substitui o app inteiro, inclusive login |
| **503 banco indisponível** | GET → 503 com "Banco de dados indisponível" | "Estamos arrumando as gavetas" | "Não conseguimos acessar os dados agora. Tente de novo em instantes." + botão Tentar novamente |
| 401 / sessão expirada | rota protegida → 401 com token presente | "Sua sessão acabou" | "Entre de novo para continuar." + redirecionar ao login guardando a rota |
| Sem conexão | `navigator.onLine === false` ou `fetch` lança erro de rede | Faixa fina no topo | "Você está sem internet." |
| Erro inesperado | 500 ou resposta fora do formato | "Algo saiu do lugar" | "Já estamos de olho. Tente novamente." |

Sempre mapear os códigos HTTP da API (400, 401, 403, 404, 429, 502, 503) para estes estados ou para as mensagens de cada tela; nunca mostrar JSON cru ou "Error 500". O 503 também pode vir do upload (Cloudinary) e do e-mail do 2FA: nesses casos usar a mensagem da tela (10.1, 10.6), não a tela cheia.

O bloqueio de fim de semana usa o relógio do **servidor** (UTC em produção). No Brasil, ele pode começar na sexta à noite (21h em Brasília). O front não deve tentar prever isso; só reagir ao 403.

## 12. Textos (tom de voz)

- Português do Brasil, segunda pessoa informal ("você"), frases curtas, voz ativa.
- Sem exclamações em excesso, sem emojis, sem jargão técnico para o usuário.
- Botões com verbo claro: "Registrar item", "Salvar alterações", "Baixar CSV", "Entrar".
- Mensagens de erro: o que aconteceu + como resolver.
- Datas no formato brasileiro (`03/11/2026`, e "3 de nov." em listas), horário 24h, fuso do usuário.
- O campo `date` da API é uma data sem horário (`AAAA-MM-DD`). Formatar sem converter fuso (não usar `new Date('2026-11-03')`, que vira o dia anterior no Brasil).

**Dados de exemplo realistas (para telas e testes):** Carteira de couro marrom (Biblioteca Central), Chaveiro com 3 chaves e um pingente de coruja (Bloco B), Garrafa térmica azul-marinho (Quadra), Fone de ouvido sem fio branco (Cantina), Guarda-chuva preto quebrado (Portaria), Cartão de ônibus com nome "M. Alves" (Pátio), Óculos de grau com armação redonda (Sala 12), Mochila cinza com chaveiro de pelúcia (Ginásio). Variar locais, datas, descrições e presença de foto. Nunca repetir nomes de pessoas.

## 13. Movimento

- Duração 120 a 200ms, easing `cubic-bezier(.2,.7,.2,1)`. Só `transform` e `opacity`.
- Permitido: hover de card, entrada do modal (sobe 8px + fade), troca de foto, shake leve de 200ms nas caixas do 2FA ao errar, carimbo "batendo" (escala 1.15 para 1) ao aparecer após cadastro.
- Proibido: loops infinitos além de skeleton e spinner, animações de entrada em todos os cards, parallax.
- Respeitar `prefers-reduced-motion: reduce` (desligar tudo que não for essencial).

## 14. Acessibilidade (não negociável)

- Contraste AA em todos os textos e controles. Foco sempre visível (anel fita 3px + borda tinta), nunca `outline: none` sem substituto.
- HTML semântico: `header`, `nav`, `main`, `button` para ações, `a` para navegação, `label` ligado ao campo, uma única `h1` por tela.
- Navegação completa por teclado, ordem de foco lógica, modal com foco preso.
- Imagens de itens com `alt` descritivo (nome do item); decorativas com `alt=""` e `aria-hidden`.
- Erros ligados ao campo com `aria-describedby` e `aria-invalid`. Mensagens e contadores anunciados com `aria-live`.
- Informação com mais do que cor (texto + ícone).
- Suportar zoom até 200% sem quebrar layout; unidades `rem` para tipografia.

## 15. Implementação técnica

**Stack e estrutura**

- Pasta `web/` na raiz do repositório, adicionada ao `pnpm-workspace.yaml` (o back-end continua em `src/`, sem alterações).
- Vite + React + TypeScript + React Router + `lucide-react`. CSS puro com variáveis (CSS Modules ou um arquivo por componente). Sem biblioteca de componentes, sem Tailwind com tema padrão, sem CSS-in-JS pesado.
- Mobile-first: estilos base para mobile, `min-width` para ampliar.
- Tokens em variáveis CSS (seção 3). Sem valores soltos de cor, espaçamento ou raio nos componentes.
- Usar o mesmo componente para o mesmo padrão (um `Button`, um `Field`, um `ItemCard`, um `DateStamp`, um `EmptyState`, um `Modal`, um `Toast`, um `ImageUpload`). Não duplicar estilo.
- Meta viewport: `width=device-width, initial-scale=1, viewport-fit=cover`.

**Comunicação com a API (obrigatório: mesma origem)**

O back-end aplica o CORS **depois** dos middlewares de fim de semana e de banco. Se o front chamar a API em outra origem, as respostas 403 e 503 chegam sem cabeçalho CORS e o navegador as bloqueia: o front veria só um "erro de rede" e não conseguiria mostrar as telas da seção 11. Por isso, o front **sempre** chama a API pelo prefixo relativo `/api`, na mesma origem:

- Desenvolvimento: proxy do Vite.

  ```ts
  // web/vite.config.ts
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  ```

- Produção: projeto Vercel separado para `web/`, com rewrite para a API e fallback da SPA.

  ```json
  // web/vercel.json
  {
    "rewrites": [
      { "source": "/api/:path*", "destination": "https://<url-da-api>/:path*" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

- Base URL configurável por `VITE_API_URL`, com padrão `/api`.

**Cliente de API único (`web/src/api/client.ts`)**

- Todas as chamadas passam por ele. Envia `Authorization: Bearer <token>` quando houver sessão; o `challengeToken` só é enviado nas rotas `/auth/2fa/*`.
- Lê o envelope `{ success, code, message, data, meta }` e lança um erro tipado com `status`, `message`, `data` e `retryAfter`.
- Trata de forma centralizada: 401 em rota protegida (encerra sessão e redireciona ao login guardando a rota), 403 (tela de fim de semana), 503 em GET (tela de gavetas), erro de rede (faixa de sem conexão). As telas tratam 400, 404, 429 e 502 no contexto delas.
- Não usar `Content-Type` manual em `FormData` (o navegador define o boundary).

**Sessão**

- JWT de sessão e e-mail em `sessionStorage` (sobrevive a recarregar a aba, some ao fechá-la). `challengeToken` só em memória; nunca em URL ou storage.
- Ao iniciar, se o `exp` do token já passou, limpar a sessão. A duração vem do servidor (`JWT_EXPIRES_IN`); não assumir um valor fixo.

**Qualidade**

- Performance: imagens lazy, fontes com `display=swap` e apenas os pesos usados. Layout sem salto (CLS) e alvo de 90+ no Lighthouse.
- Sem dependências desnecessárias: não trazer biblioteca de componentes que imponha outra identidade visual.

## 16. Contrato da API (estado atual — fonte da verdade)

Todas as respostas JSON seguem o envelope:

```ts
type ApiResponse<T> = {
  success: boolean;
  code: number;        // igual ao status HTTP
  message: string;     // em português, pode ser exibida em toasts quando não houver texto melhor
  data?: T;
  meta?: unknown;      // só em /logs
};
```

Middlewares globais, em ordem, para **todas** as rotas: registro de log → bloqueio de fim de semana (403) → conexão com o banco (503 "Banco de dados indisponível").

**Tipos**

```ts
type Item = {
  id: string;            // UUID
  name: string;
  description: string;
  location: string;
  date: string;          // 'AAAA-MM-DD'
  imageUrl?: string;     // URL https do Cloudinary
  imagePublicId?: string;
};

type RequestLog = {
  id: string;
  method: string;        // 'GET' | 'POST' | 'PATCH' | 'DELETE' | ...
  route: string;         // URL original, com query string
  timestamp: string;     // ISO 8601 em UTC
  timezone?: string;     // valor do header x-timezone enviado na requisição
};
```

**Autenticação**

| Rota | Envio | Sucesso | Erros |
| --- | --- | --- | --- |
| `POST /auth/register` | JSON `{ name (≥2), email, password (≥8) }` | 201 `data: { id, name, email }` | 400 dados inválidos; 500 qualquer outro erro (inclui e-mail duplicado) |
| `POST /auth/login` | JSON `{ email, password }` | 200 `data: { twoFactorRequired: true, challengeToken, expiresIn: 300 }` | 400/401 "E-mail ou senha inválidos"; 503 falha no envio do e-mail |
| `POST /auth/2fa/verify` | Header `Authorization: Bearer <challengeToken>`; JSON `{ code: '123456' }` | 200 `data: { token }` (JWT de sessão) | 400 código fora do formato; 401 "Código inválido ou expirado" ou "Token inválido ou expirado"; 429 5 tentativas esgotadas |
| `POST /auth/2fa/resend` | Header `Authorization: Bearer <challengeToken>` | 200 `data: { challengeToken (novo), expiresIn: 300, retryAfter: 60 }` | 401 token inválido; 429 com `data.retryAfter` e header `Retry-After` (cooldown de 60 s) ou sem eles (limite de 3 reenvios); 503 falha no e-mail |

Regras do 2FA no servidor: código de 6 dígitos válido por 5 min; 5 tentativas por código; reenvio zera as tentativas e renova a validade; intervalo mínimo de 60 s entre envios; no máximo 3 reenvios por login; um novo login invalida o desafio anterior.

**Itens**

| Rota | Auth | Envio | Sucesso | Erros |
| --- | --- | --- | --- | --- |
| `GET /items` | Não | — | 200 `data: Item[]` (sem paginação, sem ordenação garantida) | 500 |
| `GET /items/:id` | Não | — | 200 `data: Item` | 404 "Item não encontrado" |
| `POST /items` | Sim | `multipart/form-data`: `name`, `description`, `location`, `date`, `image?` | 201 `data: Item` | 400 validação (`data` = issues do Zod) ou upload (só `message`); 401; 502 falha no upload; 503 Cloudinary não configurado |
| `PATCH /items/:id` | Sim | `multipart/form-data` com qualquer subconjunto dos campos e/ou `image` (ao menos um) | 200 `data: Item` | 400; 401; 404; 502; 503 |
| `DELETE /items/:id` | Sim | — | 204 sem corpo | 401; 404 |

Upload: campo `image`, um arquivo, `image/jpeg`, `image/png`, `image/webp` ou `image/gif`, até 5 MB. Trocar a imagem apaga a anterior na nuvem. Não existe rota para apenas remover a imagem.

**Relatórios**

| Rota | Auth | Envio | Sucesso |
| --- | --- | --- | --- |
| `GET /items/report` | Não | — | 200 `application/pdf`, `Content-Disposition: attachment; filename=relatorio-itens.pdf` |
| `GET /items/export` | Não | Query opcional: `from`, `to` (`AAAA-MM-DD`), `delimiter` (`,` ou `;`) | 200 `text/csv` com BOM UTF-8, `Content-Disposition: attachment; filename="itens-AAAA-MM-DD.csv"`, header `X-Total-Count` |

Erros: 400 parâmetros inválidos (export); 500 em JSON.

**Logs**

| Rota | Auth | Envio | Sucesso | Erros |
| --- | --- | --- | --- | --- |
| `GET /logs/:date` | Sim | `:date` = `AAAA-MM-DD`; header opcional `x-timezone` (IANA, padrão `UTC`) | 200 `meta: { date, timezone, total }`, `data: RequestLog[]` | 400 data ou fuso inválido; 401 |

Os logs ficam na memória do servidor: somem quando ele reinicia e, em produção serverless, cada instância tem os seus.

**O que a API NÃO oferece (não implementar no front)**

- Status do item (perdido/achado/devolvido), categorias, dono, contato ou histórico.
- Dados do usuário logado (`/auth/me`), edição de perfil, troca ou recuperação de senha.
- Paginação, busca ou ordenação no servidor.
- Remoção isolada da foto de um item.
- Contagem de tentativas ou reenvios restantes no 2FA (calcular no cliente).

## 17. Ordem de implementação

Fazer em etapas, um PR por etapa. Cada etapa só começa com a anterior revisada.

| Etapa | Entrega | Seções |
| --- | --- | --- |
| 1. Base | `web/` no workspace, Vite + proxy, tokens, fontes, logo/favicon, rotas, layout (tab bar + sidebar), cliente de API, sessão | 3–8, 15, 16 |
| 2. Componentes | Todos os componentes da seção 9 e uma página `/dev` que mostra cada um em todos os estados | 9, 13, 14 |
| 3. Autenticação | Login, cadastro, 2FA, Conta | 10.1–10.3, 10.9 |
| 4. Itens | Lista com busca e filtros, detalhe, criar/editar, excluir | 10.4–10.6, 12 |
| 5. Relatórios e registros | PDF, CSV, logs | 10.7, 10.8 |
| 6. Acabamento | Estados especiais, sem conexão, acessibilidade, Lighthouse, checklist | 11, 14, 18 |

As etapas 3, 4 e 5 podem ser feitas em paralelo depois da etapa 2.

## 18. Checklist final antes de entregar

- [ ] Parece um balcão de achados e perdidos e não um template genérico?
- [ ] Cartão-etiqueta, canhoto e carimbo de data presentes e consistentes?
- [ ] Nenhum gradiente, glassmorphism, emoji ou fonte Inter/Roboto?
- [ ] Só variáveis de cor e as 3 fontes definidas?
- [ ] Funciona em 360px de largura e em 1440px, sem rolagem horizontal?
- [ ] Tab bar no mobile, sidebar no desktop, navegação diferente para visitante e logado?
- [ ] Alvos de toque de 44px e foco visível?
- [ ] 2FA com validade, tentativas e reenvio corretos, incluindo `retryAfter` da API?
- [ ] Estados vazio, carregando, erro, 403 fim de semana e 503 tratados (testados via proxy na mesma origem)?
- [ ] Nenhum campo ou dado que não exista no contrato da seção 16?
- [ ] Datas `AAAA-MM-DD` exibidas sem deslocamento de fuso?
- [ ] Textos em português do Brasil, com dados de exemplo variados e realistas?
- [ ] Contraste AA e `prefers-reduced-motion` respeitados?

## 19. Prompt mestre (copie e cole na IA que for construir)

> Você vai construir o front-end do "O Cadê?", um sistema de Achados e Perdidos (API REST Node/Express com JWT + 2FA por e-mail), na pasta `web/` (Vite + React + TypeScript), **sem alterar o back-end**. Siga integralmente o documento "O Cadê? — Design System"; a seção 16 (Contrato da API) é a fonte da verdade e você não deve inventar campos, rotas ou respostas. Conceito: balcão físico de achados e perdidos, com cartões em forma de etiqueta (furo, canhoto tracejado), carimbo de data girado ("ACHADO · 03 NOV"), sombras duras sem blur, papel off-white e tinta. Itens não têm status: todos são objetos guardados no balcão. Cores: papel #F6F1E7, tinta #1F1B16, urucum #C73A15 (ação), mata #1F5C4A (carimbo/sucesso), fita #F2B632 (detalhe). Fontes: Bricolage Grotesque (títulos), Instrument Sans (texto), IBM Plex Mono (dados). Ícones Lucide. Mobile-first com tab bar inferior no mobile e sidebar de 248px no desktop (≥1024px). A API é sempre chamada pelo prefixo `/api` na mesma origem (proxy do Vite em dev, rewrite da Vercel em produção) para que os erros 403 e 503 sejam legíveis. Proibido: gradientes, glassmorphism, emoji, Inter/Roboto, cards genéricos idênticos, textos vagos de marketing. Implemente na ordem da seção 17: base, componentes, autenticação (login, cadastro, 2FA com 6 caixas e contadores no cliente, conta), itens (lista com busca/filtros no cliente, detalhe, criar/editar com upload, excluir), relatórios PDF/CSV, registros de acesso e estados especiais (vazio, 404, 403 de fim de semana, 503, sessão expirada, sem conexão). Português do Brasil. Acessibilidade AA. Ao terminar, rode o checklist da seção 18.
