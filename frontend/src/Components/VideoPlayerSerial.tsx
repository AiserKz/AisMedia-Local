import "plyr-react/plyr.css";
import Plyr from "plyr-react";
import type { PlyrSource } from "plyr-react";
import IonIcon from "@reacticons/ionicons";
import type { Series } from "../Interface/types";
import { useState } from "react";


export default function VideoPlayerSerial({ series }: { series: Series | null }) {


    const [selectedEpisode, setSelectedEpisode] = useState(0);
    const url = series?.episodes[selectedEpisode].id;

    const videoSrc: PlyrSource = {
        type: "video", // теперь TS знает, что это литерал
        sources: [
            {
                src: "http://" + window.location.hostname + ":8000/api/video/" + url + "/" + 2,
                type: "video/mp4"
            }
        ]
    };

    return (
        <div className="w-full h-full min-h-[150px] ">
            <div className="rounded-2xl overflow-hidden">
                <Plyr
                    source={videoSrc}
                    style={{ height: "100%", width: "100%" }}
                    options={{ ratio: "16:9" }}
                />
            </div>
             
            <hr className="my-2 border-primary opacity-50" />
            <div className="mt-4 w-full grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {series?.episodes.map((_, index) => (
                    <button
                        key={index}
                        className={
                            `group relative flex flex-col items-center justify-center h-20 w-full min-w-0 rounded-xl shadow border transition-all duration-200 px-1 ` +
                            (selectedEpisode === index
                                ? 'bg-primary/20 border-primary scale-105 ring-2 ring-primary text-primary'
                                : 'bg-base-200 border-base-300 hover:scale-105 hover:shadow-lg hover:border-primary focus:scale-105 focus:shadow-lg focus:border-primary')
                        }
                        onClick={() => setSelectedEpisode(index)}
                    >
                        <IonIcon
                            name="play-circle"
                            className={
                                `text-2xl mb-1 transition-transform duration-200 ` +
                                (selectedEpisode === index
                                    ? 'text-primary scale-125'
                                    : 'text-primary group-hover:scale-110 group-hover:text-accent')
                            }
                        />
                        <span className={
                            `font-semibold text-xs truncate w-full text-center transition-colors duration-200 ` +
                            (selectedEpisode === index ? 'text-primary' : 'text-base-content group-hover:text-primary')
                        }>
                            {index + 1} серия
                        </span>
                    </button>
                ))}
            </div>
   
        </div>
    );
}
