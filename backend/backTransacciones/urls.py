from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransaccionViewSet, AlertaViewSet, IngresoView

router = DefaultRouter()
router.register(r'', TransaccionViewSet, basename='transaccion')
router.register(r'alertas', AlertaViewSet, basename='alerta')

urlpatterns = [
    path('ingreso/', IngresoView.as_view(), name='crear_ingreso'),
] + router.urls

