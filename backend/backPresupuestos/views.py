from rest_framework import viewsets, permissions
from .models import Categoria, Presupuesto, Recurrencia
from .serializers import CategoriaSerializer, PresupuestoSerializer, RecurrenciaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class PresupuestoViewSet(viewsets.ModelViewSet):
    queryset = Presupuesto.objects.all()
    serializer_class = PresupuestoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)

class RecurrenciaViewSet(viewsets.ModelViewSet):
    queryset = Recurrencia.objects.all()
    serializer_class = RecurrenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)