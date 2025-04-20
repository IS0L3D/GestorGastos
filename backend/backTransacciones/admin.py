from django.contrib import admin
from .models import Transaccion, Alerta

@admin.register(Transaccion)
class TransaccionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo', 'monto', 'categoria', 'fecha')
    list_filter = ('tipo', 'categoria')
    search_fields = ('usuario__email', 'descripcion')

@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'mensaje', 'fecha', 'leida')
    list_filter = ('leida',)
    search_fields = ('usuario__email', 'mensaje')