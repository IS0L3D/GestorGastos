from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinLengthValidator, RegexValidator
from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superusuario debe tener is_superuser=True')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField('Correo', unique=True)
    name = models.CharField(
        'Nombre',
        max_length=150,
        validators=[
            MinLengthValidator(2, "El nombre debe tener al menos 2 caracteres"),
            RegexValidator(
                regex='^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$',
                message='Solo se permiten letras y espacios',
                code='invalid_name'
            )
        ]
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        if self.name:
            self.name = ' '.join(word.capitalize() for word in self.name.strip().split())
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
