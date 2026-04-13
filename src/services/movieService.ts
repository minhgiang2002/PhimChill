import { MovieListResponse, MovieDetailResponse, Movie, MovieDetails, Server } from '@/src/types/movie';

const NGUONC_BASE = 'https://phim.nguonc.com/api';
const KKPHIM_BASE = 'https://phimapi.com';

export type ApiSource = 'nguonc' | 'kkphim';

let currentSource: ApiSource = 'nguonc';
try {
  const saved = localStorage.getItem('api_source');
  if (saved === 'nguonc' || saved === 'kkphim') {
    currentSource = saved;
  }
} catch (e) {
  console.warn("[movieService] LocalStorage access blocked or failed:", e);
}

export const setApiSource = (source: ApiSource) => {
  currentSource = source;
  try {
    localStorage.setItem('api_source', source);
  } catch (e) {
    console.warn("[movieService] Failed to save to LocalStorage:", e);
  }
};

export const getApiSource = () => currentSource;

async function fetchApi<T>(baseUrl: string, endpoint: string, params: Record<string, string | number> = {}, retries = 1): Promise<T> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value.toString());
  });

  const url = `${baseUrl}${endpoint}${queryParams.toString() ? (endpoint.includes('?') ? `&${queryParams.toString()}` : `?${queryParams.toString()}`) : ''}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000); // Reduced to 7s

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, 800));
      return fetchApi<T>(baseUrl, endpoint, params, retries - 1);
    }
    throw error;
  }
}

// Normalization helpers
function normalizeNguonCMovie(m: any): Movie {
  return {
    ...m,
    thumb_url: m.thumb_url,
    poster_url: m.poster_url,
    year: m.year
  };
}

function normalizeKKPhimMovie(m: any): Movie {
  const thumb = m.poster_url?.startsWith('http') ? m.poster_url : `https://phimimg.com/${m.poster_url}`;
  const poster = m.thumb_url?.startsWith('http') ? m.thumb_url : `https://phimimg.com/${m.thumb_url}`;
  return {
    name: m.name,
    slug: m.slug,
    original_name: m.origin_name || m.original_name,
    thumb_url: thumb,
    poster_url: poster,
    description: m.content || '',
    total_episodes: m.episode_total || 0,
    current_episode: m.episode_current || '',
    time: m.time || '',
    quality: m.quality || '',
    language: m.lang || '',
    director: m.director?.join(', ') || null,
    casts: m.actor?.join(', ') || null,
    year: m.year
  };
}

