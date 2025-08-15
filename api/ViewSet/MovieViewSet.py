from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from main.models import Movie, Series, Episode
from main.serializers import MovieSerializer, EpisodeSerializer
from main.perimissions import LevelPermissionFactory
from django.db.models import Q

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all().prefetch_related('genres', 'series__episodes')
    serializer_class = MovieSerializer
    permission_classes = []
    
    @action(detail=True, methods=['get'])
    def watch(self, request, pk=None):
        movie = self.get_object()
        serializer = self.get_serializer(movie)
        return Response({"status": "success", "message": "Прятного просмотра", "movie": serializer.data}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def episodes(self, request, pk=None):
        movie = self.get_object()
        
        series, created = Series.objects.get_or_create(
            movie=movie,
            defaults={
                "seasons_count": 1
            }
        )
        
        episodes = Episode.objects.filter(series=series).select_related('series__movie')
        serializer = EpisodeSerializer(episodes, many=True)
        
        return Response({
            "status": "success",
            "message": "",
            "episodes": serializer.data,
            "series": series.id
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def search_movies(self, request):
        query = request.GET.get('q', '')
        movies = Movie.objects.filter(
            Q(title__icontains=query) |  # ищет по названию
            Q(description__icontains=query)  # ищет по описанию
        )  
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
   
    