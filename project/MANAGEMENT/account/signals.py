# account/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Student, Teacher

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'student':
            Student.objects.create(user=instance)
        elif instance.role == 'teacher':
            Teacher.objects.create(user=instance)
