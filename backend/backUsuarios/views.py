from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ConfigStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'has_configured_budget': request.user.has_configured_budget,
            'email': request.user.email
        })

    def patch(self, request):
        user = request.user
        user.has_configured_budget = True
        user.save(update_fields=['has_configured_budget'])
        return Response({'status': 'Configuración actualizada'}, status=status.HTTP_200_OK)