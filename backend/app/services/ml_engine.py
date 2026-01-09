import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from app.schemas.contract import DataContract

def train_automl(df: pd.DataFrame, target_col: str):
    """
    AutoML Sederhana:
    1. Preprocessing (Fill NA, One-Hot Encoding)
    2. Split Data
    3. Train Random Forest
    4. Return Metrics
    """
    
    # 1. Cek apakah target ada
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset.")

    # 2. Pisahkan Fitur (X) dan Target (y)
    X = df.drop(columns=[target_col])
    y = df[target_col]

    # 3. Simple Preprocessing
    # Isi data kosong dengan 0 (numeric) atau 'Unknown' (string)
    # Ini cara kasar tapi ampuh untuk MVP
    for col in X.columns:
        if X[col].dtype == "object":
            X[col] = X[col].fillna("Unknown")
        else:
            X[col] = X[col].fillna(0)

    # Convert Categorical to Numeric (One-Hot Encoding otomatis)
    X = pd.get_dummies(X)

    # 4. Split Data (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 5. Train Model
    # Kita gunakan Random Forest karena robust untuk berbagai tipe data
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)

    # 6. Evaluate
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    report = classification_report(y_test, predictions, output_dict=True)

    # Kita kembalikan summary
    return {
        "model_type": "RandomForestClassifier",
        "accuracy": round(accuracy, 4),
        "dataset_rows": len(df),
        "training_rows": len(X_train),
        "features_used": list(X.columns),
        "detailed_report": report # Precision/Recall per kelas
    }