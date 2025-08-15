from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Genre, Movie, Episode, Series
from rest_framework.serializers import ModelSerializer

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']
    
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = ['level', 'can_stream', 'can_dowload', 'avatar', 'user', 'username', 'email']

    def validate_avatar(self, value):
        # value это UploadedFile
        valid_mime_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if value.content_type not in valid_mime_types:
            raise serializers.ValidationError("Можно загружать только изображения (JPEG, PNG, WEBP, GIF).")
        
      
        max_size = 2 * 1024 * 1024 
        if value.size > max_size:
            raise serializers.ValidationError("Размер файла не должен превышать 2 MB.")
        
        return value

    def update(self, instance, validated_data):
        # Обновляем user
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        # Обновляем профиль
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']
        
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']

class EpisodeSerializer(serializers.ModelSerializer):
    movie_title = serializers.SerializerMethodField()

    class Meta:
        model = Episode
        fields = [
            'id', 'series', 'title', 'description', 'duration',
            'season_number', 'episode_number', 'file_path',
            'processed_status', 'processed_progress',
            'movie_title'
        ]

    def get_movie_title(self, obj):
        return obj.series.movie.title  
        
class SeriesSerializer(serializers.ModelSerializer):
    episodes = EpisodeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Series
        fields = ['id', 'movie', 'seasons_count', 'episodes']
  

class MovieSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    series = SeriesSerializer(many=False, read_only=True)
    class Meta:
        model = Movie
        fields = [
            'id', 
            'title', 
            'description', 
            'poster', 
            'genres', 
            'rating', 
            'year', 
            'country', 
            'duration', 
            'file_path', 
            'isSerial', 
            'processed_status', 
            'processed_progress',
            'series'
        ]
        
class MovieUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['title', 'description', 'poster', 'genres', 'rating', 'year', 'country', 'isSerial', 'duration', 'file_path']
    
    def create(self, validated_data):
        genres_data = validated_data.pop('genres', [])
        
        movie = Movie.objects.create(**validated_data)
        
        movie.genres.set(genres_data)
        return movie

class MovieUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['title', 'description', 'poster', 'genres', 'rating', 'year', 'country', 'duration', 'file_path', 'isSerial']
    
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.poster = validated_data.get('poster', instance.poster)
        instance.genres.set(validated_data.get('genres', instance.genres))
        instance.rating = validated_data.get('rating', instance.rating)
        instance.year = validated_data.get('year', instance.year)
        instance.country = validated_data.get('country', instance.country)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.file_path = validated_data.get('file_path', instance.file_path)
        instance.isSerial = validated_data.get('isSerial', instance.isSerial)
        instance.save()
        return instance


class GenreUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['name']
        
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name).strip().lower().capitalize()
        instance.save()
        return instance
    
      

class EpisodeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Episode
        fields = [
            'series', 'title', 'description', 'duration', 'season_number', 'episode_number', 'file_path'
        ]
        
    def validate(self, attrs):
        if Episode.objects.filter(
            series=attrs['series'],
            season_number=attrs['season_number'],
            episode_number=attrs['episode_number']
        ).exists():
            raise serializers.ValidationError("Эпизод с таким номером уже существует")
        return attrs
    
    
    def create(self, validated_data):
        validated_data['processed_status'] = 'uploaded'
        validated_data['processed_progress'] = 0
        return super().create(validated_data)
    
class EpisodeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Episode
        fields = ['title', 'description', 'duration', 'season_number', 'episode_number', 'file_path']
        
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.season_number = validated_data.get('season_number', instance.season_number)
        instance.episode_number = validated_data.get('episode_number', instance.episode_number)
        instance.file_path = validated_data.get('file_path', instance.file_path)
        instance.save()
        return instance