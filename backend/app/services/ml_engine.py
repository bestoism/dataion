import pandas as pd
import joblib
import os
import re
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

MODEL_DIR = "models"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def train_automl(
    df: pd.DataFrame,
    target_col: str,
    filename_prefix: str,
    model_type: str = "rf"
):
    # 1. Pisahkan X dan y
    X = df.drop(columns=[target_col])
    y = df[target_col]

    # Convert y ke numeric (Wajib untuk XGB/LGBM)
    y_labels, y_uniques = pd.factorize(y)
    target_mapping = {int(i): str(name) for i, name in enumerate(y_uniques)}

    # 2. Preprocessing X
    for col in X.columns:
        if X[col].dtype == "object":
            X[col] = X[col].fillna("Unknown")
        else:
            X[col] = X[col].fillna(0)

    X = pd.get_dummies(X)

    # === SANITASI NAMA KOLOM (PENTING UNTUK LIGHTGBM) ===
    new_cols = []
    for col in X.columns:
        clean_col = re.sub(r'[^a-zA-Z0-9]', '_', str(col))
        new_cols.append(clean_col)
    X.columns = new_cols
    # ==================================================

    feature_names = list(X.columns)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_labels, test_size=0.2, random_state=42
    )

    # 3. Pilih Model
    if model_type == "xgboost":
        model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
        display_name = "XGBoost"
    elif model_type == "lightgbm":
        model = LGBMClassifier(
            verbose=-1,
            min_data_in_leaf=1,
            min_child_samples=1,
            importance_type='gain'
        )
        display_name = "LightGBM"
    else:
        model = RandomForestClassifier(n_estimators=100)
        display_name = "Random Forest"

    # 4. Train & Evaluate
    try:
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        report = classification_report(y_test, predictions, output_dict=True)

        # === HITUNG FEATURE IMPORTANCE (BARU) ===
        importances = []
        if hasattr(model, 'feature_importances_'):
            feat_scores = model.feature_importances_
            importance_map = dict(zip(feature_names, feat_scores))

            sorted_importance = sorted(
                importance_map.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]

            importances = [
                {"feature": k, "score": round(float(v), 4)}
                for k, v in sorted_importance
            ]
        # ======================================

        # 5. Save
        model_filename = f"{filename_prefix}.joblib"
        model_path = os.path.join(MODEL_DIR, model_filename)

        artifact = {
            "model": model,
            "features": feature_names,
            "target_mapping": target_mapping,
            "model_name": display_name
        }
        joblib.dump(artifact, model_path)

        return {
            "model_type": display_name,
            "accuracy": round(accuracy, 4),
            "dataset_rows": len(df),
            "training_rows": len(X_train),
            "features_used": feature_names,
            "detailed_report": report,
            "artifact_path": model_filename,
            "feature_importance": importances
        }

    except Exception as e:
        raise Exception(f"ML Engine Error: {str(e)}")
