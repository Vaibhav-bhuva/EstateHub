import uuid
from django.db import models


class City(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    state = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    popular_areas = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    property_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cities'
        ordering = ['name']

    def __str__(self):
        return f'{self.name}, {self.state}'
