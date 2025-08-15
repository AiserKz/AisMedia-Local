import { useEffect, useMemo, useState } from "react"
import MediaCard from "../Components/mediaCard"
import axios from "axios"
import SkeletonCard, { SkeletonGenre } from "../Components/skeletonCard"
import type { Movie, Genre } from "../Interface/types";


const pageNames = [
    { value: "home", label: "Главная" },
    { value: "movies", label: "Фильмы" },
    { value: "anime", label: "Аниме" },
    { value: "cartoons", label: "Мультфильмы" },
    { value: "other", label: "Другое" },
]

const pageMap: Record<string, string> = {
    home: "home",
    movies: "movies",
    anime: "anime",
    cartoons: "cartoons",
    other: "other",
}

export default function DefaultPage({ page }: { page: string }) {
    const [movies, setMovie] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);

    const [selectGenre, setSelectGenre] = useState<Genre|null>(null);
    const filteredMovies = useMemo(() => {
        if (!selectGenre) return movies;
        return movies.filter(movies => movies.genres.some(g => g.id === selectGenre.id));
    }, [movies, selectGenre]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        let url = pageMap[page] || "home";
        axios.get('http://' +  window.location.hostname + ':8000/api/pages/?page=' + url ).then(res => {
            setMovie(res.data.movies)
            setGenres(res.data.genres)
        }).catch(() => setMovie([])).finally(() => setLoading(false));
    }, [page]);

    const renderSkeletons = (count: number, Component: React.FC) => Array.from({ length: count }).map((_, i) => <Component key={i} />);

    const handleSelectGenre = (genre: Genre|null) => {
        setSelectGenre(genre);
    }

    return (
        <div className="text-base-content flex flex-1 w-full flex-col fade-in">
            <h1 className="text-2xl text-left py-2 text-base-content">{pageNames.find(p => p.value === page)?.label || "Главная"}</h1>

            <ul className="menu menu-horizontal rounded-box gap-4">
                <li className={selectGenre === null ? "bg-base-100 rounded-sm" : "" } onClick={() => handleSelectGenre(null)}><span className="text-base-content text-md">Все жанры</span></li>
                {loading ? (
                    renderSkeletons(4, SkeletonGenre)
                ) : (
                    genres.map(genre => (
                        <li className={selectGenre?.id === genre.id ? "bg-base-100 rounded-sm" : "" } key={genre.id} onClick={() => handleSelectGenre(genre)}><span className="text-base-content text-md">{genre.name}</span></li>
                    ))
                )}
            </ul>
    
            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mt-4 mb-10">
                {loading ? (
                    renderSkeletons(10, SkeletonCard)            
                ) : (
                    filteredMovies?.map((item: Movie) => (
                        <MediaCard key={item.id} item={item} />
                    ))
                )}
            </div>


        </div>
    )
}