from rest_framework import viewsets, permissions
from .models import Transaccion, Alerta
from backPresupuestos.models import Presupuesto
from .serializers import TransaccionSerializer, AlertaSerializer
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all()
    serializer_class = TransaccionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        transaccion = serializer.save(usuario=self.request.user)
        # Solo debemos realizar la validación cuando se trata de un Gasto y la categoría esté asignada
        if transaccion.tipo == 'Gasto' and transaccion.categoria:
            presupuesto = Presupuesto.objects.filter(
                usuario=self.request.user,
                categoria=transaccion.categoria
            ).first()

            if presupuesto:
                total_gastado = Transaccion.objects.filter(
                    usuario=self.request.user,
                    categoria=transaccion.categoria,
                    tipo='Gasto'
                ).aggregate(total=Sum('monto'))['total'] or 0

                if total_gastado > presupuesto.monto:
                    mensaje = (
                        f"Gasto excesivo en {transaccion.categoria}. Presupuesto asignado: "
                        f"${presupuesto.monto}, total gastado: ${total_gastado}."
                    )
                    Alerta.objects.create(
                        usuario=self.request.user,
                        mensaje=mensaje
                    )

class AlertaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AlertaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alerta.objects.filter(usuario=self.request.user)


class IngresoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['tipo'] = 'Ingreso'  # Fuerza el tipo a 'Ingreso'

        serializer = TransaccionSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        transaccion = serializer.save(usuario=request.user, tipo='Ingreso')


        # Obtener o crear presupuesto correspondiente
        presupuesto, created = Presupuesto.objects.get_or_create(
            usuario=request.user,
            categoria=transaccion.categoria
        )

        # Aumentar el monto del presupuesto
        presupuesto.monto += transaccion.monto
        total_gastado = Transaccion.objects.filter(
            usuario=request.user,
            categoria=transaccion.categoria,
            tipo='Gasto'
        ).aggregate(total=Sum('monto'))['total'] or 0

        print(f"Total gastado en la categoría '{transaccion.categoria.nombre}': {total_gastado}")

        # Se recalcula el balance
        presupuesto.balance = presupuesto.monto - total_gastado
        print(f"variable presupuesto monto :{presupuesto.monto}")
        print(f"variable presupuesto balance : {presupuesto.balance}")
        presupuesto.save()

        return Response({
            'transaccion': serializer.data,
            'presupuesto': {
                'categoria': presupuesto.categoria.nombre,
                'monto': presupuesto.monto,
                'balance': presupuesto.balance
            }
        }, status=status.HTTP_201_CREATED)