from django.db import models

class Client(models.Model):
    STATUS_CHOICES = [
        ('home', 'Home'),
        ('away_with_family', 'Away with Family'),
        ('hospital', 'At Hospital'),
    ]

    name = models.CharField(max_length=100)
    room_number = models.CharField(max_length=20, blank=True)
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='home'
    )
    latest_update = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    
class Student(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Completed', 'Completed'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    progress = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Active'
    )

    def __str__(self):
        return self.name

class Assignment(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
    ]

    title = models.CharField(max_length=200)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="assignments"
    )
    due_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    def __str__(self):
        return self.title
