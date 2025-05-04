from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from backUsuarios.views import RegisterView, ConfigStatusView
from backPresupuestos.views import InitialSetupView, DashboardView
from backTransacciones.views import IngresoView



urlpatterns = [
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/config-status/', ConfigStatusView.as_view(), name='config-status'),
    path('api/presupuestos/initial-setup/', InitialSetupView.as_view(), name='initial-setup'),
    path('api/presupuestos/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/transacciones/', include('backTransacciones.urls')),
]
