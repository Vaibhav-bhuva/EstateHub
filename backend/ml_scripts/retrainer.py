import os
import sys
import threading
import logging
import pandas as pd
from django.conf import settings
from sklearn.model_selection import train_test_split

# Setup logging
logger = logging.getLogger(__name__)

# Debounce lock to prevent multiple concurrent training threads
_training_lock = threading.Lock()

def run_background_training():
    """
    Background worker that runs the ML training pipeline using live DB properties.
    Ensures thread safety and prevents concurrent training floods.
    """
    if not _training_lock.acquire(blocking=False):
        logger.info("ML Retraining already in progress. Skipping this trigger.")
        return

    try:
        logger.info("Starting background ML model retraining...")
        
        # Ensure django is loaded if running externally
        import django
        if not django.apps.apps.ready:
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
            django.setup()

        from properties.models import Property
        from ml_scripts.train_model import (
            load_and_preprocess_data, encode_features, prepare_feature_matrix,
            train_and_evaluate_models, plot_results, save_artifacts, DATASET_PATH
        )

        # 1. Load the base CSV dataset
        base_df = load_and_preprocess_data()

        # 2. Load all active properties from Database
        db_properties = Property.objects.filter(status='available', price__gt=0, area_sqft__gt=0)
        
        db_data = []
        for p in db_properties:
            db_data.append({
                'price': float(p.price),
                'area_sqft': float(p.area_sqft),
                'bedrooms': p.bedrooms,
                'bathrooms': p.bathrooms,
                'age_years': p.age_years,
                'floor': p.floor,
                'total_floors': p.floor + 2, # Approximation if total_floors not in model
                'parking': p.parking,
                'road_width': p.road_width,
                'location_score': p.location_score,
                'nearby_schools': p.nearby_schools,
                'nearby_hospital': p.nearby_hospital,
                'nearby_metro': p.nearby_metro,
                'gated_community': 1, # Default approximation
                'amenities_score': len(p.amenities) if isinstance(p.amenities, list) else 5,
                'city': p.city,
                'locality_tier': 'Mid-Tier', # Default approximation
                'property_type': p.property_type,
                'furnished': p.furnished,
                'facing': p.facing if p.facing else 'East',
                'builder_tier': 'Established Developer', # Default approximation
                'possession_status': 'Ready to Move',
            })
        
        # 3. Combine DataFrames
        if db_data:
            db_df = pd.DataFrame(db_data)
            
            # Re-apply feature engineering for DB data
            db_df['total_rooms'] = db_df['bedrooms'] + db_df['bathrooms']
            db_df['avg_room_size'] = db_df['area_sqft'] / (db_df['total_rooms'] + 0.1)
            db_df['connectivity_score'] = db_df['nearby_metro'] * 2.5 + db_df['nearby_hospital'] * 1.5 + db_df['nearby_schools'] * 1.0

            # Concatenate and drop exact duplicates
            df_combined = pd.concat([base_df, db_df], ignore_index=True)
            df_combined.drop_duplicates(inplace=True)
            logger.info(f"Appended {len(db_df)} live DB properties to training dataset.")
        else:
            df_combined = base_df

        # 4. Train the model
        df_encoded, encoders = encode_features(df_combined)
        X, y_log, y_raw, feature_cols = prepare_feature_matrix(df_encoded)
        
        X_train, X_test, y_train_log, y_test_log, y_train_raw, y_test_raw = train_test_split(
            X, y_log, y_raw, test_size=0.2, random_state=42
        )
        
        results, best_name, scaler = train_and_evaluate_models(X_train, X_test, y_train_log, y_test_log, y_test_raw)
        
        # 5. Save Artifacts (Overwrites the old model)
        save_artifacts(best_name, results[best_name], scaler, encoders, feature_cols)
        logger.info("Background ML retraining completed successfully.")

    except Exception as e:
        logger.error(f"Background ML retraining failed: {str(e)}", exc_info=True)
    finally:
        _training_lock.release()
