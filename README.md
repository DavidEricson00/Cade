<div align="center">
  <img src="https://i.imgur.com/Zh6qUPo.png" alt="Cadê? Logo" width="250"/>
  <h1>Cadê? - Lost & Found API</h1>
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## 📌 About the Project

**Cadê?** is a RESTful API designed to manage lost and found items effectively. It provides a simple and structured way to register, search, and remove found items, organizing data to streamline returning lost belongings to their rightful owners. 

The project was built with an emphasis on REST API design best practices, custom middleware architecture, data validation, report generation, and serverless deployment.

---

## ✨ Features

- 📦 **CRUD Operations**: Complete management for lost and found items (stored in memory/mock data).
- 📅 **Business Days Middleware**: Access restrictions ensuring the API only operates Monday through Friday.
- 📝 **Audit & Logging Middleware**: Automatic logging of incoming request timestamps, HTTP methods, and routes.
- 🔍 **Log Filtering**: Dedicated endpoint to query and retrieve request logs for specific dates.
- 📄 **Dynamic PDF Reports**: PDFKit integration allowing users to generate and download a PDF report of all registered items.

---

## 🛠️ Tech Stack

- **[Node.js](https://nodejs.org/)** (v18+) - JavaScript Runtime Engine
- **[TypeScript](https://www.typescriptlang.org/)** - Strongly Typed Programming Language
- **[Express](https://expressjs.com/)** - Web Framework for Node.js
- **[Zod](https://zod.dev/)** - TypeScript-first Schema Validation
- **[PDFKit](https://pdfkit.org/)** - Dynamic PDF Document Generation
- **[Vercel](https://vercel.com/)** - Serverless Cloud Deployment
- **[pnpm](https://pnpm.io/)** - Fast, Disk Space Efficient Package Manager with Workspaces support

---

## 🚀 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/items` | List all registered items |
| `POST` | `/items` | Register a new found item |
| `GET` | `/items/:id` | Get a specific item by its ID |
| `DELETE` | `/items/:id` | Remove an item |
| `GET` | `/logs/:date` | Get request logs for a specific date |
| `GET` | `/items/report` | Generate and download a PDF report of all items |

---

## 💻 Getting Started

### Prerequisites

Ensure you have the following installed on your environment:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager

### Local Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DavidEricson00/Cade.git
   cd Cade
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

The server will be running locally at `http://localhost:3000`.
