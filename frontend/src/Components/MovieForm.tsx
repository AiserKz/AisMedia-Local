import { useState } from "react";
import type { Genre } from "../Interface/types";
import IonIcon from "@reacticons/ionicons";
import api from "../Script/api";
import type { Movie } from "../Interface/types";

interface MovieFormProps {
    setShowMovieModal: React.Dispatch<React.SetStateAction<boolean>>;
    genres: Genre[];
    selectMovie?: Movie | null;
}

export default function MovieForm({ setShowMovieModal, genres, selectMovie }: MovieFormProps) {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [movieForm, setMovieForm] = useState({
        title: selectMovie ? selectMovie.title : "",
        description: selectMovie ? selectMovie.description : "",
        poster: "",
        genres: selectMovie ? selectMovie.genres.map(g => g.id) : [],
        rating: selectMovie ? selectMovie.rating : "",
        year: selectMovie ? selectMovie.year : "",
        country: selectMovie ? selectMovie.country : "",
        duration: selectMovie ? selectMovie.duration : "",
        video: null as File | null,
        isSerial: selectMovie ? selectMovie.isSerial : false
    });
    console.log(selectMovie);
    // Обработчики форм
    const handleMovieChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, type } = e.target;

        if (type === "file") {
            const file = (e.target as HTMLInputElement).files?.[0] || null;
            setMovieForm(prev => ({ ...prev, [name]: file }));
        } else if (type === "checkbox") {
            const { value, checked } = e.target as HTMLInputElement;
            console.log(value, checked);
            setMovieForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
            
        } else {
            const { value } = e.target;
            setMovieForm(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleMovieGenres = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
        setMovieForm(prev => ({ ...prev, genres: selected }));
    };

    const addMovie = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('title', movieForm.title);
        formData.append('description', movieForm.description);
        formData.append('rating', String(movieForm.rating));
        formData.append('year', String(movieForm.year));
        formData.append('country', movieForm.country);
        formData.append('duration', String(movieForm.duration));
        formData.append('isSerial', String(movieForm.isSerial));
        movieForm.genres.forEach(genre => formData.append('genres', String(genre)));
        if (movieForm.poster) {
            formData.append('poster', movieForm.poster);
        }
        if (movieForm.video) {
            formData.append('file_path', movieForm.video);
        }
    
        console.log(selectMovie);
        if (selectMovie) {
            try {
                await api.put(`/api/admin/${selectMovie.id}/update_movie/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },


                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(percent);
                        }
                    },
                    timeout: 0, // отключиль таймаут для больших файлов
                });
                setShowMovieModal(false);
                
            } catch (err: any) {
                setError(err.message);
            } finally {
                setSubmitting(false);
            }
        } else {    
            try {
                const res = await api.post(`/api/admin/upload_movie/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(percent);
                        }
                    },
                    timeout: 0, // отключиль таймаут для больших файлов
                    });
                    console.log(res.data);

                    setShowMovieModal(false);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setSubmitting(false);
                }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 fade-in pt-10 rounded-2xl">
            <div className="card bg-base-100 shadow-2xl border border-base-200 p-10 max-w-3xl w-full relative min-h-[350px] min-w-[400px] animate-fade-in overflow-y-auto max-h-[90vh]">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-10" onClick={() => setShowMovieModal(false)}>✕</button>
                <h2 className="text-2xl font-bold mb-6 text-center">Добавить фильм</h2>
                <form className="flex flex-col gap-6" onSubmit={addMovie}>
                    <div className="flex flex-col md:flex-row gap-6">
                        <input name="title" value={movieForm.title} onChange={handleMovieChange} type="text" placeholder="Название" className="input input-bordered w-full h-14 text-lg" required />
                        <input name="year" value={movieForm.year} onChange={handleMovieChange} type="number" placeholder="Год" className="input input-bordered w-full h-14 text-lg" required />
                        <input name="country" value={movieForm.country} onChange={handleMovieChange} type="text" placeholder="Страна" className="input input-bordered w-full h-14 text-lg" required />
                    </div>
                    <textarea name="description" value={movieForm.description} onChange={handleMovieChange} placeholder="Описание" className="textarea textarea-bordered w-full min-h-[80px] text-lg" required />
                    <div className="flex flex-col md:flex-row gap-6">
                        <input
                            name="poster"
                            onChange={handleMovieChange}
                            accept="image/*"
                            type="file"
                            className="file-input file-input-bordered w-full h-14 text-lg"
                        />
                        <input name="rating" value={movieForm.rating} onChange={handleMovieChange} type="number" step="0.1" placeholder="Рейтинг" className="input input-bordered w-full h-14 text-lg"  />
                        <input name="duration" value={movieForm.duration} onChange={handleMovieChange} type="number" placeholder="Длительность (мин)" className="input input-bordered w-full h-14 text-lg"  />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold text-base mb-1">Жанры</label>
                        <select
                            name="genres"
                            multiple
                            value={movieForm.genres.map(String)}
                            onChange={handleMovieGenres}
                            className="select select-bordered w-full min-h-[120px] text-lg"
                            size={Math.min(8, genres.length || 8)}
                            style={{ minHeight: 120, maxHeight: 220 }}
                        >
                            <option disabled value="">Выберите жанры</option>
                            {genres.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Выбор видеофайла */}
                    {!movieForm.isSerial && (
                        <input
                            name="video"
                            type="file"
                            accept="video/*"
                            className="file-input file-input-bordered w-full h-14 text-lg"
                            onChange={handleMovieChange}
                        />
                    )}
                    <div className="flex flex-row gap-2">
                        <label htmlFor="isSerial" className="font-semibold text-base mb-1">Сериал: </label>    
                        <input type="checkbox" name="isSerial" checked={movieForm.isSerial} onChange={handleMovieChange} className="checkbox checkbox-primary" />
                    </div>

                    {/* Прогресс-бар загрузки */}
                    {submitting && (
                        <progress className="progress progress-primary w-full h-3" value={uploadProgress} max={100}></progress>
                    )}
                    <button className={"btn w-full h-14 text-lg mt-2" + (selectMovie ? "btn btn-success":  "btn btn-primary")} type="submit" disabled={submitting}>
                        {submitting && <span className="loading loading-spinner loading-xs mr-2"></span>}
                        {selectMovie ? (
                            <>
                                <IonIcon name="create-outline" className="mr-2" />Редактировать
                            </>
                        ) : (
                            <>
                                <IonIcon name="add-circle-outline" className="mr-2" />Добавить фильм
                            </>
                        )}
                    </button>
                    {error && <p className="text-red-500 mt-2 text-center font-bold">{error}</p>}
                </form>
            </div>
        </div>
    )
}