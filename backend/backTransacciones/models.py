from django.db import models
from django.core.validators import MinValueValidator
from backUsuarios.models import CustomUser
from backPresupuestos.models import Categoria

class Transaccion(models.Model):
    TIPO_CHOICES = [('Ingreso', 'Ingreso'), ('Gasto', 'Gasto')]

    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    tipo = models.CharField('Tipo', max_length=10, choices=TIPO_CHOICES)
    monto = models.DecimalField('Monto', max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True)
    fecha = models.DateField('Fecha')
    descripcion = models.TextField('Descripción', blank=True)

    class Meta:
        verbose_name = 'Transacción'
        verbose_name_plural = 'Transacciones'

    def __str__(self):
        return f"{self.tipo} - {self.usuario.email} (${self.monto})"

class Alerta(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    mensaje = models.TextField('Mensaje')
    fecha = models.DateTimeField('Fecha', auto_now_add=True)
    leida = models.BooleanField('Leída', default=False)

    class Meta:
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'

    def __str__(self):
        return f"Alerta para {self.usuario.email}"