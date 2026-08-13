from django.db import migrations


class Migration(migrations.Migration):
    """
    ML Engine has no Django ORM models.
    All prediction history is stored in MongoDB via PyMongo (core.mongo).
    """
    initial = True
    dependencies = []
    operations = []
