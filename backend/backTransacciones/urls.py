from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransaccionViewSet, AlertaViewSet

router = DefaultRouter()
router.register(r'', TransaccionViewSet, basename='transaccion')
router.register(r'alertas', AlertaViewSet, basename='alerta')

urlpatterns = router.urls
