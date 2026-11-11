
from django.urls import path

from .views import (
    HealthCheckView,
    ClientListCreateView,
    StudentListCreateView,
    AssignmentListCreateView,
    AssignmentDetailView,
    StudentDetailView,
)

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("clients/", ClientListCreateView.as_view(), name="client-list"),
    path("students/", StudentListCreateView.as_view(), name="student-list"),
    path("students/<int:pk>/", StudentDetailView.as_view(), name="student-detail"),
    path("assignments/", AssignmentListCreateView.as_view(), name="assignment-list"),
    path("assignments/<int:pk>/", AssignmentDetailView.as_view(), name="assignment-detail"),
]
