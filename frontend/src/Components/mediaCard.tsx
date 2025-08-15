import IonIcon from "@reacticons/ionicons"
import { Link } from "react-router-dom";

export default function MediaCard({item}: any) {
    return (
        <div className="md:w-[22dvh] w-[30dvw] shadow-xl rounded-2xl overflow-hidden group cursor-pointer fade-in ">
             <div className="relative w-full aspect-[2/3] overflow-hidden">
                {/* Картинка */}
                <img
                    src={"http://"  + window.location.hostname + ":8000" + item.poster}
                    className="w-full h-full object-cover transition-all !duration-300 ease-in-out group-hover:scale-110"
                    alt={item.title}
                />
                {/* Затемнение */}
                <Link to={`/watch/${item.id}`} className="absolute inset-0 bg-black opacity-0 transition duration-300 group-hover:opacity-80 flex items-center justify-center">
                    <IonIcon name="play-circle-outline" className="text-6xl text-white hover:scale-110 duration-300 ease-in-out hover:text-primary" />
                </Link>
            </div>
            <div className="p-4">
                <h2 className="text-md font-bold text-base-content leading-tight line-clamp-1">{item.title}</h2>
                <p className="text-base-content text-sm line-clamp-2">{item.description}</p>
            </div>
        </div>
    );
}
