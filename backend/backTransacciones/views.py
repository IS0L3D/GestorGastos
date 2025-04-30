from rest_framework import viewsets, permissions
from .models import Transaccion, Alerta
from backPresupuestos.models import Presupuesto
from .serializers import TransaccionSerializer, AlertaSerializer
from django.db.models import Sum

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