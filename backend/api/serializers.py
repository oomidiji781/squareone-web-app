from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import Client, Student, Assignment, ResumeSubmission

User = get_user_model()


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.name",
        read_only=True
    )

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


class UserManagementSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    password = serializers.CharField(
        write_only=True,
        required=False,
        trim_whitespace=False
    )

    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "password",
            "role",
            "is_staff",
            "is_active",
            "date_joined",
            "last_login",
        ]

        read_only_fields = [
            "id",
            "full_name",
            "role",
            "is_staff",
            "date_joined",
            "last_login",
        ]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_role(self, obj):
        if obj.is_superuser:
            return "Administrator"
        return "Staff"

    def validate_email(self, value):
        value = value.strip().lower()

        users = User.objects.filter(email__iexact=value)

        if self.instance:
            users = users.exclude(pk=self.instance.pk)

        if users.exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate(self, attrs):
        password = attrs.get("password")
        request = self.context.get("request")

        if self.instance is None and not password:
            raise serializers.ValidationError({
                "password": "A password is required."
            })

        if self.instance is not None:
            if self.instance.is_superuser:
                raise serializers.ValidationError(
                    "Administrator accounts cannot be modified here."
                )

            if (
                request
                and request.user.pk == self.instance.pk
                and attrs.get("is_active") is False
            ):
                raise serializers.ValidationError({
                    "is_active": "You cannot deactivate your own account."
                })

            if "password" in attrs:
                raise serializers.ValidationError({
                    "password": "Use the Change Password feature."
                })

        if password:
            candidate = User(
                username=attrs.get("username", ""),
                first_name=attrs.get("first_name", ""),
                last_name=attrs.get("last_name", ""),
                email=attrs.get("email", "")
            )

            try:
                validate_password(password, user=candidate)
            except ValidationError as error:
                raise serializers.ValidationError({
                    "password": list(error.messages)
                })

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(
            **validated_data,
            is_staff=False,
            is_superuser=False
        )

        user.set_password(password)
        user.save()

        return user

    def update(self, instance, validated_data):
        validated_data.pop("password", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        return instance