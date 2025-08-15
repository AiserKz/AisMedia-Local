import "plyr-react/plyr.css";
import Plyr from "plyr-react";
import type { PlyrSource } from "plyr-react";

export default function VideoPlayer({ movie_id }: { movie_id: number }) {

  const videoSrc: PlyrSource = {
    type: "video", // теперь TS знает, что это литерал
    sources: [
      {
        src: "http://" + window.location.hostname + ":8000/api/video/" + movie_id + "/1",
        type: "video/mp4"
      }
    ]
  };

  return (
    <div className="w-full h-full min-h-[150px]">
        <Plyr
          source={videoSrc}
          style={{ height: "100%", width: "100%" }}
          options={{ ratio: "16:9" }}
        />
    </div>
  );
}
