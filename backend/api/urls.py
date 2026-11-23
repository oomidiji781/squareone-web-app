from django.urls import path

from .views import (
    ProfileView,
    ChangePasswordView,
    UserListCreateView,
    UserDetailView,
    ResumeSubmissionListCreateView,
    ResumeSubmissionDetailView,
    HealthCheckView,
    ClientListCreateView,
    StudentListCreateView,
    AssignmentListCreateView,
    AssignmentDetailView,
    StudentDetailView,
)

urlpatterns = [
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("users/", UserListCreateView.as_view(), name="user-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("resume-submissions/", ResumeSubmissionListCreateView.as_view(), name="resume-submission-list"),
    path("resume-submissions/<int:pk>/", ResumeSubmissionDetailView.as_view(), name="resume-submission-detail"),
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("clients/", ClientListCreateView.as_view(), name="client-list"),
    path("students/", StudentListCreateView.as_view(), name="student-list"),
    path("students/<int:pk>/", StudentDetailView.as_view(), name="student-detail"),
    path("assignments/", AssignmentListCreateView.as_view(), name="assignment-list"),
    path("assignments/<int:pk>/", AssignmentDetailView.as_view(), name="assignment-detail"),
]