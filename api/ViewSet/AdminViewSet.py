from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from main.models import Movie, Series, Episode, Genre, User
import main.serializers as sr
from main.perimissions import LevelPermissionFactory
from rest_framework.decorators import api_view, permission_classes, parser_classes, action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from main import utils
from django.http import JsonResponse

class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, LevelPermissionFactory(2)]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    # Обработчики Фильмов
    @action(detail=False, methods=['post'])
    def upload_movie(self, request):
        print(request.data)
        serializer = sr.MovieUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "message": "Фильм загружен"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    @action(detail=True, methods=['put'])
    def update_movie(self, request, pk=None):
        movie = get_object_or_404(Movie, id=pk)
        serializer = sr.MovieUpdateSerializer(movie, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "message": "Фильм обновлен"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def delete_movie(self, request, pk=None):
        movie = get_object_or_404(Movie, id=pk)
        movie.delete()
        return Response({"status": "success", "message": "Фильм удален"}, status=status.HTTP_200_OK)

    # Обработчики Эпизодов
    @action(detail=False, methods=['post'])
    def add_episode(self, request):
        serializer = sr.EpisodeUploadSerializer(data=request.data)
        if serializer.is_valid():
            episode = serializer.save()
            return Response({
                "status": "success", 
                "message": "Серия загружена", 
                "episode": sr.EpisodeSerializer(episode).data
            }, status=status.HTTP_201_CREATED)
        
        first_error = next(iter(serializer.errors.values()))[0] or "Не удалось загрузить серию"
        return Response({
                "status": "error", 
                "message": str(first_error)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete', 'put'])
    def update_episode(self, request, pk=None):
        episode = get_object_or_404(Episode, id=pk)
        if (request.method == "DELETE"):
            episode.delete()
            return Response({"status": "success", "message": "Серия удалена"}, status=status.HTTP_200_OK)
        elif (request.method == "PUT"):
            serializer = sr.EpisodeUpdateSerializer(episode, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"status": "success", "message": "Серия обновлена"}, status=status.HTTP_200_OK) 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)   
        
        return Response({"status": "success", "message": "Неизвестная операция"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    # Обработчик жанров
    @action(detail=False, methods=['post'])
    def genre(self, request):
        print(request.data)
        genreName = str(request.data.get('name')).strip().lower().capitalize()
        
        if genreName == "":
            return JsonResponse({"status": "error", "message": "Название жанра не может быть пустым!"}, status=status.HTTP_400_BAD_REQUEST)
        elif Genre.objects.filter(name=genreName).first() != None:
            return JsonResponse({"status": "error", "message": "Такой жанр уже существует!"}, status=status.HTTP_400_BAD_REQUEST)

        Genre.objects.create(name=genreName)
        return JsonResponse({"status": "success", "message": "Жанр добавлен!"}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['put'])
    def updateGenre(self, request, pk=None):
        genre = get_object_or_404(Genre, id=pk)
        serializer = sr.GenreUpdateSerializer(genre, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "success", "message": "Жанр обновлен"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def delete_genre(self, request, pk=None):
        genre = get_object_or_404(Genre, id=pk)
        genre.delete()
        return Response({"status": "success", "message": "Жанр удален"}, status=status.HTTP_200_OK)
    
    # Обработчик Пользователей
    @action(detail=True, methods=['delete'])
    def delete_user(self, request, pk=None):
        user = get_object_or_404(User, id=pk)
        user.delete()
        return Response({"status": "success", "message": "Пользователь удален"}, status=status.HTTP_200_OK)
    
    # Конвертор
    @action(detail=True, methods=['post'])
    def convert_movie(self, request, pk=None):
        types = int(request.GET.get('type', 1))
        status = utils.convert_audio_only(int(pk), types)
        return JsonResponse({"status": "success", "message": "Конвертация", "status": status})
    
    # Очистка кэша
    @action(detail=False, methods=['post'])
    def clear_cache(self, request):
        utils.delete_video()
        return Response({"status": "success", "message": "Кэш очищен"}, status=status.HTTP_200_OK)

    # Получение статуса
    @action(detail=True, methods=['get'])
    def get_progress(self, request, pk=None):
        types = request.GET.get('type', '1')
        if types == '1':
            movie = Movie.objects.get(id=pk)
        elif types == '2':
            movie = Episode.objects.get(id=pk)
        status = movie.processed_status
        progress = movie.processed_progress
        return JsonResponse({"status": "success", "message": "Прогресс", "status": status, "progress": progress})



