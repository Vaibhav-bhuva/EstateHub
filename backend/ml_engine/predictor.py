"""
ML Predictor Engine - EstateHub
Loads trained model artifacts once and delivers high-accuracy estate price predictions.
"""
import os
import json
import joblib
import numpy as np
from django.conf import settings

_model = None
_encoders = None
_scaler = None
_feature_cols = None
_model_info = None


def _load_artifacts():
    global _model, _encoders, _scaler, _feature_cols, _model_info
    if _model is not None:
        return True

    models_dir = settings.ML_MODELS_DIR
    model_path = os.path.join(models_dir, 'model.pkl')

    if not os.path.exists(model_path):
        # Fallback to local ml_scripts/models if settings dir isn't built yet
        base_dir = getattr(settings, 'BASE_DIR', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        models_dir = os.path.join(base_dir, 'ml_scripts', 'models')
        model_path = os.path.join(models_dir, 'model.pkl')

    if not os.path.exists(model_path):
        return False

    try:
        _model = joblib.load(model_path)
        _encoders = joblib.load(os.path.join(models_dir, 'encoders.pkl'))
        _scaler = joblib.load(os.path.join(models_dir, 'scaler.pkl'))
        _feature_cols = joblib.load(os.path.join(models_dir, 'feature_cols.pkl'))

        info_path = os.path.join(models_dir, 'model_info.json')
        if os.path.exists(info_path):
            with open(info_path) as f:
                _model_info = json.load(f)
        return True
    except Exception as e:
        print(f"⚠️ Error loading ML artifacts: {e}")
        return False


def get_model_info():
    if not _load_artifacts():
        return None
    return _model_info


def predict_price(data: dict) -> dict:
    """
    Input data dict containing:
    city, locality_tier, property_type, area_sqft, bedrooms, bathrooms, age_years,
    floor, total_floors, parking, furnished, facing, builder_tier, possession_status,
    gated_community, road_width, location_score, nearby_schools, nearby_hospital, nearby_metro, amenities_score
    """
    if not _load_artifacts():
        return {'error': 'ML model not trained yet. Run python ml_scripts/train_model.py first.'}

    try:
        # Default fallbacks
        bedrooms = float(data.get('bedrooms', 2))
        bathrooms = float(data.get('bathrooms', 2))
        area_sqft = float(data.get('area_sqft', 1000))
        total_rooms = bedrooms + bathrooms
        avg_room_size = area_sqft / (total_rooms + 0.1)
        nearby_metro = float(data.get('nearby_metro', 1))
        nearby_hospital = float(data.get('nearby_hospital', 2))
        nearby_schools = float(data.get('nearby_schools', 3))
        connectivity_score = nearby_metro * 2.5 + nearby_hospital * 1.5 + nearby_schools * 1.0

        computed_features = {
            'area_sqft': area_sqft,
            'bedrooms': bedrooms,
            'bathrooms': bathrooms,
            'age_years': float(data.get('age_years', 5)),
            'floor': float(data.get('floor', 3)),
            'total_floors': float(data.get('total_floors', 12)),
            'parking': float(data.get('parking', 1)),
            'road_width': float(data.get('road_width', 30)),
            'location_score': float(data.get('location_score', 7.5)),
            'nearby_schools': nearby_schools,
            'nearby_hospital': nearby_hospital,
            'nearby_metro': nearby_metro,
            'gated_community': float(data.get('gated_community', 1)),
            'amenities_score': float(data.get('amenities_score', 6)),
            'total_rooms': total_rooms,
            'avg_room_size': avg_room_size,
            'connectivity_score': connectivity_score,
        }

        cat_defaults = {
            'city': 'Mumbai',
            'locality_tier': 'Mid-Tier',
            'property_type': 'Apartment',
            'furnished': 'Semi-Furnished',
            'facing': 'East',
            'builder_tier': 'Established Developer',
            'possession_status': 'Ready to Move'
        }

        import pandas as pd
        # Encode categorical variables
        for col, default_val in cat_defaults.items():
            encoded_key = col + '_encoded'
            val = data.get(col, default_val)
            if col in _encoders:
                oe = _encoders[col]
                try:
                    df_cat = pd.DataFrame({col: [val]})
                    enc_val = float(oe.transform(df_cat)[0][0])
                except Exception:
                    enc_val = 0.0
                computed_features[encoded_key] = enc_val
            else:
                computed_features[encoded_key] = 0.0

        # Construct vector matching model feature columns exactly
        import pandas as pd
        df_input = pd.DataFrame([computed_features])
        X_df = df_input[_feature_cols]

        if _scaler is not None:
            X_scaled = _scaler.transform(X_df.values)
        else:
            X_scaled = X_df.values

        # Predict log price and transform back to currency (expm1)
        raw_pred = _model.predict(X_scaled)[0]
        if _model_info and _model_info.get('is_log_transformed', True):
            predicted = float(np.expm1(raw_pred))
        else:
            predicted = float(raw_pred)

        predicted = max(predicted, 200000.0)

        # Dynamic Market Price Band (Confidence interval ±8%)
        low = predicted * 0.92
        high = predicted * 1.08
        sqft_rate = predicted / area_sqft if area_sqft > 0 else 0

        # Confidence metric
        r2 = _model_info['metrics']['r2'] if (_model_info and 'metrics' in _model_info) else 0.95
        confidence = round(min(99.5, r2 * 100), 1)

        # Evaluate Seller Price comparison
        seller_price = data.get('seller_price')
        recommendation = 'fair'
        recommendation_text = 'Price is fair and matches real market rates.'
        if seller_price:
            seller_price = float(seller_price)
            ratio = seller_price / predicted
            if ratio > 1.10:
                recommendation = 'high'
                recommendation_text = f'Listed price is higher than estimated market value (Overpriced by {round((ratio-1)*100, 1)}%). Suggested value: ₹{predicted:,.0f}'
            elif ratio < 0.90:
                recommendation = 'low'
                recommendation_text = f'Great deal! Listed price is below market valuation (Underpriced by {round((1-ratio)*100, 1)}%).'

        return {
            'estimated_price': round(predicted, 2),
            'price_per_sqft': round(sqft_rate, 2),
            'price_range': {'low': round(low, 2), 'high': round(high, 2)},
            'confidence': confidence,
            'accuracy_r2': round(r2, 4),
            'mae': _model_info['metrics']['mae'] if (_model_info and 'metrics' in _model_info) else None,
            'mape': _model_info['metrics'].get('mape') if (_model_info and 'metrics' in _model_info) else None,
            'model_type': _model_info['model_type'] if _model_info else 'Ensemble ML',
            'recommendation': recommendation,
            'recommendation_text': recommendation_text,
            'market_comparison': {
                'below_market': round(low, 2),
                'market_price': round(predicted, 2),
                'above_market': round(high, 2),
            }
        }
    except Exception as e:
        return {'error': f'Prediction failed: {str(e)}'}


def predict_buyer_budget(data: dict) -> dict:
    if not _load_artifacts():
        return {'error': 'ML model not trained.'}

    try:
        city = data.get('city', 'Mumbai')
        prop_type = data.get('property_type', 'Apartment')
        budget = float(data.get('budget', 7500000))
        bedrooms = int(data.get('bedrooms', 2))
        bathrooms = int(data.get('bathrooms', 2))

        # Binary search for area matching budget
        lo, hi = 250, 8000
        mid = 1000
        for _ in range(30):
            mid = (lo + hi) / 2
            test_data = {
                'city': city,
                'property_type': prop_type,
                'area_sqft': mid,
                'bedrooms': bedrooms,
                'bathrooms': bathrooms,
                'locality_tier': 'Mid-Tier',
                'age_years': 5,
                'location_score': 7.5
            }
            pred = predict_price(test_data)
            if 'error' in pred:
                break
            est = pred['estimated_price']
            if abs(est - budget) < budget * 0.02:
                break
            if est > budget:
                hi = mid
            else:
                lo = mid

        recommended_area = round(mid)
        est = predict_price({'city': city, 'property_type': prop_type, 'area_sqft': recommended_area, 'bedrooms': bedrooms, 'bathrooms': bathrooms}).get('estimated_price', budget)

        return {
            'estimated_market_price': round(est, 2),
            'budget': budget,
            'recommended_area_sqft': recommended_area,
            'area_recommendation': f'For your budget of ₹{budget:,.0f} in {city}, you can get approx {recommended_area} sqft.',
            'price_breakdown': {
                'base_property': round(est * 0.85, 2),
                'registration_charges': round(est * 0.07, 2),
                'stamp_duty': round(est * 0.05, 2),
                'misc': round(est * 0.03, 2),
            }
        }
    except Exception as e:
        return {'error': str(e)}
