from rest_framework import viewsets, permissions
from .models import Transaccion, Alerta
from backPresupuestos.models import Presupuesto
from .serializers import TransaccionSerializer, AlertaSerializer

class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all()
    serializer_class = TransaccionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        transaccion = serializer.save(usuario=self.request.user)
        if transaccion.tipo == 'Gasto':
            presupuesto = Presupuesto.objects.filter(
                usuario=self.request.user,
                categoria=transaccion.categoria
            ).first()
            if presupuesto and transaccion.monto > presupuesto.monto:
                Alerta.objects.create(
                    usuario=self.request.user,
                    mensaje=f"Gasto excesivo en {transaccion.categoria}: ${transaccion.monto}"
                )

class AlertaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AlertaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alerta.objects.filter(usuario=self.request.user)