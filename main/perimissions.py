from rest_framework.permissions import BasePermission
from .models import Profile
from rest_framework.exceptions import PermissionDenied


def LevelPermissionFactory(min_level: int):
    class CustomLevelPermission(BasePermission):
        def has_permission(self, request, view):
            profile = Profile.objects.select_related('user').get(user=request.user)
            if profile.level < min_level:
                raise PermissionDenied({'status': 'error', 'message': 'У вас недостаточно прав'})
            return True
    return CustomLevelPermission