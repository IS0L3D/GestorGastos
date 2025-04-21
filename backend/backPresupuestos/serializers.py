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

class InitialCategorySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    allocated = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    predefined = serializers.BooleanField()

class InitialSetupSerializer(serializers.Serializer):
    total_budget = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0.01)
    categories = InitialCategorySerializer(many=True)

    def validate(self, data):
        total = data['total_budget']
        sum_cats = sum(cat['allocated'] for cat in data['categories'])
        if sum_cats != total:
            raise serializers.ValidationError(
                f"La suma de categorías ({sum_cats}) no coincide con el presupuesto total ({total})."
            )
        return data