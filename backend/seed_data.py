"""
EstateHub Seed Data Script
Initializes 1 Admin, 1 Seller, 1 Buyer, 10 Metro Cities, and Sample Properties.
Usage: python seed_data.py
"""
import os
import sys
import django

# Ensure UTF-8 output encoding for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authentication.models import User
from cities.models import City
from properties.models import Property

def seed():
    print("🌱 Seeding database with clean initial data...")

    # 1. Admin User
    admin_email = 'admin@estatehub.ai'
    if not User.objects.filter(email=admin_email).exists():
        User.objects.create_superuser(
            email=admin_email,
            password='Admin@12345',
            first_name='Admin',
            last_name='EstateHub',
            role='admin',
            is_verified=True
        )
        print("  ✓ Created Admin: admin@estatehub.ai / Admin@12345")
    else:
        print("  ✓ Admin user exists: admin@estatehub.ai")

    # 2. Seller User
    seller_email = 'seller@test.com'
    seller, created = User.objects.get_or_create(
        email=seller_email,
        defaults={
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'role': 'seller',
            'phone': '9876543210',
            'is_verified': True,
        }
    )
    if created:
        seller.set_password('Test@12345')
        seller.save()
        print("  ✓ Created Seller: seller@test.com / Test@12345")
    else:
        print("  ✓ Seller user exists: seller@test.com")

    # 3. Buyer User
    buyer_email = 'buyer@test.com'
    buyer, created = User.objects.get_or_create(
        email=buyer_email,
        defaults={
            'first_name': 'Raj',
            'last_name': 'Patel',
            'role': 'buyer',
            'phone': '9123456789',
            'is_verified': True,
        }
    )
    if created:
        buyer.set_password('Test@12345')
        buyer.save()
        print("  ✓ Created Buyer: buyer@test.com / Test@12345")
    else:
        print("  ✓ Buyer user exists: buyer@test.com")

    # 4. 10 Cities
    cities_data = [
        {'name': 'Mumbai', 'state': 'Maharashtra', 'tier': 1, 'lat': 19.0760, 'lng': 72.8777, 'is_active': True},
        {'name': 'Delhi', 'state': 'Delhi NCR', 'tier': 1, 'lat': 28.6139, 'lng': 77.2090, 'is_active': True},
        {'name': 'Bangalore', 'state': 'Karnataka', 'tier': 1, 'lat': 12.9716, 'lng': 77.5946, 'is_active': True},
        {'name': 'Hyderabad', 'state': 'Telangana', 'tier': 1, 'lat': 17.3850, 'lng': 78.4867, 'is_active': True},
        {'name': 'Chennai', 'state': 'Tamil Nadu', 'tier': 1, 'lat': 13.0827, 'lng': 80.2707, 'is_active': True},
        {'name': 'Pune', 'state': 'Maharashtra', 'tier': 1, 'lat': 18.5204, 'lng': 73.8567, 'is_active': True},
        {'name': 'Kolkata', 'state': 'West Bengal', 'tier': 1, 'lat': 22.5726, 'lng': 88.3639, 'is_active': True},
        {'name': 'Ahmedabad', 'state': 'Gujarat', 'tier': 2, 'lat': 23.0225, 'lng': 72.5714, 'is_active': True},
        {'name': 'Jaipur', 'state': 'Rajasthan', 'tier': 2, 'lat': 26.9124, 'lng': 75.7873, 'is_active': True},
        {'name': 'Surat', 'state': 'Gujarat', 'tier': 2, 'lat': 21.1702, 'lng': 72.8311, 'is_active': True},
    ]

    city_count = 0
    for c in cities_data:
        _, created = City.objects.get_or_create(name=c['name'], defaults=c)
        if created:
            city_count += 1
    print(f"  ✓ Seeded {City.objects.count()} cities ({city_count} new)")

    # 5. Sample Properties
    sample_props = [
        {
            'title': 'Luxury 3 BHK Sea-View Apartment in Bandra West',
            'description': 'Premium 3BHK flat with panoramic Arabian sea views, high-end marble flooring, and modular kitchen.',
            'property_type': 'Apartment',
            'status': 'available',
            'price': 42000000.00,
            'area_sqft': 1850,
            'bedrooms': 3,
            'bathrooms': 3,
            'balcony': 2,
            'parking': 2,
            'furnished': 'Furnished',
            'facing': 'West',
            'city': 'Mumbai',
            'address': 'Bandra West, Hill Road',
            'latitude': 19.0596,
            'longitude': 72.8295,
            'location_score': 9.2,
            'amenities': ['Swimming Pool', 'Gym', 'Security', 'Lift', 'Club House'],
        },
        {
            'title': 'Modern 2 BHK Gated Community Apartment in Whitefield',
            'description': 'Spacious 2BHK located in IT corridor with IT Park connectivity, clubhouse, and lush green landscaping.',
            'property_type': 'Apartment',
            'status': 'available',
            'price': 9500000.00,
            'area_sqft': 1250,
            'bedrooms': 2,
            'bathrooms': 2,
            'balcony': 1,
            'parking': 1,
            'furnished': 'Semi-Furnished',
            'facing': 'East',
            'city': 'Bangalore',
            'address': 'Whitefield Main Road',
            'latitude': 12.9698,
            'longitude': 77.7500,
            'location_score': 8.5,
            'amenities': ['Gym', 'Lift', 'Security', 'Power Backup', 'CCTV'],
        },
        {
            'title': 'Independent 4 BHK Villa in Jubilee Hills',
            'description': 'Exclusive modern 4BHK villa with private swimming pool, home theater, landscaped garden and solar power.',
            'property_type': 'Villa',
            'status': 'available',
            'price': 75000000.00,
            'area_sqft': 4200,
            'bedrooms': 4,
            'bathrooms': 5,
            'balcony': 3,
            'parking': 3,
            'furnished': 'Furnished',
            'facing': 'North',
            'city': 'Hyderabad',
            'address': 'Road No 36, Jubilee Hills',
            'latitude': 17.4319,
            'longitude': 78.4071,
            'location_score': 9.5,
            'amenities': ['Swimming Pool', 'Garden', 'Security', 'Solar Energy', 'Fire Safety'],
        }
    ]

    prop_count = 0
    for p_data in sample_props:
        amenities = p_data.pop('amenities', [])
        p_data['seller'] = seller
        prop, created = Property.objects.get_or_create(title=p_data['title'], defaults=p_data)
        if created:
            prop.amenities = amenities
            prop.save()
            prop_count += 1

    print(f"  ✓ Seeded {Property.objects.count()} properties ({prop_count} new)")

    print("\n🎉 Database setup complete! Available Test Accounts:")
    print("  🔴 Admin  : admin@estatehub.ai / Admin@12345")
    print("  🟢 Seller : seller@test.com / Test@12345")
    print("  🔵 Buyer  : buyer@test.com / Test@12345")

if __name__ == '__main__':
    seed()
