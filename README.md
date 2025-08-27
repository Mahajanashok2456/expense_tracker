# enpenso - Expense Tracker

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)

A modern, privacy-first, client-side expense tracking application with full CRUD functionality, an analytics dashboard, and robust data export capabilities. All your financial data is stored securely in your browser's local storage, ensuring complete privacy.

**Live Demo:** [Deploy your own to see it live!](#deployment)

 
*(Replace with a screenshot of your application)*

---

## ✨ Core Features

*   **Privacy First:** No accounts, no servers. All data is stored exclusively in your browser's `localStorage`.
*   **Transaction Management (CRUD):** Easily create, read, update, and delete income and expense transactions.
*   **Category Management (CRUD):** Organize your spending by creating custom categories with unique names, colors, and icons.
*   **Interactive Dashboard:** Visualize your financial health with an overview of income, expenses, balance, and a pie chart breakdown of spending by category.
*   **Advanced Filtering & Search:** Quickly find transactions by searching notes, filtering by category, or selecting a date range.
*   **Receipt Uploads:** Attach image receipts to your transactions for detailed record-keeping.
*   **Data Export:** Export your financial data at any time.
    *   **CSV:** For use in spreadsheets.
    *   **JSON:** For backup or data migration.
    *   **PDF:** Generate a printable report of your dashboard.
*   **Responsive & Modern UI:** A clean, intuitive interface built with Tailwind CSS that works beautifully on all devices.
*   **Dark Mode:** Automatically adapts to your system's theme preference.

## 🚀 Tech Stack

*   **Frontend:** [React](https://reactjs.org/) 19, [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)
*   **Build Tool:** [Vite](https://vitejs.dev/)

## ⚙️ How It Works

Zenith is a pure client-side application. This means:

1.  **No Backend Server:** The application runs entirely in your web browser. There is no server-side logic or database.
2.  **Local Storage:** All transaction and category data is persisted in your browser's `localStorage`. This makes it fast and private but also means the data is tied to the specific browser and device you use.
3.  **State Management:** Global state is managed using React's Context API (`AppContext`), providing a centralized way to handle and access data throughout the application.

## 🏁 Getting Started

To run this project on your local machine, follow these steps:

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/expense-tracker.git
    cd expense-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application should now be running on `http://localhost:5173`.

## 📦 Deployment

This application is a static web app and can be deployed easily to any static hosting service.

### Deploying with Vercel

[Vercel](https://vercel.com) is an excellent choice for deploying Vite-based applications.

1.  Push your code to a GitHub repository.
2.  Sign up for a free Vercel account and connect it to your GitHub.
3.  Create a "New Project" and import your repository.
4.  Vercel will automatically detect that it is a Vite project and configure the build settings correctly.
    *   **Framework Preset:** `Vite`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
5.  Click **Deploy**. Your site will be live in minutes!

## 📂 Project Structure

```
/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── ui/           # General-purpose UI components (Modal, etc.)
│   │   ├── CategoryManager.tsx
│   │   ├── Dashboard.tsx
│   │   └── TransactionManager.tsx
│   ├── context/          # React Context for global state
│   │   └── AppContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useLocalStorage.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility and helper functions
│   │   └── helpers.ts
│   ├── App.tsx           # Main application component
│   └── index.tsx         # Application entry point
├── index.html            # Main HTML file
├── package.json          # Project dependencies and scripts
└── README.md             # You are here!
```

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find any bugs, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
