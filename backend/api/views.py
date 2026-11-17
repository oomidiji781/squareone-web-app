
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


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class AssignmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Assignment.objects.select_related("student").order_by("due_date")
    serializer_class = AssignmentSerializer


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer


from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ResumeSubmission
from .serializers import ResumeSubmissionSerializer


class ResumeSubmissionListCreateView(generics.ListCreateAPIView):
    queryset = ResumeSubmission.objects.select_related("student").all()
    serializer_class = ResumeSubmissionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class ResumeSubmissionDetailView(generics.RetrieveUpdateAPIView):
    queryset = ResumeSubmission.objects.select_related("student").all()
    serializer_class = ResumeSubmissionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
