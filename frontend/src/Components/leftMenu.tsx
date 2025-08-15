import { useLayoutEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import IonIcon from "@reacticons/ionicons"
import { checkAuth, logout } from "../Script/auth";
import ToggleTheme from "./toggleTheme";
import LeftCardSkeleton from "./leftCardSkeleton";
import { API_BASE_URL } from "../config";


export default function LeftMenu() {
    const [username, setUsername] = useState<string | null>('');
    const [level, setLevel] = useState(1);
    const location = useLocation();
    const currentPage = location.pathname.split("/")[1];
    const [loading, setLoading] = useState(true);
    const defaultAvatar = localStorage.getItem('avatar') != 'null' ? API_BASE_URL + localStorage.getItem('avatar') : '/defualt.jpg'

    useLayoutEffect(() => {
        async function check() {
            const isAuth = await checkAuth();
            if (isAuth) {
                setUsername(localStorage.getItem('username') || null);
                setLevel(parseInt(localStorage.getItem('level') || '1'));
            }
            setLoading(false);
        }
        check();
    }, []);

    const handlelogout = () => {
        setUsername(null);
        logout();
    }

    return (
        <>
            <div className="hidden md:flex h-full min-h-[700px] flex-col justify-between p-4 pl-7 bg-base-300 w-80">
                <div className="flex flex-col gap-2 h-full fade-in">
                    <h1 className="text-2xl font-medium leading-normal text-base-content"><Link to="/">Ais|Media</Link> <span className="text-xs text-base-content/60">v 1.0</span></h1>
                    <div className="flex flex-col gap-2 flex-grow mt-2">
                        <ul className="menu menu-vertical text-lg gap-2 w-full">
                            <li className={currentPage === "" ? "bg-primary/50 text-base-content rounded-lg" : ""}><Link to="/" className="rounded-lg text-base-content transition "><IonIcon name="home-outline" className="mr-2" />Главная</Link></li>
                            <li className={currentPage === "movies" ? "bg-primary/50 text-base-content rounded-lg" : ""}><Link to="/movies" className="rounded-lg  text-base-content transition "><IonIcon name="film-outline" className="mr-2" />Фильмы</Link></li>
                            <li className={currentPage === "cartoons" ? "bg-primary/50 text-base-content rounded-lg" : ""}><Link to={"/cartoons"} className="rounded-lg  text-base-content transition "><IonIcon name="cube-outline" className="mr-2" />Мультфильмы</Link></li>
                            <li className={currentPage === "anime" ? "bg-primary/50 text-base-content rounded-lg" : ""}><Link to="/anime" className="rounded-lg  text-base-content transition "><IonIcon name="tv-outline" className="mr-2" />Аниме</Link></li>
                            <li className={currentPage === "other" ? "bg-primary/50 text-base-content rounded-lg" : ""}><Link to="/other" className="rounded-lg  text-base-content transition "><IonIcon name="bookmarks-outline" className="mr-2" />Другое</Link></li>
                            {/* <li><Link to="/about"  className="rounded-lg text-base-content transition"><IonIcon name="information-circle-outline" className="mr-2" />О проекте</Link></li> */}
                            <hr className="my-2 border-primary opacity-50" />
                                {loading ? (
                                <LeftCardSkeleton />
                            ) : (
                                <>
                                    {level > 1 && (
                                        <li className={currentPage === "admin" ? "bg-primary/50 text-base-content rounded-lg" : ""}>
                                            <Link to="/admin" className="rounded-lg text-base-content transition">
                                                <IonIcon name="person-outline" className="mr-2" />Панель администратора
                                            </Link>
                                        </li>
                                    )}

                                    {username ? (
                                        <div className="flex flex-row items-center gap-4">
                                            <div className="avatar">
                                                <div className="w-10 rounded-xl ring-primary ring-2">
                                                    <img 
                                                        src={defaultAvatar} 
                                                        alt="avatar" 
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-md font-semibold">{username}</span>
                                            <button 
                                                onClick={handlelogout}
                                                className="hover:bg-base-100 text-red-500 rounded-lg text-lg p-2 items-center flex gap-2 flex-1 justify-center cursor-pointer"
                                            >
                                                Выйти <IonIcon name="log-out-outline" className="text-xl text-red-500" />
                                            </button>
                                        </div>
                                    ) : (
                                        <li>
                                            <Link to="/login" className="btn btn-sm btn-soft btn-primary mt-6">
                                                Войти <IonIcon name="log-in-outline" className="text-xl" />
                                            </Link>
                                        </li>
                                    )}
                                </>
                            )}

                        </ul>
                        <div className="justify-between flex gap-2">
                            <Link to="/settings" className="text-base-content flex flex-row flex-1 items-center transition hover:bg-base-100 p-2 rounded-lg">
                                <IonIcon name="settings-outline" className="mr-2 " />
                                Настройки
                            </Link>
    
                            <ToggleTheme />
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:hidden fixed bottom-[-1px] left-0 right-0 bg-base-300 border-t border-base-200 flex justify-around items-center h-16 z-50">
            
            <Link to="/" className="flex flex-col items-center text-sm text-center ">
                <IonIcon name="home-outline" className="text-xl" />
                Главная
            </Link>
            <Link to="/movies" className="flex flex-col items-center text-sm">
                <IonIcon name="film-outline" className="text-xl" />
                Фильмы
            </Link>
            <Link to="/cartoons" className="flex flex-col items-center text-sm">
                <IonIcon name="cube-outline" className="text-xl" />
                Мульты
            </Link>
            <Link to="/anime" className="flex flex-col items-center text-sm">
                <IonIcon name="tv-outline" className="text-xl" />
                Аниме
            </Link>
            <Link to="/settings" className="flex flex-col items-center text-sm">
                <IonIcon name="settings-outline" className="text-xl" />
                Настройки
            </Link>
            {level > 1 && (
                <Link to="/admin" className="flex flex-col items-center text-sm text-success">
                <IonIcon name="person-outline" className="text-xl" />
                Админка
                </Link>
            )}

            {/* Одна двигающаяся линия */}
            <span
                className="absolute bottom-1 h-0.5 w-10 bg-purple-500 transition-all duration-300 shadow-[0_-3px_6px_#a855f7,0_-8px_12px_#a855f7]"
                style={{
                width: level > 1 ? "16.66%" : "20%",
                left:
                    currentPage === ""
                    ? "0%"
                    : currentPage === "movies"
                    ? level > 1 ? "16%" : "20%"
                    : currentPage === "cartoons"
                    ? level > 1 ? "32.32%" : "39.5%"
                    : currentPage === "anime"
                    ? level > 1 ? "48%" : "58%"
                    : currentPage === "settings"
                    ? level > 1 ? "64.64%" : "79%"
                    : level > 1 ? "83.3%" : "0%"
                }}
            />
            </div>


        </>
    )
}