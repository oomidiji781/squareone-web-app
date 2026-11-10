
from django.urls import path
from .views import (
    HealthCheckView,
    ClientListCreateView,
    StudentListCreateView,
    AssignmentListCreateView,
)

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("clients/", ClientListCreateView.as_view(), name="client-list"),
    path("students/", StudentListCreateView.as_view(), name="student-list"),
    path("assignments/", AssignmentListCreateView.as_view(), name="assignment-list"),
]
