# Cadê?

O **Cadê?** é uma API REST para gerenciamento de itens perdidos e encontrados. A proposta é oferecer uma forma simples de cadastrar, consultar e remover objetos encontrados, permitindo que as informações sejam organizadas e posteriormente utilizadas para facilitar a localização de seus proprietários.

## Funcionalidades

A API deverá disponibilizar:

* Listagem de todos os itens cadastrados;
* Cadastro de novos itens encontrados;
* Exclusão de itens;
* Consulta de um item específico por meio de seu código de identificação;
* Middleware para restringir o acesso à API aos dias úteis, de segunda a sexta-feira;
* Middleware para registrar informações sobre cada requisição realizada, incluindo horário e rota acessada;
* Consulta dos registros de requisições realizadas em uma determinada data;
* Geração e download de um relatório em PDF contendo a lista de itens cadastrados;
* Dados inicialmente armazenados de forma mockada, diretamente no código da aplicação;
* Versionamento do projeto utilizando Git e GitHub;
* Disponibilização da API em um ambiente de nuvem.

O projeto foi desenvolvido como uma aplicação acadêmica, com foco na aplicação prática dos conceitos de **APIs REST, métodos HTTP, middlewares, manipulação de dados, geração de arquivos, versionamento e deploy em nuvem**.

## Stack

* **Node.js** — Runtime
* **TypeScript** — Linguagem
* **Express** — Framework para API REST
* **Zod** — Validação de dados
* **PDFKit** — Geração de arquivos PDF
* **Git + GitHub** — Versionamento
* **Vercel** — Deploy em nuvem

## Como executar localmente

### Pré-requisitos

* [Node.js](https://nodejs.org/) (v18 ou superior)
* [pnpm](https://pnpm.io/)

### Passos

```bash
# Clone o repositório
git clone https://github.com/DavidEricson00/Cade.git
cd Cade

# Instale as dependências
pnpm install

# (Opcional) Crie o arquivo .env com base no exemplo
cp .env.example .env

# Inicie o servidor em modo de desenvolvimento
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`.

### Testando o relatório PDF

```bash
# Baixar o relatório via curl
curl -o relatorio.pdf http://localhost:3000/items/report

# Ou abra diretamente no navegador
# http://localhost:3000/items/report
```

## Versão publicada

> A URL da versão publicada será adicionada após o deploy na Vercel.

## Rotas da API

| Método   | Rota            | Descrição                              |
| -------- | --------------- | -------------------------------------- |
| `GET`    | `/items`        | Lista todos os itens cadastrados       |
| `POST`   | `/items`        | Cadastra um novo item                  |
| `GET`    | `/items/:id`    | Busca um item pelo ID                  |
| `DELETE` | `/items/:id`    | Remove um item                         |
| `GET`    | `/logs/:date`   | Consulta os logs de uma data           |
| `GET`    | `/items/report` | Gera e faz download do relatório em PDF |
