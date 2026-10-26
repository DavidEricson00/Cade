<div align="center">
  <img src="https://i.imgur.com/Zh6qUPo.png" alt="Cadê? Logo" width="250"/>
  <h1>Cadê? - API de Achados e Perdidos</h1>
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## 📌 Sobre o Projeto

O **Cadê?** é uma API REST desenvolvida para gerenciar itens perdidos e achados com eficiência. Oferece uma forma simples e estruturada de cadastrar, consultar e remover itens encontrados, organizando as informações para facilitar a devolução de pertences aos seus donos.

O projeto foi construído seguindo boas práticas de design de APIs REST, arquitetura de middlewares customizados, validação de dados com schemas, geração de relatórios e deploy serverless.

---

## ✨ Funcionalidades

- 📦 **Operações CRUD**: Gerenciamento completo de itens achados e perdidos.
- 📅 **Middleware de Dias Úteis**: Restrição de acesso garantindo funcionamento da API apenas de segunda a sexta-feira.
- 📝 **Middleware de Auditoria e Logs**: Registro automático de timestamps, métodos HTTP e rotas de cada requisição recebida.
- 🔍 **Filtro de Logs**: Endpoint dedicado para consultar e filtrar logs de requisições por datas específicas e timezones.
- 📄 **Relatórios em PDF**: Integração com PDFKit para gerar e baixar relatórios dinâmicos dos itens cadastrados.
- ☁️ **Armazenamento de Imagens em Nuvem**: Envio de fotos dos itens direto para o Cloudinary (stream em memória, sem escrita em disco — compatível com serverless).
- 📊 **Exportação em CSV**: Endpoint para download dos dados em formato CSV (suporte ao botão de exportação).

---

## 🛠️ Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/)** (v18+) - Ambiente de execução JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Express](https://expressjs.com/)** - Framework web para Node.js
- **[Zod](https://zod.dev/)** - Validação de esquemas e dados com foco em TypeScript
- **[PDFKit](https://pdfkit.org/)** - Geração dinâmica de documentos PDF
- **[Cloudinary](https://cloudinary.com/)** + **[Multer](https://github.com/expressjs/multer)** - Upload e armazenamento de imagens na nuvem
- **[Vercel](https://vercel.com/)** - Deploy e hospedagem em nuvem serverless
- **[pnpm](https://pnpm.io/)** - Gerenciador de pacotes rápido e eficiente com suporte a workspaces

---

## 🚀 Rotas da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/items` | Lista todos os itens cadastrados |
| `POST` | `/items` | Cadastra um novo item (JSON ou `multipart/form-data` com imagem opcional) |
| `GET` | `/items/:id` | Retorna os detalhes de um item pelo ID |
| `PUT` | `/items/:id/image` | Adiciona ou substitui a foto de um item existente |
| `DELETE` | `/items/:id` | Remove um item (e sua respectiva imagem na nuvem) |
| `GET` | `/logs/:date` | Consulta logs de requisições por data |
| `GET` | `/items/report` | Gera e faz download do relatório em PDF de todos os itens |
| `GET` | `/items/export` | Exporta e faz download dos dados em formato CSV |

---

## 📖 Como Fazer Requisições

### ☁️ Upload de Imagem na Nuvem (Cloudinary)

Para cadastrar itens com foto, envie a requisição como `multipart/form-data`. O campo `image` é opcional no cadastro.

```bash
# Cadastrar novo item com imagem
curl -X POST http://localhost:3000/items \
  -F name="Mochila preta" \
  -F description="Mochila com cadernos" \
  -F location="Biblioteca" \
  -F date=2026-10-20 \
  -F image=@mochila.jpg

# Atualizar/trocar a foto de um item existente
curl -X PUT http://localhost:3000/items/<id>/image \
  -F image=@nova-foto.png
```

- **Formatos aceitos**: `jpeg`, `png`, `webp`, `gif` (máximo **5MB**).
- **Retorno**: inclui `imageUrl` (URL HTTPS pública e segura) e `imagePublicId`.
- **Tratamento de erros**: `400` formato/tamanho inválido, `404` item não encontrado, `502` falha no upload da nuvem, `503` Cloudinary não configurado.

---

### 📊 Exportação de Dados em CSV

O endpoint `GET /items/export` retorna o arquivo `text/csv` anexado para download (`itens-AAAA-MM-DD.csv`).

| Parâmetro de Query | Descrição | Exemplo |
| :--- | :--- | :--- |
| `from` | Filtra itens com data maior ou igual ao valor | `2026-09-01` |
| `to` | Filtra itens com data menor ou igual ao valor | `2026-09-30` |
| `delimiter` | Delimitador `,` (padrão) ou `;` (Excel pt-BR) | `;` |

> **Detalhes técnicos**: O arquivo CSV inclui BOM UTF-8 (acentuação abre correta no Excel brasileiro), respeita a norma RFC 4180 e neutraliza injeções de fórmulas (`=`, `+`, `-`, `@`). O header `X-Total-Count` informa o total de linhas exportadas.

```bash
# Baixar todos os itens em CSV (separado por vírgula)
curl -OJ http://localhost:3000/items/export

# Baixar usando ponto e vírgula (ideal para abrir no Excel em português)
curl -OJ "http://localhost:3000/items/export?delimiter=;"

# Filtrar por intervalo de datas
curl -OJ "http://localhost:3000/items/export?from=2026-09-01&to=2026-09-30&delimiter=;"
```

---

### 📋 Outras Requisições (CRUD & Relatórios)

```bash
# Listar todos os itens cadastrados
curl http://localhost:3000/items

# Buscar um item específico por ID
curl http://localhost:3000/items/<id>

# Remover um item existente (remove também a foto da nuvem)
curl -X DELETE http://localhost:3000/items/<id>

# Baixar o relatório em PDF
curl -OJ http://localhost:3000/items/report

# Consultar logs de requisições de um dia específico
curl http://localhost:3000/logs/2026-10-26
```

---

## 💻 Como Executar Localmente

### Pré-requisitos

Certifique-se de ter instalado no seu ambiente:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes [pnpm](https://pnpm.io/)

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/DavidEricson00/Cade.git
   cd Cade
   ```

2. **Instalar as dependências:**
   ```bash
   pnpm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   ```bash
   cp .env.example .env
   ```
   Abra o arquivo `.env` e preencha as credenciais obtidas no painel do [Cloudinary](https://cloudinary.com/) (em Dashboard → API Keys):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_FOLDER=cade/items` *(opcional, pasta padrão)*

4. **Iniciar o servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

O servidor estará rodando em `http://localhost:3000`.
