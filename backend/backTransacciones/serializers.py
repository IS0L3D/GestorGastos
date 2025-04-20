from rest_framework import serializers
from .models import Transaccion, Alerta

class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = '__all__'
        extra_kwargs = {'usuario': {'read_only': True}}

class AlertaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerta
        fields = '__all__'
        extra_kwargs = {'usuario': {'read_only': True}}