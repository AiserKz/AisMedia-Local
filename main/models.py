from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    level = models.PositiveIntegerField(default=1)
    can_stream = models.BooleanField(default=True)
    can_dowload = models.BooleanField(default=False)
    avatar = models.FileField(upload_to='avatars/', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'
    
    def __str__(self):
        return f"Профиль пользователя {self.user.username}"


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name = 'Жанр'
        verbose_name_plural = 'Жанры'
    
    def __str__(self):
        return self.name
    
class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    poster = models.FileField(upload_to='posters/', null=True, blank=True)
    genres = models.ManyToManyField(Genre, related_name='movies')
    rating = models.FloatField(default=0.0)
    year = models.PositiveIntegerField()
    country = models.CharField(max_length=100, help_text="Страна")
    isSerial = models.BooleanField(default=False, help_text="Это сериал?")
    duration = models.PositiveIntegerField(help_text="Длина в минутах", null=True, blank=True, default=0)
    file_path = models.FileField(upload_to='videos/originals/', null=True, blank=True)
    processed_status = models.CharField(max_length=20, choices=(
        ('uploaded', 'Загружено'),
        ('processing', 'Обрабатывается'),
        ('processed', 'Обработано'),
        ('error', 'Ошибка')
    ), default='uploaded')
    processed_progress = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = 'Фильм'
        verbose_name_plural = 'Фильмы'
    
    def __str__(self):
        return self.title
    

class Series(models.Model):
    movie = models.OneToOneField(Movie, on_delete=models.CASCADE, related_name='series')
    seasons_count = models.PositiveIntegerField(default=1)
    
    def get_all_episodes(self):
        return self.episodes.all().order_by('season_number', 'episode_number')
    
    class Meta:
        verbose_name = 'Серия'
        verbose_name_plural = 'Серии'
    
    def __str__(self):
        return f"Сериал {self.movie.title}"
    
    
class Episode(models.Model):
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='episodes')
    season_number = models.PositiveIntegerField(default=1)
    episode_number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    duration = models.PositiveIntegerField(help_text="Длина в минутах", null=True, blank=True, default=0)
    file_path = models.FileField(upload_to='videos/originals/', null=True, blank=True)
    processed_status = models.CharField(max_length=20, choices=(
        ('uploaded', 'Загружено'),
        ('processing', 'Обрабатывается'),
        ('processed', 'Обработано'),
        ('error', 'Ошибка')
    ), default='uploaded')
    processed_progress = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = 'Эпизод'
        verbose_name_plural = 'Эпизоды'
    
    def __str__(self):
        return f"{self.series.movie.title} S{self.season_number:02}E{self.episode_number:02}"
