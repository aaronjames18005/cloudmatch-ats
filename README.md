# Cloudmatch-ATS 🚀

Cloudmatch-ATS is a modern **Applicant Tracking System (ATS)** built with TypeScript and Vite. It helps streamline the hiring process by managing job postings and candidate applications in an intuitive dashboard. This project aims to simplify talent acquisition workflows, making it easier for recruiters and hiring teams to track applicants and make data-driven decisions.

An ATS like Cloudmatch digitally organizes every step of recruitment — from posting jobs to tracking candidates through screening, interviews, and offers. :contentReference[oaicite:0]{index=0}

---

## 🧠 Key Features

- 📄 **Job Listings & Posting** – Create and showcase jobs to potential applicants.
- 🔍 **Candidate Tracking** – Efficiently track candidate profiles and application statuses.
- 🗂️ **Modular Components** – UI split into reusable React/TS components.
- ⚡ **Fast Development** – Powered by Vite for lightning-fast HMR and builds.
- 🔐 **Environment Config** – Easy integration with API keys (like Gemini) via `.env.local`.

---

## 🛠️ Tech Stack

- **TypeScript**
- **React**
- **Vite**
- **Tailwind CSS (optional for UI)**
- **Node.js/npm**

---

## 📦 Prerequisites

Before you begin, make sure you have **Node.js** installed:

```bash
node --version
npm --version
```

---

🚀 Getting Started

Follow these steps to run Cloudmatch-ATS locally:

1. Clone the repo
```bash
git clone https://github.com/aaronjames18005/cloudmatch-ats.git
cd cloudmatch-ats
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
Create a file named .env.local in the project root and add your Gemini API key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the app
```bash
npm run dev
```

5. Open in browser
Visit http://localhost:5173 to see your ATS in action.

## 🧩 Folder Structure
```bash
/
├── components/        # Reusable UI components
├── services/          # API integrations, helpers, mocks
├── App.tsx            # Main app entry
├── index.tsx          # React entrypoint
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript config
```

---

## 📌 How It Works

Cloudmatch-ATS provides the foundational UI and routes for an ATS dashboard. While full backend support (database, authentication, hosted API) is not included by default, the architecture supports easy extension into a full-stack deployment with services like Firebase, Supabase, or custom Node/Express APIs.

Use the included service layer in services/ to:
- Integrate job posting APIs
- Implement resume parsing and candidate search
- Add authentication for recruiters

---

## 📈 Why ATS Matters

An Applicant Tracking System automates key parts of the recruitment workflow — from collection and parsing of resumes to collaborative hiring tools for recruiters. It centralizes candidate data, speeds up time-to-hire, and improves hiring outcomes.

---

## 🙌 Contributing

Contributions are welcome! If you’d like to add features, improve UI/UX, or integrate backend services, please fork the repository and submit a pull request.

1. Fork the project
2. Create your feature branch (git checkout -b feature/AwesomeFeature)
3. Commit your changes (git commit -m "Add AwesomeFeature")
4. Push to the branch (git push origin feature/AwesomeFeature)
5. Open a Pull Request

---

## 📜 License

This project is open-source and available under the MIT License.
