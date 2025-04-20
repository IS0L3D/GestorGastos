from rest_framework import serializers
from .models import Categoria, Presupuesto, Recurrencia

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'
        extra_kwargs = {'usuario': {'read_only': True}}

class PresupuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presupuesto
        fields = '__all__'
        extra_kwargs = {'usuario': {'read_only': True}}

class RecurrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurrencia
        fields = '__all__'
        extra_kwargs = {'usuario': {'read_only': True}}