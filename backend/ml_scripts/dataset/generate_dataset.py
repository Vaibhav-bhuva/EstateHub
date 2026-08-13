import os
import numpy as np
import pandas as pd

np.random.seed(42)
n_samples = 3500

cities = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat']
locality_tiers = ['Prime / Luxury', 'Mid-Tier', 'Suburban', 'Developing']
property_types = ['Apartment', 'Villa', 'Penthouse', 'Independent House', 'Studio', 'Commercial Office']
facing_options = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']
furnished_options = ['Furnished', 'Semi-Furnished', 'Unfurnished']
builder_tiers = ['Grade-A Top Developer', 'Established Developer', 'Local Builder']
possession_options = ['Ready to Move', 'Under Construction']

city = np.random.choice(cities, n_samples, p=[0.20, 0.18, 0.16, 0.12, 0.08, 0.10, 0.05, 0.05, 0.03, 0.03])
locality_tier = np.random.choice(locality_tiers, n_samples, p=[0.20, 0.45, 0.25, 0.10])
property_type = np.random.choice(property_types, n_samples, p=[0.55, 0.15, 0.05, 0.15, 0.05, 0.05])
facing = np.random.choice(facing_options, n_samples)
furnished = np.random.choice(furnished_options, n_samples, p=[0.30, 0.45, 0.25])
builder_tier = np.random.choice(builder_tiers, n_samples, p=[0.25, 0.50, 0.25])
possession_status = np.random.choice(possession_options, n_samples, p=[0.75, 0.25])

# Numeric features
bedrooms = np.random.randint(1, 6, n_samples)
bathrooms = np.random.randint(1, 6, n_samples)
bathrooms = np.minimum(bathrooms, bedrooms + 1)
area_sqft = bedrooms * np.random.randint(350, 750, n_samples) + np.random.randint(50, 300, n_samples)
age_years = np.random.randint(0, 35, n_samples)
total_floors = np.random.randint(4, 40, n_samples)
floor = np.array([np.random.randint(0, tf) for tf in total_floors])
parking = np.random.randint(0, 4, n_samples)
road_width = np.random.choice([20, 30, 40, 60, 80, 100], n_samples)
location_score = np.round(np.random.uniform(3.5, 9.8, n_samples), 1)
nearby_schools = np.random.randint(1, 10, n_samples)
nearby_hospital = np.random.randint(1, 6, n_samples)
nearby_metro = np.random.randint(0, 4, n_samples)
gated_community = np.random.choice([1, 0], n_samples, p=[0.70, 0.30])
amenities_score = np.random.randint(1, 11, n_samples)

# Base Price per Sqft (INR) based on City & Locality Tier
city_base_sqft = {
    'Mumbai': 22000,
    'Delhi NCR': 16000,
    'Bangalore': 11000,
    'Hyderabad': 9000,
    'Pune': 8500,
    'Chennai': 8000,
    'Kolkata': 6500,
    'Ahmedabad': 6000,
    'Jaipur': 4800,
    'Surat': 5200,
}

tier_mult = {
    'Prime / Luxury': 1.65,
    'Mid-Tier': 1.0,
    'Suburban': 0.78,
    'Developing': 0.60
}

type_mult = {
    'Apartment': 1.0,
    'Villa': 1.75,
    'Penthouse': 1.50,
    'Independent House': 1.30,
    'Studio': 0.90,
    'Commercial Office': 1.40
}

furn_mult = {'Furnished': 1.12, 'Semi-Furnished': 1.04, 'Unfurnished': 1.0}
builder_mult = {'Grade-A Top Developer': 1.18, 'Established Developer': 1.05, 'Local Builder': 0.92}
possession_mult = {'Ready to Move': 1.05, 'Under Construction': 0.92}

# Compute price per sqft dynamically with real estate valuation principles
base_sqft_rates = np.array([city_base_sqft[c] for c in city])
t_mult = np.array([tier_mult[t] for t in locality_tier])
p_mult = np.array([type_mult[pt] for pt in property_type])
f_mult = np.array([furn_mult[f] for f in furnished])
b_mult = np.array([builder_mult[b] for b in builder_tier])
pos_mult = np.array([possession_mult[ps] for ps in possession_status])

# Floor rise premium (0.5% per floor above 3rd floor)
floor_premium = 1.0 + np.maximum(0, floor - 3) * 0.005

# Exponential Age depreciation: property loses ~1.2% per year up to 30 years
age_decay = np.exp(-0.012 * age_years)

# Effective Price per Sqft
effective_rate = (
    base_sqft_rates * t_mult * p_mult * f_mult * b_mult * pos_mult * floor_premium * age_decay
    + (location_score - 5.0) * 800
    + (nearby_metro * 600)
    + (gated_community * 500)
    + (amenities_score * 300)
)

base_property_val = effective_rate * area_sqft

# Add feature specific premiums (bedrooms, bathrooms, parking)
total_price = (
    base_property_val
    + bedrooms * 180000
    + bathrooms * 120000
    + parking * 200000
    + road_width * 5000
)

# Realistic Gaussian noise (~3.5% random variance in market)
noise = np.random.normal(0, total_price * 0.035)
final_price = np.maximum(500000, np.round(total_price + noise, -4)).astype(int)

df = pd.DataFrame({
    'city': city,
    'locality_tier': locality_tier,
    'property_type': property_type,
    'area_sqft': area_sqft,
    'bedrooms': bedrooms,
    'bathrooms': bathrooms,
    'age_years': age_years,
    'floor': floor,
    'total_floors': total_floors,
    'parking': parking,
    'furnished': furnished,
    'facing': facing,
    'builder_tier': builder_tier,
    'possession_status': possession_status,
    'gated_community': gated_community,
    'road_width': road_width,
    'location_score': location_score,
    'nearby_schools': nearby_schools,
    'nearby_hospital': nearby_hospital,
    'nearby_metro': nearby_metro,
    'amenities_score': amenities_score,
    'price': final_price
})

dataset_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(dataset_dir, 'property_data.csv')
df.to_csv(dataset_path, index=False)
print(f"Generated high-accuracy realistic real estate dataset with {len(df)} records at {dataset_path}")
print(df.describe())
