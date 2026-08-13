"""
EstateHub - High Accuracy ML Model Training Engine
Trains HistGradientBoosting, GradientBoosting, Random Forest, and Ensemble Voting Regressor.
Applies target log transformation log1p(price) for non-linear real estate price distributions.
Selects the best performing model based on R² & MAE and saves all artifacts.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.ensemble import HistGradientBoostingRegressor, GradientBoostingRegressor, RandomForestRegressor, VotingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'property_data.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
PLOTS_DIR = os.path.join(BASE_DIR, 'plots')

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)


def load_and_preprocess_data():
    print("Loading real estate dataset...")
    if not os.path.exists(DATASET_PATH):
        print("Dataset not found. Generating realistic dataset...")
        sys.path.insert(0, os.path.join(BASE_DIR, 'dataset'))
        import generate_dataset  # noqa: F401

    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded {len(df)} records with {len(df.columns)} features.")

    # Deduplicate
    df.drop_duplicates(inplace=True)

    # Impute missing values safely
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(df[col].median())
    for col in df.select_dtypes(include=['object', 'category']).columns:
        df[col] = df[col].fillna(df[col].mode()[0])

    # Remove price outliers outside 1st and 99th percentile
    p1 = df['price'].quantile(0.01)
    p99 = df['price'].quantile(0.99)
    df = df[(df['price'] >= p1) & (df['price'] <= p99)].copy()
    print(f"Cleaned dataset records: {len(df)}")

    # Feature Engineering
    df['total_rooms'] = df['bedrooms'] + df['bathrooms']
    df['avg_room_size'] = df['area_sqft'] / (df['total_rooms'] + 0.1)
    df['connectivity_score'] = df['nearby_metro'] * 2.5 + df['nearby_hospital'] * 1.5 + df['nearby_schools'] * 1.0

    return df


def encode_features(df):
    cat_cols = ['city', 'locality_tier', 'property_type', 'furnished', 'facing', 'builder_tier', 'possession_status']
    encoders = {}

    for col in cat_cols:
        if col in df.columns:
            oe = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
            df[col + '_encoded'] = oe.fit_transform(df[[col]])
            encoders[col] = oe

    return df, encoders


def prepare_feature_matrix(df):
    feature_cols = [
        'area_sqft', 'bedrooms', 'bathrooms', 'age_years', 'floor', 'total_floors',
        'parking', 'road_width', 'location_score', 'nearby_schools',
        'nearby_hospital', 'nearby_metro', 'gated_community', 'amenities_score',
        'total_rooms', 'avg_room_size', 'connectivity_score',
        'city_encoded', 'locality_tier_encoded', 'property_type_encoded',
        'furnished_encoded', 'facing_encoded', 'builder_tier_encoded', 'possession_status_encoded'
    ]

    # Filter to existing columns
    available_cols = [c for c in feature_cols if c in df.columns]

    X = df[available_cols].values
    # Target log transformation log1p for non-linear scale stability
    y_raw = df['price'].values
    y_log = np.log1p(y_raw)

    return X, y_log, y_raw, available_cols


def train_and_evaluate_models(X_train, X_test, y_train_log, y_test_log, y_test_raw):
    print("Training Machine Learning Regressors...")

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # 1. HistGradientBoosting (Fast, robust, handling non-linear features)
    hgb = HistGradientBoostingRegressor(
        max_iter=300,
        learning_rate=0.05,
        max_depth=12,
        l2_regularization=0.1,
        random_state=42
    )

    # 2. GradientBoosting
    gb = GradientBoostingRegressor(
        n_estimators=250,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.85,
        random_state=42
    )

    # 3. Random Forest
    rf = RandomForestRegressor(
        n_estimators=200,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )

    # 4. Ensemble Voting Regressor
    ensemble = VotingRegressor([
        ('hgb', hgb),
        ('gb', gb),
        ('rf', rf)
    ])

    models = {
        'HistGradientBoosting': hgb,
        'GradientBoosting': gb,
        'RandomForest': rf,
        'Ensemble (Stacking)': ensemble
    }

    results = {}
    best_name = None
    best_r2 = -1.0

    for name, model in models.items():
        model.fit(X_train_s, y_train_log)
        pred_log = model.predict(X_test_s)
        pred_raw = np.expm1(pred_log)

        r2 = r2_score(y_test_raw, pred_raw)
        mae = mean_absolute_error(y_test_raw, pred_raw)
        rmse = np.sqrt(mean_squared_error(y_test_raw, pred_raw))
        mape = mean_absolute_percentage_error(y_test_raw, pred_raw) * 100

        results[name] = {
            'model': model,
            'r2': r2,
            'mae': mae,
            'rmse': rmse,
            'mape': mape,
            'pred_raw': pred_raw
        }

        print(f"   [Model] {name:22s} | R2 = {r2:.4f} (Accuracy ~{r2*100:.1f}%) | MAE = Rs.{mae:,.0f} | MAPE = {mape:.2f}%")

        if r2 > best_r2:
            best_r2 = r2
            best_name = name

    print(f"\n Best Model Selected: {best_name} (R2 = {best_r2:.4f})")
    return results, best_name, scaler


def plot_results(results, y_test_raw):
    model_names = list(results.keys())
    r2_scores = [results[m]['r2'] for m in model_names]
    mae_scores = [results[m]['mae'] for m in model_names]

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    colors = ['#4f46e5', '#0284c7', '#059669', '#7c3aed']

    axes[0].bar(model_names, r2_scores, color=colors)
    axes[0].set_title('R² Accuracy Score (Higher is Better)', fontsize=12, fontweight='bold')
    axes[0].set_ylim(0, 1.0)
    for i, v in enumerate(r2_scores):
        axes[0].text(i, v + 0.01, f"{v:.4f}", ha='center', fontweight='bold')

    axes[1].bar(model_names, [m / 1e5 for m in mae_scores], color=colors)
    axes[1].set_title('MAE Error (in Lakhs INR - Lower is Better)', fontsize=12, fontweight='bold')
    for i, v in enumerate(mae_scores):
        axes[1].text(i, (v / 1e5) + 0.05, f"₹{v/1e5:.2f}L", ha='center', fontweight='bold')

    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, 'model_comparison.png'), dpi=150)
    plt.close()


def save_artifacts(best_name, best_data, scaler, encoders, feature_cols):
    joblib.dump(best_data['model'], os.path.join(MODELS_DIR, 'model.pkl'))
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))
    joblib.dump(encoders, os.path.join(MODELS_DIR, 'encoders.pkl'))
    joblib.dump(feature_cols, os.path.join(MODELS_DIR, 'feature_cols.pkl'))
    # Dummy poly for backward compatibility if required by existing imports
    joblib.dump(None, os.path.join(MODELS_DIR, 'poly.pkl'))

    model_info = {
        'model_type': best_name,
        'is_log_transformed': True,
        'metrics': {
            'r2': round(best_data['r2'], 4),
            'mae': round(best_data['mae'], 2),
            'rmse': round(best_data['rmse'], 2),
            'mape': round(best_data['mape'], 2),
            'accuracy_percentage': round(best_data['r2'] * 100, 2)
        },
        'feature_count': len(feature_cols)
    }

    with open(os.path.join(MODELS_DIR, 'model_info.json'), 'w') as f:
        json.dump(model_info, f, indent=2)

    print(f"Saved high-accuracy model artifacts to {MODELS_DIR}")


if __name__ == '__main__':
    df = load_and_preprocess_data()
    df, encoders = encode_features(df)
    X, y_log, y_raw, feature_cols = prepare_feature_matrix(df)

    X_train, X_test, y_train_log, y_test_log, y_train_raw, y_test_raw = train_test_split(
        X, y_log, y_raw, test_size=0.2, random_state=42
    )

    results, best_name, scaler = train_and_evaluate_models(X_train, X_test, y_train_log, y_test_log, y_test_raw)
    plot_results(results, y_test_raw)
    save_artifacts(best_name, results[best_name], scaler, encoders, feature_cols)
