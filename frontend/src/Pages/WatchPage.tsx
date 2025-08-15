import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import IonIcon from "@reacticons/ionicons";
import VideoPlayer from "../Components/VideoPlayer";
import VideoPlayerSerial from "../Components/VideoPlayerSerial";
import type { Genre, Movie } from "../Interface/types";
import api from "../Script/api";
import ErrorPage from "./ErrorPage";


const WatchPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLevel, setUser] = useState(1);
  const showAddSeriesButton = userLevel > 1 && movie?.isSerial;

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get(`/api/movies/${id}/watch/`)
      .then(res => {
        setMovie(res.data.movie);
        setLoading(false);
      })
      .catch((res) => {
        setError(res.response.data.message || "Фильм не найден");
        setLoading(false);
      });
    
    setUser(parseInt(localStorage.getItem('level') || '1'));
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 w-full">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <span className="mt-4 text-base-content/70">Загрузка...</span>
    </div>
  );
  if (error) return <ErrorPage error={error} />;
  if (!movie) return <div className="text-center text-base-content/70 mt-10">Фильм не найден</div>;


  return (
    <section className="w-full px-0 mb-10 ">
        <div className="flex items-center gap-2">
          <span onClick={() => window.history.back()} className="cursor-pointer bg-base-200 right-2 mb-3 w-30 h-10 rounded-lg flex items-center justify-center duration-500 transition-all ease-in-out hover:scale-105"><IonIcon name="arrow-back" className="text-2xl" /></span>
          {showAddSeriesButton && (
            <Link to={`/admin/series/${movie.id}`} className="btn btn-md btn-success right-2 mb-3 h-10 rounded-xl flex items-center justify-center duration-500 transition-all ease-in-out hover:scale-105"> <IonIcon name="film-outline" className="text-2xl" />Добавить серию</Link>
          )}
        </div>
      <div className="card lg:card-side bg-base-200 w-full items-center">
        {/* Постер */}
        <figure className="min-w-[180px] max-w-[320px] w-full h-full flex items-center justify-center p-4 fade-in">
          {movie.poster ? (
            <img src={movie.poster} alt={movie.title} className="object-cover rounded-xl max-h-100 w-full"/>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 w-36 text-base-content/40">
              <IonIcon name="film-outline" className="text-6xl mb-2" />
              <span>Нет постера</span>
            </div>
          )}
        </figure>
        {/* Информация и плеер */}
        <div className="card-body flex flex-col gap-4 p-4 w-full fade-in ">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex flex-row flex-wrap gap-2 text-base-content/70 text-sm items-center">
              <h2 className="card-title text-2xl font-bold text-primary mb-2">{movie.title || "Без названия"}</h2>
            </div>
            {/* Рейтинг */}
            <div className="flex flex-row items-center gap-2">
              <span className="font-semibold text-sm text-base-content/70">Рейтинг:</span>
              <IonIcon name="star" className="text-yellow-400 text-xl" />
              <span className="font-semibold text-lg text-base-content">{movie.rating}</span>
              <span className="text-xs text-base-content/60">/ 10</span>
            </div>
          </div>
            <div className="flex flex-row gap-2">
              {movie.duration && <span className="badge badge-outline"><IonIcon name="time-outline" className="mr-1" />{movie.duration} мин</span>}
              {movie.country && <span className="badge badge-outline">{movie.country}</span>}
              {movie.year && <span className="badge badge-outline badge-primary">{movie.year}</span>}
            </div>
          {/* Жанры */}
          <div className="flex flex-row flex-wrap gap-2 text-base-content/70 text-sm mb-2">
            <span className="font-semibold">Жанры:</span>
            {movie.genres.map((g: Genre) => (
              <span key={g.id} className="badge badge-primary badge-outline">{g.name}</span>
            ))}

          </div>

          {/* Описание */}
          <div>

          <p className="text-base-content/70 text-sm">Описание:</p>
          {movie.description && (
            <p className="mt-2 Stext-base-content/80 text-md line-clamp-5">{movie.description}</p>
          )}
          </div>
          <hr className="my-2 border-primary opacity-50" />
          {/* Плеер */}
          <div className=" w-full fade-in rounded-2xl ">
            {movie ? (
                movie.isSerial ? (
                  <VideoPlayerSerial series={movie?.series} />
                ) : (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-base-200 bg-base-200">
                        <VideoPlayer movie_id={movie.id} />
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center h-32 w-full text-base-content/40 bg-base-200 rounded-xl">
                    <IonIcon name="play-circle-outline" className="text-4xl mb-2" />
                    <span>Плеер недоступен</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WatchPage;