from django.http import JsonResponse, StreamingHttpResponse, Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer
from main.serializers import ProfileSerializer, UserSerializer, GenreSerializer, MovieSerializer, UserSerializer
import os
import re
from main.models import Genre, Movie, Series, Episode, Profile
from main.perimissions import LevelPermissionFactory
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q
from pathlib import Path
from main import utils

# Разделение уровня такое 1 обычный пользователь 2 человек с правами 3+ дальше можно настроит смотря по целям


def page(request):
    page = request.GET.get('page', 'home')
    
    genre_labels = {
        'anime': 'Аниме',
        'movies': 'Фильм',
        'cartoons': 'Мультфильм',
    }
    
    select_genre = genre_labels.get(page)
    
    if select_genre:
        movies_qs = Movie.objects.filter(genres__name=select_genre)

        exclude_genres_q = Q()
        for label in genre_labels.values():
            exclude_genres_q |= Q(name=label)
        genres_qs = Genre.objects.exclude(exclude_genres_q)
    else:
        movies_qs = Movie.objects.all()
        genres_qs = Genre.objects.all()
        
    movies_data = MovieSerializer(movies_qs, many=True).data
    genres_data = GenreSerializer(genres_qs, many=True).data
    
    return JsonResponse({
        "status": "success",
        "message": "Приятного просмотра",
        "movies": movies_data,
        "genres": genres_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, LevelPermissionFactory(2)])
def admin_panel(request):
    genres = Genre.objects.all()
    genres = GenreSerializer(genres, many=True).data
    
    movies = Movie.objects.all()
    movies = MovieSerializer(movies, many=True).data
    
    users = User.objects.all()
    users = UserSerializer(users, many=True).data

    return JsonResponse({
            "status": "success", 
            "message": "Добро пожаловать в панель администратора!", 
            "genres": genres,
            "movies": movies,
            "users": users
        }, status=status.HTTP_200_OK
    )

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        return Response({
            "message": "Регистрация прошла успешно", 
            "username": user.username,
            "access": str(access),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)
        
    return Response({"status": "error", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_user(request):
    profile = Profile.objects.select_related('user').get(user=request.user)
    profile = ProfileSerializer(profile).data
    return Response({
        "profile": profile
    })

    
def stream_video(request, movie_id, type=1):
    if (type == 1):
        movie = get_object_or_404(Movie, id=movie_id)
    elif (type == 2):
        episode = get_object_or_404(Episode, id=movie_id)
        movie = episode
        
    if not movie.file_path or not movie.file_path.name:
        raise Http404("Файл не указан или не загружен")
    
    file_path = movie.file_path.path
    
    if not os.path.exists(file_path):
        raise Http404("Видео не найдено")
    
    if movie.duration == 0 or movie.duration is None:
        minutes = round(utils.get_duration(Path(movie.file_path.path)) / 60)
        movie.duration = minutes
        movie.save()
        
    range_header = request.headers.get('Range', '').strip()
    range_match = None
    size = os.path.getsize(file_path)  # <-- исправлено
    content_type = 'video/mp4'
    status = 200
    start = 0
    length = size  # <-- исправлено

    if range_header:
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if range_match:
            start = int(range_match.group(1))
            end = range_match.group(2)
            if end:
                length = int(end) - start + 1
            else:
                length = size - start
            status = 206

    def file_iterator(path, offset, length):
        with open(path, 'rb') as f:
            f.seek(offset)
            remaining = length
            while remaining > 0:
                chunk_size = 8192 if remaining >= 8192 else remaining
                data = f.read(chunk_size)
                if not data:
                    break
                remaining -= len(data)
                yield data

    response = StreamingHttpResponse(file_iterator(file_path, start, length), 
                                      status=status, 
                                      content_type=content_type)
    response['Accept-Ranges'] = 'bytes'
    response['Content-Length'] = str(length)  # <-- исправлено
    if range_match:
        response['Content-Range'] = f'bytes {start}-{start + length - 1}/{size}'

    return response
    
    


