from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, username, name, password=None, preferences=None, **extra_fields):
        if not username:
            raise ValueError('The Email field must be set')

        username = self.normalize_email(username)
        if self.model.objects.filter(username=username).exists():
            raise ValueError('Email address already exists')

        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)

        user = self.model(username=username, name=name, preferences=preferences, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, name, password=None, **extra_fields):
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, name, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    username = models.EmailField(unique=True)
    preferences = models.TextField(blank=True, null=True)  # Optional field
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)



    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['name']

    objects = CustomUserManager()
    
    class Meta:
        db_table = 'backend_customuser'

    def __str__(self):
        return self.username
