from django.db import models
from django.core.validators import MinValueValidator
from backUsuarios.models import CustomUser

class Categoria(models.Model):
    PREDEFINIDAS = [
        ('Alimentación', 'Alimentación'),
        ('Transporte', 'Transporte'),
        ('Educación', 'Educación'),
        ('Ocio', 'Ocio'),
        ('Salud', 'Salud'),
    ]
    
    nombre = models.CharField('Nombre', max_length=50, choices=PREDEFINIDAS, blank=True)
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    personalizada = models.CharField('Personalizada', max_length=50, blank=True)
    es_predefinida = models.BooleanField('Predefinida', default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['usuario', 'nombre'],
                name='unique_predefinida_usuario'
            ),
            models.UniqueConstraint(
                fields=['usuario', 'personalizada'],
                name='unique_personalizada_usuario'
            )
        ]
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'

    def __str__(self):
        return self.nombre if self.es_predefinida else self.personalizada

class Presupuesto(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    monto = models.DecimalField('Monto', max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    periodo = models.CharField('Periodo', max_length=20, default='mensual')

    class Meta:
        verbose_name = 'Presupuesto'
        verbose_name_plural = 'Presupuestos'

    def __str__(self):
        return f"{self.usuario.email} - {self.categoria} (${self.monto})"

class Recurrencia(models.Model):
    TIPO_CHOICES = [('Ingreso', 'Ingreso'), ('Gasto', 'Gasto')]
    FRECUENCIA_CHOICES = [('Diaria', 'Diaria'), ('Semanal', 'Semanal'), ('Mensual', 'Mensual')]

    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    tipo = models.CharField('Tipo', max_length=10, choices=TIPO_CHOICES)
    monto = models.DecimalField('Monto', max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    frecuencia = models.CharField('Frecuencia', max_length=10, choices=FRECUENCIA_CHOICES)
    proxima_fecha = models.DateField('Próxima fecha')

    class Meta:
        verbose_name = 'Recurrencia'
        verbose_name_plural = 'Recurrencias'

    def __str__(self):
        return f"{self.tipo} recurrente - {self.usuario.email}"