# DATAION

**An end-to-end data platform enforcing data contracts and schema validation to ensure reliable machine learning pipelines.**

DATAION is a web-based control panel designed to bridge the gap between raw data and machine learning models. It enforces strict schema validation (Data Contracts) to ensure that only quality, schema-compliant data enters the production pipeline.

## 🚀 Key Features

*   **Schema-Based Validation:** Automatically rejects data that does not meet the model's contract.
*   **Column Mapping:** Flexible UI to map user dataset columns to model features.
*   **Pipeline Control:** User-controlled preprocessing and normalization.
*   **Model Management:** Train, evaluate, and predict using compatible datasets.
*   **Simulation Mode:** Use models as decision support systems with new data.

## 🛠 Tech Stack

*   **Frontend:** Next.js (React)
*   **Backend:** FastAPI (Python)
*   **ML Engine:** Scikit-learn / Pandas
*   **Database:** PostgreSQL (Metadata) & Local/S3 Storage (Artifacts)

## 🏗 Architecture

> Frontend (Next.js) → Backend API (FastAPI) → Schema-Aware ML Service
