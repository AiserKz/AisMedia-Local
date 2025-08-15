from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password

from main.models import Profile
from main.serializers import ProfileSerializer



class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request):
        # GET /api/profile/
        profile = Profile.objects.select_related('user').get(user=request.user)
        profile = ProfileSerializer(profile).data
        return Response({"status": "success", "message": "Профиль получен", "profile": profile}, status=status.HTTP_200_OK)
    
    def create(self, request):
        # POST /api/profile/
        print("Пришел POST запрос на /api/profile/")
        user = request.user
        old_password = request.data.get('oldPassword')
        new_password = request.data.get('newPassword')
        confirm_password = request.data.get('confirmPassword')
        if not old_password or not new_password or not confirm_password:
            return Response({"status": "error", "message": "Заполните все поля"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        if not user.check_password(old_password):
            return Response({"status": "error", "message": "Неверный старый пароль"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        if new_password != confirm_password:
            return Response({"status": "error", "message": "Пароли не совпадают"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        user.password = make_password(new_password)
        user.save()
        return Response({"status": "success", "message": "Пароль изменен"}, status=status.HTTP_200_OK)
    
    def update(self, request):
        #  PUT /api/profile/
        print("Пришел PUT запрос на /api/profile/", request.data)
        profile = Profile.objects.get(user=request.user)
        setializer = ProfileSerializer(profile, data=request.data, partial=True)
        if setializer.is_valid():
            setializer.save()
            return Response({"status": "success", "message": "Профиль обновлен", "profile": setializer.data}, status=status.HTTP_200_OK)
        return Response({"status": "error", "message": list(setializer.errors.values())[0][0]}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def destroy(self, request):
        # DELETE /api/profile/
        return Response({"status": "success", "message": "Профиль удален"}, status=status.HTTP_200_OK)
        request.user.delete()
        
        
profile_view = UserViewSet.as_view({
    'get': 'retrieve',
    'post': 'create',
    'put': 'update',
    'delete': 'destroy'
})
