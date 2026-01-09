import pandas as pd
import joblib # <--- Import ini
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Buat folder models jika belum ada
MODEL_DIR = "models"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def train_automl(df: pd.DataFrame, target_col: str, filename_prefix: str):
    """
    Melatih model dan menyimpannya sebagai file .joblib
    """
    
    # ... (Logic Preprocessing sama seperti sebelumnya) ...
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found.")

    X = df.drop(columns=[target_col])
    y = df[target_col]

    for col in X.columns:
        if X[col].dtype == "object":
            X[col] = X[col].fillna("Unknown")
        else:
            X[col] = X[col].fillna(0)

    X = pd.get_dummies(X)
    
    # Simpan nama fitur (penting agar saat prediksi urutannya sama)
    feature_names = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    report = classification_report(y_test, predictions, output_dict=True)

    # === SAVE MODEL ===
    # Nama file: model_projectID.joblib
    model_filename = f"{filename_prefix}.joblib"
    model_path = os.path.join(MODEL_DIR, model_filename)
    
    # Kita simpan Model beserta list Fitur-nya (dictionary)
    artifact = {
        "model": model,
        "features": feature_names
    }
    joblib.dump(artifact, model_path)
    # ==================

    return {
        "model_type": "RandomForestClassifier",
        "accuracy": round(accuracy, 4),
        "dataset_rows": len(df),
        "training_rows": len(X_train),
        "features_used": feature_names,
        "detailed_report": report,
        "artifact_path": model_filename # Kembalikan nama file
    }