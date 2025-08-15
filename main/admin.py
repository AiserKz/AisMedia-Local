from django.contrib import admin
from .models import Movie, Genre, Profile, Series, Episode

# Register your models here.
@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "year", "country", "rating", "duration")
    search_fields = ("title", 'country')
    list_filter = ("year", "genres")
    
@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    
    
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "level", "can_stream", "can_dowload")
    search_fields = ("user",)
    
@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ("movie", "seasons_count")
    search_fields = ("movie",)

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ("series", "season_number", "episode_number")
    search_fields = ("series",)
    
    