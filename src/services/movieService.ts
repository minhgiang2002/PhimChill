import { MovieListResponse, MovieDetailResponse, Movie, MovieDetails, Server } from '@/src/types/movie';
import { geminiService } from './geminiService';

const NGUONC_BASE = 'https://phim.nguonc.com/api';
const KKPHIM_BASE = 'https://phimapi.com';
const PHIM_API_DELTA_BASE = 'https://corsproxy.io/?' + encodeURIComponent('https://phim-api-delta.vercel.app/api/movies');

export type ApiSource = 'nguonc' | 'kkphim' | 'phimapi_delta';

let currentSource: ApiSource = 'nguonc';
try {
  const saved = localStorage.getItem('api_source');
  if (saved === 'nguonc' || saved === 'kkphim' || saved === 'phimapi_delta') {
    currentSource = saved as ApiSource;
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

  // Handle corsproxy.io correctly by appending to the encoded URL
  let url = '';
  if (baseUrl.includes('corsproxy.io')) {
    const originalUrl = decodeURIComponent(baseUrl.replace('https://corsproxy.io/?', ''));
    const fullOriginalUrl = `${originalUrl}${endpoint}${queryParams.toString() ? (endpoint.includes('?') ? `&${queryParams.toString()}` : `?${queryParams.toString()}`) : ''}`;
    url = `https://corsproxy.io/?${encodeURIComponent(fullOriginalUrl)}`;
  } else {
    url = `${baseUrl}${endpoint}${queryParams.toString() ? (endpoint.includes('?') ? `&${queryParams.toString()}` : `?${queryParams.toString()}`) : ''}`;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000); // Reduced to 7s

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Do not retry on CORS or offline errors (Failed to fetch) to avoid slowing down the app
    if (retries > 0 && error.name !== 'AbortError' && error.message !== 'Failed to fetch') {
      await new Promise(resolve => setTimeout(resolve, 300)); // Reduced retry delay
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

function normalizeDeltaMovie(m: any): Movie {
  return {
    name: m.name,
    slug: m.slug,
    original_name: m.original_name || m.origin_name || '',
    thumb_url: m.thumb_url,
    poster_url: m.poster_url,
    description: m.description || m.content || '',
    total_episodes: m.total_episodes || m.episode_total || 0,
    current_episode: m.current_episode || m.episode_current || '',
    time: m.time || '',
    quality: m.quality || '',
    language: m.language || m.lang || '',
    director: Array.isArray(m.director) ? m.director.join(', ') : (m.director || null),
    casts: Array.isArray(m.casts) ? m.casts.join(', ') : (m.casts || null),
    year: m.year
  };
}

export const movieService = {
  getNewUpdates: async (page: number = 1): Promise<MovieListResponse> => {
    if (currentSource === 'phimapi_delta') {
      const data: any = await fetchApi(PHIM_API_DELTA_BASE, '/latest', { page });
      return {
        status: 'success',
        paginate: {
          current_page: page,
          total_page: 100,
          total_items: 1000,
          items_per_page: data.items?.length || 20
        },
        items: (data.items || []).map(normalizeDeltaMovie)
      };
    }
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
    if (currentSource === 'phimapi_delta') {
      const data: any = await fetchApi(PHIM_API_DELTA_BASE, `/category/${slug}`, { page });
      return {
        status: 'success',
        paginate: {
          current_page: page,
          total_page: 100,
          total_items: 1000,
          items_per_page: data.items?.length || 20
        },
        items: (data.items || []).map(normalizeDeltaMovie)
      };
    }
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
    if (currentSource === 'phimapi_delta') {
      const data: any = await fetchApi(PHIM_API_DELTA_BASE, `/genre/${slug}`, { page });
      return {
        status: 'success',
        paginate: {
          current_page: page,
          total_page: 100,
          total_items: 1000,
          items_per_page: data.items?.length || 20
        },
        items: (data.items || []).map(normalizeDeltaMovie)
      };
    }
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
    if (currentSource === 'phimapi_delta') {
      const data: any = await fetchApi(PHIM_API_DELTA_BASE, `/country/${slug}`, { page });
      return {
        status: 'success',
        paginate: {
          current_page: page,
          total_page: 100,
          total_items: 1000,
          items_per_page: data.items?.length || 20
        },
        items: (data.items || []).map(normalizeDeltaMovie)
      };
    }
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
    if (currentSource === 'phimapi_delta') {
      const data: any = await fetchApi(PHIM_API_DELTA_BASE, `/year/${year}`, { page });
      return {
        status: 'success',
        paginate: {
          current_page: page,
          total_page: 100,
          total_items: 1000,
          items_per_page: data.items?.length || 20
        },
        items: (data.items || []).map(normalizeDeltaMovie)
      };
    }
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
    // 1. Try to fetch from all 3 sources
    const nguoncPromise = fetchApi<MovieDetailResponse>(NGUONC_BASE, `/film/${slug}`).catch(() => null);
    const kkphimPromise = fetchApi<any>(KKPHIM_BASE, `/phim/${slug}`).catch(() => null);
    const deltaPromise = fetchApi<any>(PHIM_API_DELTA_BASE, `/details/${slug}`).catch(() => null);

    let [nguoncData, kkphimData, deltaData] = await Promise.all([nguoncPromise, kkphimPromise, deltaPromise]);

    // Helper to normalize strings for better comparison
    const normalizeForMatch = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 2. Fallback: If one source failed, try searching by name from the other source
    const searchName = nguoncData?.movie?.name || kkphimData?.movie?.name || deltaData?.movie?.name;

    if (searchName) {
      if (!kkphimData) {
        console.log(`[movieService] KKPhim missing slug "${slug}", searching for "${searchName}"...`);
        const searchRes: any = await fetchApi(KKPHIM_BASE, `/v1/api/tim-kiem`, { keyword: searchName, limit: 5 }).catch(() => null);
        if (searchRes?.data?.items?.length > 0) {
          const targetMatch = normalizeForMatch(searchName);
          const bestMatch = searchRes.data.items.find((item: any) => 
            normalizeForMatch(item.name) === targetMatch || 
            normalizeForMatch(item.origin_name || '') === targetMatch
          ) || searchRes.data.items[0];
          kkphimData = await fetchApi<any>(KKPHIM_BASE, `/phim/${bestMatch.slug}`).catch(() => null);
        }
      }
      
      if (!nguoncData) {
        console.log(`[movieService] NguonC missing slug "${slug}", searching for "${searchName}"...`);
        const searchRes: any = await fetchApi(NGUONC_BASE, '/films/search', { keyword: searchName }).catch(() => null);
        if (searchRes?.items?.length > 0) {
          const targetMatch = normalizeForMatch(searchName);
          const bestMatch = searchRes.items.find((item: any) => 
            normalizeForMatch(item.name) === targetMatch || 
            normalizeForMatch(item.original_name || '') === targetMatch
          ) || searchRes.items[0];
          nguoncData = await fetchApi<MovieDetailResponse>(NGUONC_BASE, `/film/${bestMatch.slug}`).catch(() => null);
        }
      }

      if (!deltaData) {
        console.log(`[movieService] Delta missing slug "${slug}", searching for "${searchName}"...`);
        const searchRes: any = await fetchApi(PHIM_API_DELTA_BASE, '/search', { keyword: searchName }).catch(() => null);
        if (searchRes?.items?.length > 0) {
          const targetMatch = normalizeForMatch(searchName);
          const bestMatch = searchRes.items.find((item: any) => 
            normalizeForMatch(item.name) === targetMatch || 
            normalizeForMatch(item.original_name || '') === targetMatch
          ) || searchRes.items[0];
          deltaData = await fetchApi<any>(PHIM_API_DELTA_BASE, `/details/${bestMatch.slug}`).catch(() => null);
        }
      }
    }

    if (!nguoncData && !kkphimData && !deltaData) throw new Error("Movie not found");

    let baseDetail: MovieDetails;
    let allServers: Server[] = [];

    // Prioritize current source for base detail and server order
    let sources = [
      { data: nguoncData, type: 'nguonc' },
      { data: kkphimData, type: 'kkphim' },
      { data: deltaData, type: 'phimapi_delta' }
    ];

    if (currentSource === 'kkphim') {
      sources = [
        { data: kkphimData, type: 'kkphim' },
        { data: nguoncData, type: 'nguonc' },
        { data: deltaData, type: 'phimapi_delta' }
      ];
    } else if (currentSource === 'phimapi_delta') {
      sources = [
        { data: deltaData, type: 'phimapi_delta' },
        { data: nguoncData, type: 'nguonc' },
        { data: kkphimData, type: 'kkphim' }
      ];
    }

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
      } else if (src.type === 'phimapi_delta' && data.movie) {
        if (!baseDetail!) baseDetail = data.movie;

        if (Array.isArray(data.movie.episodes)) {
          const deltaServers = data.movie.episodes.map((s: any, idx: number) => ({
            ...s,
            server_name: `Nguồn 3 (${s.server_name || idx + 1})`,
            items: Array.isArray(s.items) ? s.items.map((e: any) => {
              let cleanName = e.name;
              if (cleanName?.toLowerCase().startsWith('tập')) {
                cleanName = cleanName.replace(/^[Tt]ập\s*/, '');
              }
              return { ...e, name: cleanName };
            }) : []
          }));
          allServers = [...allServers, ...deltaServers];
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
    const performSearch = async (kw: string): Promise<MovieListResponse> => {
      if (currentSource === 'phimapi_delta') {
        const data: any = await fetchApi(PHIM_API_DELTA_BASE, '/search', { keyword: kw });
        return {
          status: 'success',
          paginate: {
            current_page: 1,
            total_page: 1,
            total_items: data.items?.length || 0,
            items_per_page: data.items?.length || 20
          },
          items: (data.items || []).map(normalizeDeltaMovie)
        };
      }
      if (currentSource === 'kkphim') {
        const data: any = await fetchApi(KKPHIM_BASE, `/v1/api/tim-kiem`, { keyword: kw, limit: 12 });
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
      const data = await fetchApi<MovieListResponse>(NGUONC_BASE, '/films/search', { keyword: kw });
      return { ...data, items: data.items.map(normalizeNguonCMovie) };
    };

    try {
      let result = await performSearch(keyword);
      
      // If no results, try to get related keywords from AI
      if (!result.items || result.items.length === 0) {
        console.log(`[movieService] No results for "${keyword}", trying AI related keywords...`);
        const relatedKeywords = await geminiService.getRelatedKeywords(keyword);
        
        for (const relatedKw of relatedKeywords) {
          console.log(`[movieService] Trying related keyword: "${relatedKw}"`);
          try {
            const relatedResult = await performSearch(relatedKw);
            if (relatedResult.items && relatedResult.items.length > 0) {
              return relatedResult;
            }
          } catch (e) {
            console.error(`[movieService] Search failed for related keyword "${relatedKw}":`, e);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error("[movieService] Search error:", error);
      throw error;
    }
  },
};
