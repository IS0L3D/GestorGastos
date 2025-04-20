from django.contrib import admin
from .models import Categoria, Presupuesto, Recurrencia

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'usuario', 'es_predefinida')
    list_filter = ('es_predefinida',)
    search_fields = ('nombre', 'usuario__email')

@admin.register(Presupuesto)
class PresupuestoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'categoria', 'monto', 'periodo')
    search_fields = ('usuario__email', 'categoria__nombre')

@admin.register(Recurrencia)
class RecurrenciaAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo', 'monto', 'frecuencia', 'proxima_fecha')
    list_filter = ('tipo', 'frecuencia')
    search_fields = ('usuario__email', 'categoria__nombre')