from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    BasePermission,
)
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Client, Student, Assignment, ResumeSubmission
from .serializers import (
    ClientSerializer,
    StudentSerializer,
    AssignmentSerializer,
    ResumeSubmissionSerializer,
    UserManagementSerializer,
)

User = get_user_model()


class IsAdministrator(BasePermission):
    message = "Only administrators can manage user accounts."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.is_superuser
        )


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdministrator]
    serializer_class = UserManagementSerializer
    queryset = User.objects.all().order_by("username")


class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdministrator]
    serializer_class = UserManagementSerializer
    queryset = User.objects.all()


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def profile_data(self, user):
        return {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "full_name": user.get_full_name() or user.username,
            "role": "Administrator" if user.is_superuser else "Staff",
            "date_joined": user.date_joined,
        }

    def get(self, request):
        return Response(self.profile_data(request.user))

    def patch(self, request):
        user = request.user

        for field in ["first_name", "last_name", "email"]:
            if field in request.data:
                value = request.data[field]

                if not isinstance(value, str):
                    return Response(
                        {field: "Enter a valid text value."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                setattr(user, field, value.strip())

        if user.email:
            user.email = user.email.lower()

            if User.objects.filter(
                email__iexact=user.email
            ).exclude(pk=user.pk).exists():
                return Response(
                    {"email": "A user with this email already exists."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            user.full_clean()
        except ValidationError as error:
            return Response(
                error.message_dict,
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.save(update_fields=["first_name", "last_name", "email"])

        return Response(self.profile_data(user))


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not all(
            isinstance(value, str) and value
            for value in [
                current_password,
                new_password,
                confirm_password,
            ]
        ):
            return Response(
                {"detail": "All password fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(current_password):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {"detail": "New passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.check_password(new_password):
            return Response(
                {"detail": "Choose a different password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user)
        except ValidationError as error:
            return Response(
                {"detail": " ".join(error.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"detail": "Password changed successfully."},
            status=status.HTTP_200_OK,
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
    permission_classes = [IsAuthenticated]
    queryset = Client.objects.all().order_by("-updated_at")
    serializer_class = ClientSerializer


class StudentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Student.objects.all().order_by("name")
    serializer_class = StudentSerializer


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class AssignmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Assignment.objects.select_related("student").order_by("due_date")
    serializer_class = AssignmentSerializer


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer


class ResumeSubmissionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ResumeSubmission.objects.select_related("student").all()
    serializer_class = ResumeSubmissionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class ResumeSubmissionDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ResumeSubmission.objects.select_related("student").all()
    serializer_class = ResumeSubmissionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]