export interface Movie {
  name: string;
  slug: string;
  original_name: string;
  thumb_url: string;
  poster_url: string;
  description: string;
  total_episodes: number;
  current_episode: string;
  time: string;
  quality: string;
  language: string;
  director: string | null;
  casts: string | null;
  year?: number | string;
}

export interface Episode {
  name: string;
  slug: string;
  embed: string;
  m3u8: string;
}

export interface Server {
  server_name: string;
  items: Episode[];
}

export interface MovieDetails extends Movie {
  category: {
    [key: string]: {
      group: { id: string; name: string };
      list: { id: string; name: string }[];
    };
  };
  episodes: Server[];
}

export interface Paginate {
  current_page: number;
  total_page: number;
  total_items: number;
  items_per_page: number;
}

export interface MovieListResponse {
  status: string;
  paginate: Paginate;
  items: Movie[];
}

export interface MovieDetailResponse {
  status: string;
  movie: MovieDetails;
}
