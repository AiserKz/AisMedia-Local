import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IonIcon from "@reacticons/ionicons";
import type { Genre, Movie } from "../Interface/types";
import api from "../Script/api";
import type { User } from "../Interface/types";
import MovieForm from "../Components/MovieForm";
import GenreForm from "../Components/GenreForm";
import { API_BASE_URL } from "../config";

const statusOptions = [
	{ value: "uploaded", label: "Загружено" },
	{ value: "processing", label: "Обрабатывается" },
	{ value: "processed", label: "Обработано" },
	{ value: "error", label: "Ошибка" },
];

export default function AdminPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);

    const [showMovieModal, setShowMovieModal] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [selectMovie, setSelectMovie] = useState<Movie|null>(null);
    const [selectGenre, setSelectGenre] = useState<Genre|null>(null);
    const [selectConvertedMovie, setSelectConvertedMovie] = useState<Movie|null>(null);

    const [users, setUsers] = useState<User[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState<{type: 'movie'|'genre'|'user', id: number|null}|null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const lvl = parseInt(localStorage.getItem("level") || "1");

        if (lvl <= 1) {
            navigate("/");
        }
        const getData = async () => {
            // Заглушка: api.get('/api/admin/') должен возвращать users, genres, movies
            const res = await api.get('/api/admin-panel/');
            setGenres(res.data.genres || []);
            setMovies(res.data.movies || []);
            setUsers(res.data.users || []);
        }
        getData();
        setLoading(false);
    }, [navigate]);

    // Модальные формы
    const handleEditMovie = (movie: Movie) => {
        setSelectMovie(movie);
        setShowMovieModal(true);
    };
    const handleEditGenre = (genre: Genre) => {
        setShowGenreModal(true);
        setSelectGenre(genre);
    };
    const handleDelete = (type: 'movie'|'genre'|'user', id: number) => {
        setShowDeleteModal({type, id});
    };

    const handleConvertMovie = async (movie: Movie) => {
        setSelectConvertedMovie(movie);
        api.post(`/api/admin/${movie.id}/convert_movie/?type=1`);
        setMovies(movies.map(m => m.id === movie.id ? {...m, processed_status: 'processing'} : m));

        const interval = setInterval(async () => {
            const res = await api.get(`api/admin/${movie.id}/get_progress/?type=1`);
            setMovies(movies.map(m => m.id === movie.id ? {...m, processed_progress: res.data.progress} : m))
            if (res.data.status == 'processed' || res.data.status == 'error' || res.data.progress == 100) {
                setMovies(movies.map(m => m.id === movie.id ? {...m, processed_status: res.data.status} : m));
                clearInterval(interval);
                setSelectConvertedMovie(null);
            }
        }, 2000);
    };

    const confirmDelete = async () => {
        if (!showDeleteModal) return;
        // Здесь должен быть DELETE-запрос к серверу
        const id = showDeleteModal.id;
        if (showDeleteModal.type === 'movie') {
            await api.delete(`/api/admin/${id}/delete_movie/`);
            setMovies(movies.filter(m => m.id !== id));
        } else if (showDeleteModal.type === 'genre') {
            await api.delete(`/api/admin/${id}/delete_genre/`);
            setGenres(genres.filter(g => g.id !== id));
        } else if (showDeleteModal.type === 'user') {
            await api.delete(`/api/admin/${id}/delete_user/`);
            setUsers(users.filter(u => u.id !== id));
        }
        setShowDeleteModal(null);
    };
    const cancelDelete = () => setShowDeleteModal(null);


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 w-full">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <span className="mt-4 text-base-content/70">Загрузка...</span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-5 py-2 fade-in">
            <h1 className="text-3xl font-bold text-base-content mb-2 flex items-center gap-2">
                <IonIcon name="settings-outline" className="text-primary" /> Панель администратора
            </h1>
            {/* Кнопки открытия модальных окон */}
            <div className="flex flex-row gap-4 w-full overflow-auto scrollbar-none pb-2">
                <button className="btn btn-primary" onClick={() => {setShowMovieModal(true); setSelectMovie(null);}}>
                    <IonIcon name="add-circle-outline" className="mr-2" />Добавить фильм
                </button>
                <button className="btn btn-secondary" onClick={() => {setShowGenreModal(true); setSelectGenre(null);}}>
                    <IonIcon name="add-circle-outline" className="mr-2" />Добавить жанр
                </button>
                <button className="btn btn-error" onClick={() => {
                    api.post('/api/admin/clear_cache/');
                    setTimeout(() => {
                        window.location.reload();
                    })
                }}>
                    <IonIcon name="refresh-outline" className="mr-2" />
                    Удалить кэш
                </button>
 
            </div>
            {/* Таблица фильмов */}
            <div className="card bg-base-100 shadow-xl border border-base-200 mb-6">
                <div className="card-body">
                    <h2 className="card-title mb-2">Фильмы</h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Постер</th>
                                    <th>Название</th>
                                    <th>Жанры</th>
                                    <th>Рейтинг</th>
                                    <th>Год</th>
                                    <th>Страна</th>
                                    <th>Длительность</th>
                                    <th>Тип</th>
                                    <th>Статус</th>
                                    <th>Прогресс</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {movies.map(movie => (
                                    <tr key={movie.id} className="hover:bg-base-300 text-base-content ">
                                        <td>{movie.id}</td>
                                        <td>
                                            <img src={API_BASE_URL + movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                                        </td>
                                        <td>
                                            <Link to={`/watch/${movie.id}`} className="tooltip" data-tip={movie.description}>
                                                {movie.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {movie.genres.map(g => (
                                                    <span key={g.id} className="badge badge-primary badge-sm">{g.name}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{movie.rating}</td>
                                        <td>{movie.year}</td>
                                        <td>{movie.country}</td>
                                        <td>{movie.duration} мин</td>
                                        <td>{movie.isSerial ? "Сериал" : "Фильм"}</td>
                                        <td>{statusOptions.find(s => s.value === movie.processed_status)?.label || "Неизвестно"}</td>
                                        <td>
                                            {!movie.isSerial && selectConvertedMovie?.id === movie.id && (
                                                <progress className="progress progress-primary w-16 h-2" value={movie.processed_progress}  max={100}></progress>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex gap-2 ityems-center justify-center">
                                                {movie.isSerial ? (
                                                    <Link to={`/admin/series/${movie.id}`} className="btn btn-xs btn-success"><IonIcon name="add-circle-outline" /></Link> 
                                                ) : movie.processed_status === "uploaded" && (
                                                    <button className="btn btn-xs btn-primary" onClick={() => handleConvertMovie(movie)} > <IonIcon name="download-outline" /> Конвертировать</button>
                                                ) }
                                                <Link to={`/watch/${movie.id}`} className="btn btn-xs btn-info"><IonIcon name="eye-outline" /></Link>
                                                <button className="btn btn-xs btn-warning" onClick={() => handleEditMovie(movie)}><IonIcon name="create-outline" /></button>
                                                <button className="btn btn-xs btn-error" onClick={() => handleDelete('movie', movie.id)}><IonIcon name="trash-outline" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Таблица жанров */}
            <div className="card bg-base-100 shadow-xl border border-base-200 mb-6">
                <div className="card-body">
                    <h2 className="card-title mb-2">Жанры</h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {genres.map(genre => (
                                    <tr key={genre.id}>
                                        <td>{genre.id}</td>
                                        <td>{genre.name}</td>
                                        <td className="flex gap-2">
                                            <button className="btn btn-xs btn-warning" onClick={() => handleEditGenre(genre)}><IonIcon name="create-outline" /></button>
                                            <button className="btn btn-xs btn-error" onClick={() => handleDelete('genre', genre.id)}><IonIcon name="trash-outline" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Таблица пользователей */}
            <div className="card bg-base-100 shadow-xl border border-base-200 mb-6">
                <div className="card-body">
                    <h2 className="card-title mb-2">Пользователи</h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Имя пользователя</th>
                                    <th>Email</th>
                                    <th>Уровень</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email || '-'}</td>
                                        <td>{user.profile.level}</td>
                                        <td>
                                            <button className="btn btn-xs btn-error" onClick={() => handleDelete('user', user.id)}><IonIcon name="trash-outline" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Модальное окно подтверждения удаления */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 fade-in">
                    <div className="card bg-base-100 shadow-2xl border border-base-200 p-6 max-w-md w-full relative animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Вы уверены, что хотите удалить?</h2>
                        <div className="flex gap-4 justify-end">
                            <button className="btn btn-error" onClick={confirmDelete}>Удалить</button>
                            <button className="btn btn-ghost" onClick={cancelDelete}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
  
            {/* Модальное окно для фильма */}
            {showMovieModal && (
                <MovieForm setShowMovieModal={setShowMovieModal} genres={genres} selectMovie={selectMovie} />
            )}

            {/* Модальное окно для жанра */}
            {showGenreModal && (
               <GenreForm setShowGenreModal={setShowGenreModal} selectGenre={selectGenre} />
            )}
        </div>
    );
}