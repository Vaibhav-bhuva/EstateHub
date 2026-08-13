import uuid
from django.db import models
from django.conf import settings
from properties.models import Property


class Inquiry(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('contacted', 'Contacted'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='inquiries')
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_inquiries'
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_inquiries'
    )
    buyer_email = models.EmailField()
    buyer_name = models.CharField(max_length=200)
    buyer_phone = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField()
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    visit_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    seller_note = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f'Inquiry for {self.property.title} by {self.buyer_name}'
