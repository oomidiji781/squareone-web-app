
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status, generics

from .models import Client, Student, Assignment
from .serializers import (
    ClientSerializer,
    StudentSerializer,
    AssignmentSerializer,
)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "message": "Django REST API is running!",
            },
            status=status.HTTP_200_OK,
        )


class ClientListCreateView(generics.ListCreateAPIView):
    queryset = Client.objects.all().order_by("-updated_at")
    serializer_class = ClientSerializer


class StudentListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Student.objects.all().order_by("name")
    serializer_class = StudentSerializer


class AssignmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Assignment.objects.select_related("student").order_by("due_date")
    serializer_class = AssignmentSerializer


class AssignmentDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
