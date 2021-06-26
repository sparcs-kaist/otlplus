from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User


class PasswordlessModelBackend(ModelBackend):
    def authenticate(self, username=None):
        try:
            user = User.objects.get(username=username)
            if user.is_staff or user.is_superuser:
                return None
            return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
