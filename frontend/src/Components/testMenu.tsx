import { useState } from "react"
import { Link } from "react-router-dom"
import IonIcon from "@reacticons/ionicons"


export default function LeftMenu() {
    const [isDark, setIsDark] = useState(false)
    const toggleTheme = () => {
        const theme = document.documentElement.getAttribute("data-theme")
        document.documentElement.setAttribute("data-theme", theme === "dark" ? "light" : "dark")
        setIsDark(!isDark)
    }
    
    return (
        <div className="flex h-full min-h-[700px] flex-col justify-between p-4 pl-7 bg-base-3s00 w-80">
            <div className="flex flex-col gap-2 h-full">
                <h1 className="text-2xl font-medium leading-normal text-base-content">Ais|Media <span className="text-xs text-base-content/60">v 1.0</span></h1>
                <div className="flex flex-col gap-2 flex-grow mt-2">
                    <ul className="menu menu-vertical text-lg gap-2 w-full">
                        <li><Link to="/" className="rounded-lg  text-base-content transition "><IonIcon name="home-outline" className="mr-2" />Главная</Link></li>
                        <li><Link to="/movies" className="rounded-lg  text-base-content transition "><IonIcon name="film-outline" className="mr-2" />Фильмы</Link></li>
                        <li><Link to="/anime" className="rounded-lg  text-base-content transition "><IonIcon name="tv-outline" className="mr-2" />Аниме</Link></li>
                        <li><Link to="/other" className="rounded-lg  text-base-content transition "><IonIcon name="bookmarks-outline" className="mr-2" />Другое</Link></li>
                        {/* <li><Link to="/about"  className="rounded-lg text-base-content transition"><IonIcon name="information-circle-outline" className="mr-2" />О проекте</Link></li> */}
                        <hr className="my-2 border-primary opacity-50" />
                        <li><Link to="/login" className="btn btn-sm btn-soft btn-primary mt-6">Войти <IonIcon name="log-in-outline" className="text-xl" /></Link></li>
                    </ul>
                    <div className="mt-auto flex flex-col gap-2">
                    <div className="flex flex-row items-center gap-4 text-sm">
                        <div className="flex flex-row gap-2 items-center">
                            <span className={`transition-transform duration-500 ease-in-out ${
                                !isDark ? "rotate-180 scale-125" : ""
                            }`}>🌘</span>
                                <input type="checkbox" className="toggle toggle-sm toggle-primary" onChange={toggleTheme} />
                            <span className={`transition-all duration-500 ease-in-out ${isDark ? "rotate-180 scale-125" : ""}`}>🌕</span>
                        </div>  
                    </div>
                    <Link to="/other" className="rounded-lg text-md flex items-center text-base-content transition hover:bg-base-100 p-2"><IonIcon name="settings-outline" className="mr-2" />Настройки</Link>

                    </div>
                </div>
            </div>
        </div>
    )
}