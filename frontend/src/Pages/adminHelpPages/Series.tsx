
import { useEffect, useState } from "react";
import IonIcon from "@reacticons/ionicons";
import { useParams } from "react-router-dom";
import api from "../../Script/api";
import type { Episode } from "../../Interface/types";

const statusOptions = [
	{ value: "uploaded", label: "Загружено" },
	{ value: "processing", label: "Обрабатывается" },
	{ value: "processed", label: "Обработано" },
	{ value: "error", label: "Ошибка" },
];

export default function SeriesPage() {

	const [showForm, setShowForm] = useState(false);
	const [editEpisode, setEditEpisode] = useState<any>(null);

    const { id } = useParams();
	// Заглушка: список эпизодов
	const [episodes, setEpisodes] = useState<Episode[]>([]);
	const [convertEpisode, setSelectConvertedEpisode] = useState<Episode|null>(null);

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                const response = await api.get(`/api/movies/${id}/episodes/`);
                setEpisodes(response.data.episodes);
                setForm({ ...form, series: response.data.series, episode_number: response.data.episodes.length + 1 });
            } catch (error) {
               
            }
        }
        fetchEpisodes();
    }, []);

	// Форма добавления/редактирования
	const [form, setForm] = useState({
        movieId: id,
        series: null as number | null,
		season_number: 1,
		episode_number: 1,
		title: "",
		description: "",
		duration: "",
		file_path: null as File | null,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		if (type === "file") {
			const file = (e.target as HTMLInputElement).files?.[0] || null;
			setForm(prev => ({ ...prev, [name]: file }));
		} else if (type === "number") {
			setForm(prev => ({ ...prev, [name]: Number(value) }));
		} else {
			setForm(prev => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		setSuccess("");
		// Здесь должен быть реальный API-запрос
        try {
            let res;
            if (editEpisode) {
                res = await api.put(`/api/admin/${editEpisode.id}/update_episode/`, form, {headers: {'Content-Type': 'multipart/form-data'}});
                setEpisodes(episodes.map(ep => 
                    ep.id === editEpisode.id 
                        ? { 
                            ...ep,
                            season_number: form.season_number,
                            episode_number: form.episode_number,
                            title: form.title,
                            description: form.description,
                            duration: parseInt(form.duration)
                        }
                        : ep
                ));
            } else {
                res = await api.post(`/api/admin/add_episode/`, form, {headers: {'Content-Type': 'multipart/form-data'}});
                setEpisodes([...episodes, res.data.episode]);
            }
            setForm({
                movieId: id,
                series: null,
                season_number: 1,
                episode_number: 1,
                title: "",
                description: "",
                duration: "",
                file_path: null
            })
            setShowForm(false);
            setSuccess(res.data.message);
        } catch (response: any) {
            setError(response.response.data.message);
        }
        setSubmitting(false);

	};

	const handleEdit = (ep: any) => {
		setEditEpisode(ep);
        console.log(ep);
		setForm({
			...ep,
			file_path: null,
			processed_file: null,
		});
		setShowForm(true);
	};

    const handleDelete = async (id: number) => {
        try {
            const res = await api.delete(`/api/movie/episode/${id}`);
            console.log(res.data);
            setEpisodes(episodes.filter(ep => ep.id !== id));
        } catch (err: any) {
            console.log()
        }
    }

	const handleConvertEpisode = async (ep: Episode) => {
		setSelectConvertedEpisode(ep);
        api.post(`/api/admin/${ep.id}/convert_movie/` + '?type=' + 2);
        setEpisodes(episodes.map(e => e.id === ep.id ? {...e, processed_status: 'processing'} : e));

        const interval = setInterval(async () => {
            const res = await api.get(`api/admin/${ep.id}/get_progress/?type=2`);
			setEpisodes(episodes.map(e => e.id === ep.id ? {...e, processed_progress: res.data.progress} : e))
            if (res.data.status == 'processed' || res.data.status == 'error' || res.data.progress == 100) {
				setEpisodes(episodes.map(e => e.id === ep.id ? {...e, processed_status: res.data.status} : e));
                clearInterval(interval);
                setSelectConvertedEpisode(null);
            }
        }, 2000);
	}

	return (
		<div className="w-full min-h-screen bg-base-200 py-10 rounded-2xl">
			<div className="max-w-6xl mx-auto">
                <span onClick={() => window.history.back()} className="btn btn-md right-2 mb-3 w-30 h-10 rounded-xl flex items-center justify-center duration-500 transition-all ease-in-out hover:scale-105"><IonIcon name="arrow-back" className="text-2xl" /></span>
        
				<div className="flex flex-row items-center justify-between mb-6">
					<h2 className="text-2xl font-bold">Эпизоды сериалов</h2>
					<button className="btn btn-primary" onClick={() => { setShowForm(true); setEditEpisode(null); }}>
						<IonIcon name="add-circle-outline" className="mr-2" />Добавить эпизод
					</button>
				</div>
				{/* Таблица эпизодов */}
				<div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow mb-8">
					<table className="table w-full">
						<thead>
							<tr>
                                <th>Id</th>
								<th>Сериал</th>
								<th>Сезон</th>
								<th>Серия</th>
								<th>Название</th>
								<th>Длительность</th>
								<th>Статус</th>
								<th>Прогресс</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{episodes.map(ep => (
								<tr key={ep.id} className="hover:bg-base-200 fade-in">
                                    <td>{ep.id}</td>
									<td>{ep.movie_title}</td>
									<td>{ep.season_number}</td>
									<td>{ep.episode_number}</td>
									<td>{ep.title}</td>
									<td>{ep?.duration | 0} мин</td>
									<td>
										<span className="badge badge-outline badge-sm">
											{statusOptions.find(opt => opt.value === ep.processed_status)?.label || ep.processed_status}
										</span>
									</td>
									<td>
										{convertEpisode?.id === ep.id && <progress className="progress progress-primary w-16 h-2" value={ep.processed_progress} max={100}></progress>}
									</td>
									<td>
										{ep.processed_status === 'uploaded' && (
											<button className="btn btn-xs btn-primary" onClick={() => handleConvertEpisode(ep)} > <IonIcon name="download-outline" /> Конвертировать</button>
										)}
                                             
										<button className="btn btn-xs btn-outline btn-info mr-2" onClick={() => handleEdit(ep)}>
											<IonIcon name="create-outline" />
										</button>
										<button className="btn btn-xs btn-outline btn-error " onClick={() => handleDelete(ep.id)}>
											<IonIcon name="trash-outline" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{/* Форма добавления/редактирования */}
				{showForm && (
					<div className="card bg-base-100 shadow-2xl border border-base-200 p-8 max-w-2xl w-full mx-auto mb-10 animate-fade-in">
						<h3 className="text-xl font-bold mb-4 text-center">{editEpisode ? "Редактировать эпизод" : "Добавить эпизод"}</h3>
						<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
							<div className="flex flex-row gap-4 items-center">
                            <label htmlFor="season_number" className="text-lg">Сезон:</label>
								<input
									name="season_number"
									value={form.season_number}
									onChange={handleChange}
									type="number"
									min={1}
									placeholder="Сезон"
									className="input input-bordered w-full h-12 text-lg"
									required
								/>
                            <label htmlFor="episode_number" className="text-lg">Серия:</label>
								<input
									name="episode_number"
									value={form.episode_number}
									onChange={handleChange}
									type="number"
									min={1}
									placeholder="Серия"
									className="input input-bordered w-full h-12 text-lg"
									required
								/>
							</div>
							<input
								name="title"
								value={form.title}
								onChange={handleChange}
								type="text"
								placeholder="Название эпизода"
								className="input input-bordered w-full h-12 text-lg"
								
							/>
							<textarea
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Описание"
								className="textarea textarea-bordered w-full min-h-[80px] text-lg"
							/>
							<div className="flex flex-row gap-4">
								<input
									name="duration"
									value={form.duration}
									onChange={handleChange}
									type="number"
									min={1}
									placeholder="Длительность (мин)"
									className="input input-bordered w-full h-12 text-lg"
								/>
							</div>
							<div className="flex flex-row gap-4">
								<input
									name="file_path"
									type="file"
									accept="video/* mp4, mkv, webm"
									className="file-input file-input-bordered w-full h-12 text-lg"
									onChange={handleChange}
								/>

							</div>
							<div className="flex flex-row gap-2 justify-end">
								<button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditEpisode(null); }}>Отмена</button>
								<button className="btn btn-primary" type="submit" disabled={submitting}>
									{submitting && <span className="loading loading-spinner loading-xs mr-2"></span>}
									<IonIcon name="save-outline" className="mr-2" />Сохранить
								</button>
							</div>
							{error && <p className="text-red-500 mt-2 text-center font-bold">{error}</p>}
							{success && <p className="text-green-500 mt-2 text-center font-bold">{success}</p>}
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
