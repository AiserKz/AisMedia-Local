import { useState, useRef, useEffect } from 'react'
import api from '../Script/api'
import IonIcon from '@reacticons/ionicons'
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Header() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 1000)

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }
        try {
            const res = await api.get(`/api/movies/search_movies/?q=${encodeURIComponent(query)}`);
            setResults(res.data || []);
            setShowResults(true);
        } catch {
            setResults([]);
            setShowResults(false);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (!e.target.value.trim()) {
            setResults([]);
            setShowResults(false);
        }

    };

    const handleBlur = () => {
        setTimeout(() => setShowResults(false), 150); // чтобы клик по результату успел сработать
    };

    return ( 
        <header className="w-full py-6 flex relative md:pr-3">
            <div className="w-full flex flex-row items-center px-2 relative">
                <input
                    ref={inputRef}
                    value={query}
                    onChange={handleInput}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    onBlur={handleBlur}
                    type="text"
                    placeholder="Поиск"
                    className="text-lg rounded-xl input input-ghost input-primary w-full border-none relative px-10 py-7 bg-base-200 text-base-content "
                    autoComplete="off"
                />
                <IonIcon
                    onClick={handleSearch}
                    name="search-outline"
                    className="text-2xl absolute text-base-content opacity-80 ml-2 rounded-lg cursor-pointer left-4 top-1/2 -translate-y-1/2 z-50"
                    style={{ left: 12 }}
                />
                {showResults && results.length > 0 && (
                    <div className="fade-in absolute left-0 top-full mt-2 w-full bg-base-100 rounded-xl z-50 max-h-96 overflow-y-auto  animate-fade-in">
                        {results.map((movie, idx) => (
                            <Link
                                key={movie.id || idx}
                                className="group flex flex-row items-center gap-4 px-4 py-3 hover:bg-base-200 cursor-pointer  relative"
                                to={`/watch/${movie.id}`}
                            >
                                <img
                                    src={movie.poster ? API_BASE_URL + movie.poster : '/no-poster.png'}
                                    alt={movie.title}
                                    className="w-14 h-20 object-cover rounded-lg  bg-base-300"
                                />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-base-content text-lg">{movie.title}</span>
                                    <span className="text-base-content/60 text-sm">{movie.year} • {movie.country}</span>
                                </div>
                                {/* Описание при наведении */}
                                {/* {movie.description && (
                                    <div
                                        className="left-1/3 fixed z-[9999] min-w-[220px] max-w-xs w-fit max-h-44  bg-base-100 border border-base-200 shadow-2xl rounded-xl p-4 hidden group-hover:block animate-fade-in text-base-content text-sm"
                                        style={{
                                            left: typeof window !== 'undefined' ? undefined : '100%',
                                            top: typeof window !== 'undefined' ? undefined : '50%',
                                        }}
                                    >
                                        <div className="font-semibold mb-1">Описание:</div>
                                        <div className="line-clamp-6">{movie.description}</div>
                                    </div>
                                )} */}
                            </Link>
                        ))}
                        {results.length === 0 && (
                            <div className="px-4 py-3 text-base-content/60">Ничего не найдено</div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}