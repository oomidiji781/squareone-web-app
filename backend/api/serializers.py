
from rest_framework import serializers
from .models import Client, Student, Assignment


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "title",
            "student",
            "student_name",
            "due_date",
            "status",
        ]


from .models import ResumeSubmission


class ResumeSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.name",
        read_only=True
    )

    class Meta:
        model = ResumeSubmission
        fields = [
            "id",
            "student",
            "student_name",
            "resume",
            "version",
            "review_status",
            "mentor_feedback",
            "submitted_at",
            "reviewed_at",
        ]
        read_only_fields = [
            "id",
            "submitted_at",
            "reviewed_at",
        ]
