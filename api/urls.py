from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .ViewSet.ProfileViewSet import profile_view
from .ViewSet.MovieViewSet import MovieViewSet
from .ViewSet.AdminViewSet import AdminViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'movies', MovieViewSet, basename='movies')
router.register(r'admin', AdminViewSet, basename='admin')



urlpatterns = [
    path('', include(router.urls)),
    path('pages/', views.page),
    path('admin-panel/', views.admin_panel),
    
    path('register/', views.register_user),
    path('me/', views.get_user),
    path('profile/', profile_view, name='profile'),
    
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('video/<int:movie_id>/<int:type>', views.stream_video),
]

