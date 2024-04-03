from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

class TestModel(models.Model):
    name = models.CharField(max_length=100)

class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password, preferences=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')

        email = self.normalize_email(email)
        
        if self.model.objects.filter(email=email).exists():
            raise ValueError('Email address already exists')

        user = self.model(email=email, name=name, preferences=preferences, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, name, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    preferences = models.TextField(blank=True, null=True)  # Optional field
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']  # Removed 'preferences' from REQUIRED_FIELDS

    objects = CustomUserManager()

    def __str__(self):
        return self.email
