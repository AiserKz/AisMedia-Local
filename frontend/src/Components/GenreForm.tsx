import React, { useState } from "react";
import api from "../Script/api";
import IonIcon from "@reacticons/ionicons";
import type { Genre } from "../Interface/types";

interface GenreFormProps {
    setShowGenreModal: React.Dispatch<React.SetStateAction<boolean>>,
    selectGenre?: Genre | null
}

export default function GenreForm({setShowGenreModal, selectGenre}: GenreFormProps) {
    const [genreForm, setGenreForm] = useState({ name: selectGenre ? selectGenre.name : "" });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<string>();
    const [success, setSuccess] = useState<string>();

    const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGenreForm({ name: e.target.value });
    };

    const addGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (genreForm.name.trim() === "") {
        setErrors("Введите название жанра");
        setGenreForm({ name: "" });
        return;
    }

    setSubmitting(true);

    if (selectGenre) {
        try {
            await api.put(`/api/admin/${selectGenre.id}/updateGenre/`, genreForm);
            setSuccess("Жанр успешно обновлен");
            setErrors('');
            setTimeout(() => {
                setSubmitting(false);
                setShowGenreModal(false);
                setSuccess('');
                setGenreForm({ name: "" });
            }, 1000);
        } catch (error: any) {
            if (error.response) {
                setErrors(error.response.data.message)
            } else {
                setErrors("Произошла ошибка при обновлении жанра");
            }
        } finally {
            setTimeout(() => {
                setSubmitting(false);
            }, 300);
        }
    } else {
        try {
            await api.post("/api/admin/genre/", genreForm);
            setSuccess("Жанр успешно добавлен");
            setErrors('');
            setTimeout(() => {
                setSubmitting(false);
                setShowGenreModal(false);
                setSuccess('');
                setGenreForm({ name: "" });
            }, 1000);
        } catch (error: any) {
            if (error.response) {
                setErrors(error.response.data.message)
            } else {
                setErrors("Произошла ошибка при добавлении жанра");
            }
        } finally {
            setTimeout(() => {
                setSubmitting(false);
            }, 300);
        }
    }
};
    
    return (
         <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 fade-in pt-10 rounded-2xl">
            <div className="relative card bg-base-100 shadow-2xl border border-base-200 p-6 max-w-md w-full  min-h-[120px] min-w-[260px] animate-fade-in">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10" onClick={() => setShowGenreModal(false)}>✕</button>
                <h2 className="text-xl font-bold mb-4">Добавить жанр</h2>
                <form className="flex flex-col gap-4 " onSubmit={addGenre}>
                    <input
                        name="name"
                        value={genreForm.name}
                        onChange={handleGenreChange}
                        type="text"
                        placeholder="Название жанра"
                        className="input input-bordered w-full"
                        required
                    />
                    <button className="btn btn-primary w-full mt-2" type="submit" disabled={submitting}>
                        {submitting && <span className="loading loading-spinner loading-xs mr-2"></span>}
                        <IonIcon name="add-circle-outline" className="mr-2" />Добавить жанр
                    </button>
                    <div className="text-center font-bold">
                        {errors && <p className="text-red-500">{errors}</p>}
                        {success && <p className="text-green-500">{success}</p>}
                    </div>
                </form>
            </div>
        </div>
    )
}