export interface Movie {
    id: number,
    title: string,
    description: string,
    poster: string,
    genres: Genre[],
    rating: number,
    year: number,
    country: string,
    duration: number,
    file_path: string,
    isSerial: boolean,
    processed_file: string,
    processed_status: string,
    processed_progress: number,
    series: Series | null
}

export interface Genre {
    id: number,
    name: string
}

export interface User {
    id: number;
    username: string;
    email: string;
    profile: Profile;
    avatar: string;
}

export interface Profile {
    level: number;
    can_stream: boolean;
    can_dowload: boolean;
}


export interface Series {
    episodes: Episode[]
}

export interface Episode {
    id: number;
    movie_title: string;
    series: string;
    season_number: number;
    episode_number: number;
    title: string;
    description: string;
    duration: number;
    processed_status: string;
    processed_progress: number;
}