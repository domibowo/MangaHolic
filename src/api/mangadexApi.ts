import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import type { Author, Chapter, ChapterPages, Manga, MangaListItem, Tag, AggregateVolume } from '../types/manga';
import { MANGADEX_PROXY_BASE_URL } from './config';
import { buildMangaDexQuery } from './queryString';
import {
  buildPageUrl,
  mapAggregate,
  mapAuthor,
  mapChapter,
  mapManga,
  mapMangaListItem,
  mapTag,
  type RawAggregateResponse,
  type RawAtHomeServerResponse,
  type RawAuthor,
  type RawChapter,
  type RawManga,
  type RawTag,
} from './mangadexMappers';

interface RawCollectionResponse<T> {
  result: string;
  response: 'collection';
  data: T[];
}

interface RawEntityResponse<T> {
  result: string;
  response: 'entity';
  data: T;
}

export interface NormalizedApiError {
  status: number | string;
  message: string;
}

function normalizeError(error: FetchBaseQueryError): NormalizedApiError {
  if (typeof error.status === 'number') {
    const data = error.data as { errors?: Array<{ detail?: string }> } | undefined;
    return {
      status: error.status,
      message: data?.errors?.[0]?.detail ?? `Request failed with status ${error.status}`,
    };
  }
  return {
    status: error.status,
    message: 'error' in error ? error.error : 'Unknown network error',
  };
}

export const mangadexApi = createApi({
  reducerPath: 'mangadexApi',
  baseQuery: fetchBaseQuery({
    baseUrl: MANGADEX_PROXY_BASE_URL,
  }),
  endpoints: (builder) => ({
    searchManga: builder.query<
      MangaListItem[],
      { title?: string; limit?: number; offset?: number; includedTags?: string[] }
    >({
      query: ({ title, limit = 20, offset = 0, includedTags }) =>
        `/manga${buildMangaDexQuery({
          title,
          limit,
          offset,
          'includes[]': ['cover_art'],
          'includedTags[]': includedTags,
          // Tanpa query judul (mode "populer" di Browse), urutkan dari yang
          // paling banyak di-follow — MangaDex mengabaikan ini kalau `title`
          // diisi (hasil pencarian judul urut relevansi bawaan).
          'order[followedCount]': title ? undefined : 'desc',
        })}`,
      transformResponse: (response: RawCollectionResponse<RawManga>) =>
        response.data.map(mapMangaListItem),
      transformErrorResponse: normalizeError,
    }),

    getMangaDetail: builder.query<Manga, string>({
      query: (mangaId) =>
        `/manga/${mangaId}${buildMangaDexQuery({ 'includes[]': ['cover_art', 'author', 'artist'] })}`,
      transformResponse: (response: RawEntityResponse<RawManga>) => mapManga(response.data),
      transformErrorResponse: normalizeError,
    }),

    getMangaFeed: builder.query<Chapter[], { mangaId: string; translatedLanguage?: string }>({
      query: ({ mangaId, translatedLanguage = 'en' }) =>
        `/manga/${mangaId}/feed${buildMangaDexQuery({
          'translatedLanguage[]': [translatedLanguage],
          'order[chapter]': 'asc',
        })}`,
      transformResponse: (response: RawCollectionResponse<RawChapter>) =>
        response.data.map(mapChapter),
      transformErrorResponse: normalizeError,
    }),

    getMangaAggregate: builder.query<AggregateVolume[], { mangaId: string; translatedLanguage?: string }>({
      query: ({ mangaId, translatedLanguage = 'en' }) =>
        `/manga/${mangaId}/aggregate${buildMangaDexQuery({ 'translatedLanguage[]': [translatedLanguage] })}`,
      transformResponse: (response: RawAggregateResponse) => mapAggregate(response),
      transformErrorResponse: normalizeError,
    }),

    getAtHomeServer: builder.query<ChapterPages, string>({
      query: (chapterId) => `/at-home/server/${chapterId}`,
      transformResponse: (response: RawAtHomeServerResponse, _meta, chapterId): ChapterPages => ({
        chapterId,
        pageUrls: response.chapter.data.map((fileName) =>
          buildPageUrl(response.baseUrl, response.chapter.hash, fileName, 'data'),
        ),
        pageUrlsDataSaver: response.chapter.dataSaver.map((fileName) =>
          buildPageUrl(response.baseUrl, response.chapter.hash, fileName, 'data-saver'),
        ),
      }),
      transformErrorResponse: normalizeError,
      // Token sesi sementara dari MangaDex — jangan cache lama di client.
      // Lihat AGENTS.md § api/ untuk detail kuirk ini.
      keepUnusedDataFor: 0,
    }),

    getCoverFileName: builder.query<string | null, string>({
      query: (coverId) => `/cover/${coverId}`,
      transformResponse: (response: RawEntityResponse<{ attributes: { fileName: string } }>) =>
        response.data.attributes.fileName ?? null,
      transformErrorResponse: normalizeError,
    }),

    getMangaTags: builder.query<Tag[], void>({
      query: () => '/manga/tag',
      transformResponse: (response: RawCollectionResponse<RawTag>) => response.data.map(mapTag),
      transformErrorResponse: normalizeError,
    }),

    getAuthor: builder.query<Author, string>({
      query: (authorId) => `/author/${authorId}`,
      transformResponse: (response: RawEntityResponse<RawAuthor>) => mapAuthor(response.data),
      transformErrorResponse: normalizeError,
    }),
  }),
});

export const {
  useSearchMangaQuery,
  useGetMangaDetailQuery,
  useGetMangaFeedQuery,
  useGetMangaAggregateQuery,
  useGetAtHomeServerQuery,
  useGetCoverFileNameQuery,
  useGetMangaTagsQuery,
  useGetAuthorQuery,
} = mangadexApi;
