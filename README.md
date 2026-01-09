# DATAION ⚡

**The End-to-End Data Platform for Strict Schema Validation & AutoML.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind_CSS_v4-38B2AC)](https://tailwindcss.com/)

> **DATAION** bridges the gap between Data Engineering and Machine Learning. It enforces **Data Contracts** to ensure only high-quality, schema-compliant data enters your pipeline, then automatically generates ML models and EDA reports.

<div align="center">
  <img width="100%" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/0d2479b3-72c2-4436-b7c2-b54d122cf1aa" />
</div>

---

## 🚀 Key Features

### 🛡️ Data Contracts & Schema Validation
- **Strict Schema Enforcement:** Define expected columns and data types (`int`, `float`, `string`) before data ingestion.
- **Real-time Validation:** Instantly rejects non-compliant CSV files with detailed error logs.
- **Auto-Schema Inference:** Smartly detects schema from CSV headers and sample data to save setup time.

### 🤖 Automated Machine Learning (AutoML)
- **Instant Training:** Automatically trains a **Random Forest** model on valid datasets.
- **Model Artifacts:** Download trained models (`.joblib`) ready for production deployment.
- **Metrics Dashboard:** View Accuracy, Features Used, and Row counts instantly.

### 📊 Exploratory Data Analysis (EDA)
- **Deep Dive:** Visualize column distributions, missing values, and unique counts without writing code.
- **Data Health Check:** Automatic assessment of dataset readiness for ML.

### 🎨 Modern & Industrial UI
- **Clean Industrial Theme:** Designed for engineers with a focus on readability and utility.
- **Dark/Light Mode:** Fully supported via Tailwind CSS & Next-themes.
- **Interactive Workspace:** Drag-and-drop uploads, dynamic forms, and safe-delete protections.

---

## 🏗 System Architecture

The system follows a decoupled **Client-Server** architecture to ensure scalability.

```mermaid
graph TD
    User[User / Data Scientist] -->|Upload CSV| Frontend[Next.js Client]
    Frontend -->|POST /validate| API[FastAPI Backend]
    
    subgraph "Backend Engine"
        API -->|Check Schema| Validator[Schema Validator]
        Validator -->|If Valid| Storage[File Storage / Uploads]
        Validator -->|If Valid| DB[(SQLite / PostgreSQL)]
        
        API -->|POST /train| MLEngine[Scikit-Learn Engine]
        MLEngine -->|Read Data| Storage
        MLEngine -->|Train Model| ModelArtifact[Model .joblib]
    end
    
    MLEngine -->|Return Metrics| Frontend
    User -->|Download Model| ModelArtifact
```

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4 (Industrial Theme)
- **Icons:** Lucide React
- **State Management:** React Hooks
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **Validation:** Pydantic
- **ORM:** SQLAlchemy
- **Database:** SQLite (Dev) / PostgreSQL (Ready)
- **ML Engine:** Pandas, Scikit-learn, Numpy, Joblib

---

## ⚡ Getting Started

Follow these steps to run the project locally.

### 1. Clone Repository
```bash
git clone https://github.com/bestoism/dataion.git
cd dataion
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Server
uvicorn app.main:app --reload
```
*Backend runs on: `http://127.0.0.1:8000`*

### 3. Frontend Setup
Open a new terminal.
```bash
cd frontend

# Install packages
npm install

# Run Development Server
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## 📸 Screenshots

| **Schema Definition & Contracts** | **AutoML Training Results** |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/7146aba0-92c6-43f9-aa0e-cb4285f43541" width="100%" /> | <img src="https://github.com/user-attachments/assets/498a71da-b465-414e-80f3-804bb723cb67" width="100%" /> |
| *Managing Data Types & Required Fields* | *Performance Metrics & Download Artifact* |

| **Dataset Explorer (EDA)** | **Elegant Dark Mode** |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/52217deb-40cd-4139-be63-78b4be37725c" width="100%" /> | <img src="https://github.com/user-attachments/assets/3255fff4-02f8-489c-9cf0-3372d53c2333" width="100%" /> |
| *Automated Statistics & Distribution* | *Comfortable viewing for night ops* |

---

## 🔮 Future Roadmap

- [ ] Support for S3/GCS Storage.
- [ ] Advanced Model Selection (XGBoost, LightGBM).
- [ ] API Token Authentication (JWT).
- [ ] Deployment via Docker.

---

UNDER CONSTRUCTION
