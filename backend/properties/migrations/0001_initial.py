import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Property',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False,
                    primary_key=True, serialize=False)),
                ('seller', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='properties',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('property_type', models.CharField(max_length=20, choices=[
                    ('Apartment', 'Apartment'), ('Villa', 'Villa'), ('House', 'House'),
                    ('Farm', 'Farm'), ('Office', 'Office'), ('Commercial', 'Commercial'),
                    ('Industrial', 'Industrial'),
                ])),
                ('status', models.CharField(max_length=10, default='available', choices=[
                    ('available', 'Available'), ('sold', 'Sold'),
                    ('rented', 'Rented'), ('archived', 'Archived'),
                ])),
                ('price', models.DecimalField(max_digits=15, decimal_places=2)),
                ('ai_estimated_price', models.DecimalField(
                    max_digits=15, decimal_places=2, null=True, blank=True)),
                ('area_sqft', models.PositiveIntegerField()),
                ('bedrooms', models.PositiveIntegerField()),
                ('bathrooms', models.PositiveIntegerField()),
                ('balcony', models.PositiveIntegerField(default=0)),
                ('parking', models.PositiveIntegerField(default=0)),
                ('floor', models.PositiveIntegerField(default=0)),
                ('age_years', models.PositiveIntegerField(default=0)),
                ('facing', models.CharField(max_length=20, blank=True, choices=[
                    ('North', 'North'), ('South', 'South'), ('East', 'East'), ('West', 'West'),
                    ('North-East', 'North-East'), ('North-West', 'North-West'),
                    ('South-East', 'South-East'), ('South-West', 'South-West'),
                ])),
                ('furnished', models.CharField(max_length=20, default='Unfurnished', choices=[
                    ('Furnished', 'Furnished'), ('Semi-Furnished', 'Semi-Furnished'),
                    ('Unfurnished', 'Unfurnished'),
                ])),
                ('water_supply', models.BooleanField(default=True)),
                ('electricity', models.BooleanField(default=True)),
                ('city', models.CharField(max_length=100)),
                ('address', models.TextField()),
                ('latitude', models.FloatField(null=True, blank=True)),
                ('longitude', models.FloatField(null=True, blank=True)),
                ('location_score', models.FloatField(default=5.0)),
                ('road_width', models.PositiveIntegerField(default=20)),
                ('nearby_schools', models.PositiveIntegerField(default=0)),
                ('nearby_hospital', models.PositiveIntegerField(default=0)),
                ('nearby_metro', models.PositiveIntegerField(default=0)),
                ('nearby_mall', models.BooleanField(default=False)),
                ('nearby_airport', models.BooleanField(default=False)),
                ('video_url', models.URLField(blank=True, null=True)),
                ('views_count', models.PositiveIntegerField(default=0)),
                ('saved_count', models.PositiveIntegerField(default=0)),
                ('inquiry_count', models.PositiveIntegerField(default=0)),
                ('amenities', models.JSONField(default=list, blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('published_at', models.DateTimeField(null=True, blank=True)),
            ],
            options={'db_table': 'properties', 'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='PropertyImage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False,
                    primary_key=True, serialize=False)),
                ('property', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='images',
                    to='properties.property',
                )),
                ('image', models.ImageField(upload_to='properties/')),
                ('is_primary', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'db_table': 'property_images', 'ordering': ['order']},
        ),
    ]
