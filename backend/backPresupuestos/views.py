from rest_framework import viewsets, permissions, status
from .models import Categoria, Presupuesto, Recurrencia
from .serializers import CategoriaSerializer, PresupuestoSerializer, RecurrenciaSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from .serializers import InitialSetupSerializer
from django.utils import timezone
from django.db.models import Sum, Case, When, Value, F, ExpressionWrapper
from django.db.models.functions import Coalesce
from django.db.models import DecimalField, CharField

from reportlab.pdfgen import canvas
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


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

class InitialSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = InitialSetupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        total_budget = serializer.validated_data['total_budget']
        for cat in serializer.validated_data['categories']:
            name = cat['name']
            allocated = cat['allocated']
            predefined = cat['predefined']

            if predefined:
                categoria_obj, _ = Categoria.objects.get_or_create(
                    usuario=user,
                    nombre=name,
                    es_predefinida=True,
                    defaults={'personalizada': ''}
                )
            else:
                categoria_obj, _ = Categoria.objects.get_or_create(
                    usuario=user,
                    personalizada=name,
                    es_predefinida=False,
                    defaults={'nombre': ''}
                )

            Presupuesto.objects.create(
                usuario=user,
                categoria=categoria_obj,
                monto=allocated,
                periodo='mensual'
            )

        return Response(
            {"status": "Configuración exitosa"},
            status=status.HTTP_201_CREATED
        )

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        categorias_data = Presupuesto.objects.filter(
            usuario=user,
            categoria__isnull=False
        ).annotate(
            categoria_nombre=Case(
                When(categoria__es_predefinida=True, then=F('categoria__nombre')),
                default=F('categoria__personalizada'),
                output_field=CharField()
            ),
            gasto_total=Coalesce(
                Sum(
                    Case(
                        When(
                            categoria__transaccion__fecha__month=current_month,
                            categoria__transaccion__fecha__year=current_year,
                            then=F('categoria__transaccion__monto')
                        ),
                        default=0,
                        output_field=DecimalField()
                    )
                ),
                0
            )
        ).values('categoria', 'categoria_nombre', 'monto').annotate(
            restante=ExpressionWrapper(
                F('monto') - F('gasto_total'),
                output_field=DecimalField()
            )
        )
        
        total_presupuesto = sum(item['monto'] for item in categorias_data)
        total_gastado = sum(item['monto'] - item['restante'] for item in categorias_data)
        total_restante = total_presupuesto - total_gastado
        
        data = {
            "total_presupuesto": total_presupuesto,
            "total_gastado": total_gastado,
            "total_restante": total_restante,
            "categorias": [
                {
                    "id": item['categoria'],
                    "nombre": item['categoria_nombre'],
                    "asignado": item['monto'],
                    "gastado": round(float(item['monto'] - item['restante']), 2),
                    "restante": round(float(item['restante']), 2),
                    "porcentaje_uso": round(
                        ((item['monto'] - item['restante']) / item['monto']) * 100, 1
                    ) if item['monto'] > 0 else 0
                }
                for item in categorias_data
            ]
        }
        
        return Response(data)

# ------------------- Reporte PDF -------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generar_reporte_pdf(request):
    user = request.user
    current_month = timezone.now().month
    current_year = timezone.now().year

    presupuestos = Presupuesto.objects.filter(
        usuario=user,
        categoria__isnull=False
    ).annotate(
        categoria_nombre=Case(
            When(categoria__es_predefinida=True, then=F('categoria__nombre')),
            default=F('categoria__personalizada'),
            output_field=CharField()
        ),
        gasto_total=Coalesce(
            Sum(
                Case(
                    When(
                        categoria__transaccion__fecha__month=current_month,
                        categoria__transaccion__fecha__year=current_year,
                        then=F('categoria__transaccion__monto')
                    ),
                    default=0,
                    output_field=DecimalField()
                )
            ),
            0
        )
    ).values('categoria_nombre', 'monto').annotate(
        restante=ExpressionWrapper(
            F('monto') - F('gasto_total'),
            output_field=DecimalField()
        )
    )

    total_asignado = sum(p['monto'] for p in presupuestos)
    total_gastado = sum(p['monto'] - p['restante'] for p in presupuestos)
    saldo_final = total_asignado - total_gastado

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_presupuesto.pdf"'

    p = canvas.Canvas(response)
    p.setFont("Helvetica", 12)
    y = 800

    p.drawString(100, y, f"📄 Reporte de Presupuesto - {user.username}")
    y -= 30

    for item in presupuestos:
        gastado = item['monto'] - item['restante']
        p.drawString(100, y,
                     f"{item['categoria_nombre']}: Asignado ${item['monto']:.2f}, Gastado ${gastado:.2f}, Restante ${item['restante']:.2f}")
        y -= 20
        if y < 100:
            p.showPage()
            p.setFont("Helvetica", 12)
            y = 800

    y -= 20
    p.drawString(100, y, f"Total Asignado: ${total_asignado:.2f}")
    y -= 20
    p.drawString(100, y, f"Total Gastado: ${total_gastado:.2f}")
    y -= 20
    p.drawString(100, y, f"Saldo Final: ${saldo_final:.2f}")

    p.showPage()
    p.save()
    return response