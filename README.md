# 🚀 Agenda Kanban v3.0 - AI Workspace

[![Vercel Deployment](https://img.shields.io/badge/vercel-deployed-black)](https://agenda-qa.vercel.app)
![Version](https://img.shields.io/badge/version-3.1.0-indigo)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Supabase%20%7C%20Gemini%202.0-blueviolet)

A high-performance task management system designed for **QA and Development Teams**, featuring **Supabase Realtime** for collaboration and **Google Gemini 2.0** for AI orchestration.

---

## ✨ Key Features

### 🔄 Real-Time Collaboration (Supabase)
- **Live Sync**: All changes (cards, sprints, meetings) are synced instantly across all users.
- **Role-Based Access**: Granular permissions for Admins, Editors, and Viewers.
- **Audit Logging**: Comprehensive tracking of all actions in the `audit_logs` table.

### 🧠 Artificial Intelligence (Gemini Pro)
- **Smart Import**: Drag & drop PDF/Text to extract tasks automatically.
- **Text-to-Speech**: Listen to card details with neural voices.
- **Test Generation**: Create JSON/SQL test data from card descriptions.
- **Web Grounding**: Search the web for technical references directly from cards.

### 📊 Sprint Management
- **Planning & Execution**: create and track 14-day cycles.
- **Analytics**: Burndown charts and Health Scores.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Glassmorphism)
- **Backend**: Supabase (PostgreSQL, Realtime, Auth, RLS)
- **AI**: Google GenAI SDK
- **Icons**: Lucide React

---

## 📂 Project Structure

Moved to a standard Vite structure for better maintainability:

```bash
/
├── src/                 # Source Code
│   ├── components/      # UI Components (Kanban, Modals, Dashboard)
│   ├── hooks/           # Supabase & Logic Hooks
│   ├── services/        # API Integrations (Supabase, Gemini)
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main Entry
│   └── types.ts         # TypeScript Interfaces
├── database/            # SQL Scripts
│   ├── final_db_migration.sql   # Schema Definitions
│   ├── sync_existing_users.sql  # User Role Mapping
│   └── fix_profiles_schema.sql  # Patch for Profiles Table
├── docs/                # Documentation & Specs
└── public/              # Static Assets
```

---

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env` file in the root directory:
```env
# Gemini API Code
GEMINI_API_KEY=your_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Setup
Run the scripts located in `database/` in your Supabase SQL Editor:
1.  **Schema**: Run `final_db_migration.sql` (Creates tables, policies, realtime).
2.  **Profiles**: Run `fix_profiles_schema.sql` (Ensures all profile columns exist).
3.  **Users**: Run `sync_existing_users.sql` (Maps your Auth users to Profiles).

### 3. Run Locally
```bash
npm install
npm run dev
```

---

## 📚 Documentation
Detailed documentation is available in the `docs/` folder:
- [Deployment Guide](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)

---

Developed for **High Performance Teams**.
