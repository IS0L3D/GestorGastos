from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.core.validators import RegexValidator
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=CustomUser.objects.all(),
                message="Este correo ya está registrado"
            )
        ]
    )
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={'input_type': 'password'},
        validators=[
            RegexValidator(
                regex='^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$',
                message='La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
            )
        ]
    )

    class Meta:
        model = CustomUser
        fields = ('email', 'name', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=password,
            **{k: v for k, v in validated_data.items() if k != 'email'}
        )
        return user