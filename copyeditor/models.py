from django.db import models

# Create your models here.
class Test_case(models.Model):
    response_text = models.CharField(max_length=50, blank=True)