export const movieService = {
  getNewUpdates: async (page: number = 1): Promise<MovieListResponse> => {
    if (currentSource === 'kkphim') {
      const data: any = await fetchApi(KKPHIM_BASE, '/danh-sach/phim-moi-cap-nhat', { page });
      return {
        status: 'success',
        paginate: {
          current_page: data.pagination.currentPage,
          total_page: data.pagination.totalPages,
          total_items: data.pagination.totalItems,
          items_per_page: data.pagination.totalItemsPerPage
        },
        items: data.items.map(normalizeKKPhimMovie)
      };
    }
    const data = await fetchApi<MovieListResponse>(NGUONC_BASE, '/films/phim-moi-cap-nhat', { page });
    return { ...data, items: data.items.map(normalizeNguonCMovie) };
  },

  getByCategory: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    if (currentSource === 'kkphim') {
      const kkSlug = slug === 'phim-le' ? 'phim-le' : 'phim-bo';
      const data: any = await fetchApi(KKPHIM_BASE, `/v1/api/danh-sach/${kkSlug}`, { page });
      return {
        status: 'success',
        paginate: {
          current_page: data.data.params.pagination.currentPage,
          total_page: data.data.params.pagination.totalPages,
          total_items: data.data.params.pagination.totalItems,
          items_per_page: data.data.params.pagination.totalItemsPerPage
        },
        items: data.data.items.map(normalizeKKPhimMovie)
      };
    }
    return fetchApi<MovieListResponse>(NGUONC_BASE, `/films/danh-sach/${slug}`, { page });
  },

  getByGenre: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    if (currentSource === 'kkphim') {
      const data: any = await fetchApi(KKPHIM_BASE, `/v1/api/the-loai/${slug}`, { page });
      return {
        status: 'success',
        paginate: {
          current_page: data.data.params.pagination.currentPage,
          total_page: data.data.params.pagination.totalPages,
          total_items: data.data.params.pagination.totalItems,
          items_per_page: data.data.params.pagination.totalItemsPerPage
        },
        items: data.data.items.map(normalizeKKPhimMovie)
      };
    }
    return fetchApi<MovieListResponse>(NGUONC_BASE, `/films/the-loai/${slug}`, { page });
  },

  getByCountry: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    if (currentSource === 'kkphim') {
      const data: any = await fetchApi(KKPHIM_BASE, `/v1/api/quoc-gia/${slug}`, { page });
      return {
        status: 'success',
        paginate: {
          current_page: data.data.params.pagination.currentPage,
          total_page: data.data.params.pagination.totalPages,
          total_items: data.data.params.pagination.totalItems,
          items_per_page: data.data.params.pagination.totalItemsPerPage
        },
        items: data.data.items.map(normalizeKKPhimMovie)
      };
    }
    return fetchApi<MovieListResponse>(NGUONC_BASE, `/films/quoc-gia/${slug}`, { page });
  },

  getByYear: async (year: string | number, page: number = 1): Promise<MovieListResponse> => {
    if (currentSource === 'kkphim') {
      const data: any = await fetchApi(KKPHIM_BASE, `/v1/api/nam/${year}`, { page });
      return {
        status: 'success',
        paginate: {
          current_page: data.data.params.pagination.currentPage,
          total_page: data.data.params.pagination.totalPages,
          total_items: data.data.params.pagination.totalItems,
          items_per_page: data.data.params.pagination.totalItemsPerPage
        },
        items: data.data.items.map(normalizeKKPhimMovie)
      };
    }
    return fetchApi<MovieListResponse>(NGUONC_BASE, `/films/nam-phat-hanh/${year}`, { page });
  },

  getMovieDetail: async (slug: string): Promise<MovieDetailResponse> => {
    // 1. Try to fetch from both by slug first
    const nguoncPromise = fetchApi<MovieDetailResponse>(NGUONC_BASE, `/film/${slug}`).catch(() => null);
    const kkphimPromise = fetchApi<any>(KKPHIM_BASE, `/phim/${slug}`).catch(() => null);

    let [nguoncData, kkphimData] = await Promise.all([nguoncPromise, kkphimPromise]);

    // Helper to normalize strings for better comparison
    const normalizeForMatch = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 2. Fallback: If one source failed, try searching by name from the other source
    if (nguoncData && !kkphimData) {
      const searchName = nguoncData.movie.name;
      console.log(`[movieService] KKPhim missing slug "${slug}", searching for "${searchName}"...`);
      const searchRes: any = await fetchApi(KKPHIM_BASE, `/v1/api/tim-kiem`, { keyword: searchName, limit: 5 }).catch(() => null);
      
      if (searchRes?.data?.items?.length > 0) {
        // Try to find the best match in search results
        const targetMatch = normalizeForMatch(searchName);
        const bestMatch = searchRes.data.items.find((item: any) => 
          normalizeForMatch(item.name) === targetMatch || 
          normalizeForMatch(item.origin_name || '') === targetMatch
        ) || searchRes.data.items[0];

        console.log(`[movieService] Found potential KKPhim match: ${bestMatch.name} (${bestMatch.slug})`);
        kkphimData = await fetchApi<any>(KKPHIM_BASE, `/phim/${bestMatch.slug}`).catch(() => null);
      }
    } else if (!nguoncData && kkphimData) {
      const searchName = kkphimData.movie.name;
      console.log(`[movieService] NguonC missing slug "${slug}", searching for "${searchName}"...`);
      const searchRes: any = await fetchApi(NGUONC_BASE, '/films/search', { keyword: searchName }).catch(() => null);
      
      if (searchRes?.items?.length > 0) {
        // Try to find the best match in search results
        const targetMatch = normalizeForMatch(searchName);
        const bestMatch = searchRes.items.find((item: any) => 
          normalizeForMatch(item.name) === targetMatch || 
          normalizeForMatch(item.original_name || '') === targetMatch
        ) || searchRes.items[0];

        console.log(`[movieService] Found potential NguonC match: ${bestMatch.name} (${bestMatch.slug})`);
        nguoncData = await fetchApi<MovieDetailResponse>(NGUONC_BASE, `/film/${bestMatch.slug}`).catch(() => null);
      }
    }

    if (!nguoncData && !kkphimData) throw new Error("Movie not found");

    let baseDetail: MovieDetails;
    let allServers: Server[] = [];

    // Prioritize current source for base detail and server order
    const sources = currentSource === 'kkphim' 
      ? [{ data: kkphimData, type: 'kkphim' }, { data: nguoncData, type: 'nguonc' }]
      : [{ data: nguoncData, type: 'nguonc' }, { data: kkphimData, type: 'kkphim' }];

    for (const src of sources) {
      const data = src.data;
      if (!data) continue;

      if (src.type === 'nguonc' && data.movie) {
        if (!baseDetail!) baseDetail = data.movie;
        
        if (Array.isArray(data.movie.episodes)) {
          const nguoncServers = data.movie.episodes.map((s: any) => ({
            ...s,
            server_name: `Nguồn 1`,
            items: Array.isArray(s.items) ? s.items.map((e: any) => {
              let cleanName = e.name;
              if (cleanName?.toLowerCase().startsWith('tập')) {
                cleanName = cleanName.replace(/^[Tt]ập\s*/, '');
              }
              return { ...e, name: cleanName };
            }) : []
          }));
          allServers = [...allServers, ...nguoncServers];
        }
      } else if (src.type === 'kkphim' && data.movie) {
        const kkDetail = normalizeKKPhimMovie(data.movie);
        if (!baseDetail!) {
          baseDetail = {
            ...kkDetail,
            category: {},
            episodes: []
          } as MovieDetails;
        }

        if (Array.isArray(data.episodes)) {
          const kkServers: Server[] = data.episodes.map((s: any) => ({
            server_name: `Nguồn 2`,
            items: Array.isArray(s.server_data) ? s.server_data.map((e: any) => {
              let cleanName = e.name;
              if (cleanName?.toLowerCase().startsWith('tập')) {
                cleanName = cleanName.replace(/^[Tt]ập\s*/, '');
              }
              
              return {
                name: cleanName,
                slug: e.slug,
                embed: e.link_embed,
                m3u8: e.link_m3u8
              };
            }) : []
          }));
          allServers = [...allServers, ...kkServers];
        }
      }
    }

    return {
      status: 'success',
      movie: {
        ...baseDetail!,
        episodes: allServers
      }
    };
  },

  search: async (keyword: string): Promise<MovieListResponse> => {
    if (currentSource === 'kkphim') {
      const data: any = await fetchApi(KKPHIM_BASE, `/v1/api/tim-kiem`, { keyword, limit: 12 });
      return {
        status: 'success',
        paginate: {
          current_page: data.data.params.pagination.currentPage,
          total_page: data.data.params.pagination.totalPages,
          total_items: data.data.params.pagination.totalItems,
          items_per_page: data.data.params.pagination.totalItemsPerPage
        },
        items: data.data.items.map(normalizeKKPhimMovie)
      };
    }
    return fetchApi<MovieListResponse>(NGUONC_BASE, '/films/search', { keyword });
  },
};
