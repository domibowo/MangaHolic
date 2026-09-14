import { MANGADEX_PROXY_BASE_URL } from './config';
import type {
  AggregateChapter,
  AggregateVolume,
  Author,
  Chapter,
  Manga,
  MangaListItem,
  MangaStatus,
  Tag,
} from '../types/manga';

interface RawLocalizedString {
  [languageCode: string]: string;
}

interface RawRelationship {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
}

interface RawTagAttributes {
  name: RawLocalizedString;
  group: string;
}

export interface RawTag {
  id: string;
  type: 'tag';
  attributes: RawTagAttributes;
}

interface RawMangaAttributes {
  title: RawLocalizedString;
  altTitles: RawLocalizedString[];
  description: RawLocalizedString;
  status: MangaStatus;
  tags: RawTag[];
}

export interface RawManga {
  id: string;
  type: 'manga';
  attributes: RawMangaAttributes;
  relationships: RawRelationship[];
}

export interface RawAuthor {
  id: string;
  type: 'author' | 'artist';
  attributes: {
    name: string;
  };
}

export interface RawChapter {
  id: string;
  type: 'chapter';
  attributes: {
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    publishAt: string;
    externalUrl: string | null;
    pages: number;
  };
}

interface RawAggregateChapter {
  chapter: string;
  id: string;
  others: string[];
  count: number;
  isUnavailable: boolean;
}

interface RawAggregateVolume {
  volume: string;
  count: number;
  chapters: Record<string, RawAggregateChapter>;
}

export interface RawAggregateResponse {
  result: string;
  volumes: Record<string, RawAggregateVolume>;
}

export interface RawAtHomeServerResponse {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

function pickLocalized(localized: RawLocalizedString | undefined): string {
  if (!localized) {
    return '';
  }
  return localized.en ?? Object.values(localized)[0] ?? '';
}

/**
 * `attributes.title` sering tidak punya key `en` (mis. manga Jepang cuma
 * expose `ja-ro`), sementara judul Inggris "resmi" biasanya nyempil di
 * salah satu entri `altTitles`. Cari `en` di situ dulu sebelum jatuh ke
 * romanisasi/bahasa lain — jangan langsung pickLocalized(title) saja.
 */
function pickTitle(title: RawLocalizedString, altTitles: RawLocalizedString[]): string {
  if (title.en) {
    return title.en;
  }
  const englishAltTitle = altTitles.find((alt) => alt.en)?.en;
  if (englishAltTitle) {
    return englishAltTitle;
  }
  return title['ja-ro'] ?? pickLocalized(title) ?? pickLocalized(altTitles[0]);
}

export function mapTag(raw: RawTag): Tag {
  return {
    id: raw.id,
    name: pickLocalized(raw.attributes?.name),
    group: raw.attributes?.group ?? 'unknown',
  };
}

function findCoverFileName(relationships: RawRelationship[]): string | null {
  const coverArt = relationships.find((r) => r.type === 'cover_art');
  const fileName = coverArt?.attributes?.fileName;
  return typeof fileName === 'string' ? fileName : null;
}

export function buildCoverUrl(mangaId: string, fileName: string | null): string | null {
  if (!fileName) {
    return null;
  }
  // Lewat proxy (yang meneruskan ke uploads.mangadex.org), bukan domain
  // MangaDex langsung — domain CDN cover ikut di-DNS-block ISP Indonesia,
  // sama seperti domain API. Lihat DECISIONS.md #001 & TODO.md Milestone 5.
  return `${MANGADEX_PROXY_BASE_URL}/covers/${mangaId}/${fileName}`;
}

function mapPeopleByType(relationships: RawRelationship[], type: 'author' | 'artist'): Author[] {
  return relationships
    .filter((r) => r.type === type && typeof r.attributes?.name === 'string')
    .map((r) => ({ id: r.id, name: r.attributes!.name as string }));
}

export function mapMangaListItem(raw: RawManga): MangaListItem {
  return {
    id: raw.id,
    title: pickTitle(raw.attributes.title ?? {}, raw.attributes.altTitles ?? []),
    coverUrl: buildCoverUrl(raw.id, findCoverFileName(raw.relationships ?? [])),
    status: raw.attributes.status,
    tags: (raw.attributes.tags ?? []).map(mapTag),
  };
}

export function mapManga(raw: RawManga): Manga {
  return {
    ...mapMangaListItem(raw),
    description: pickLocalized(raw.attributes.description),
    authors: mapPeopleByType(raw.relationships ?? [], 'author'),
    artists: mapPeopleByType(raw.relationships ?? [], 'artist'),
  };
}

export function mapAuthor(raw: RawAuthor): Author {
  return { id: raw.id, name: raw.attributes.name };
}

export function mapChapter(raw: RawChapter): Chapter {
  return {
    id: raw.id,
    chapter: raw.attributes.chapter,
    title: raw.attributes.title,
    translatedLanguage: raw.attributes.translatedLanguage,
    publishAt: raw.attributes.publishAt,
    externalUrl: raw.attributes.externalUrl,
    pageCount: raw.attributes.pages,
  };
}

/**
 * `Object.values()` pada objek dengan key seperti "25" (integer-index)
 * dicampur "113.2" (bukan integer-index) TIDAK mengikuti urutan insersi —
 * spec ECMAScript mewajibkan key integer-index diiterasi lebih dulu secara
 * ascending, baru diikuti key string lain sesuai urutan insersi asli.
 * Aggregate MangaDex punya campuran keduanya (chapter bulat vs desimal
 * seperti "113.1"), jadi urutan `volume.chapters`/`raw.volumes` dari API
 * tidak bisa diandalkan — harus disortir eksplisit berdasar nilai numerik.
 */
function numericSortValue(value: string): number {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? -Infinity : parsed;
}

export function mapAggregate(raw: RawAggregateResponse): AggregateVolume[] {
  const volumes = Object.values(raw.volumes ?? {}).map((volume) => ({
    volume: volume.volume,
    chapters: Object.values(volume.chapters ?? {})
      .map(
        (chapter): AggregateChapter => ({
          chapter: chapter.chapter,
          id: chapter.id,
          otherIds: chapter.others ?? [],
          count: chapter.count,
          isUnavailable: chapter.isUnavailable ?? false,
        }),
      )
      .sort((a, b) => numericSortValue(b.chapter) - numericSortValue(a.chapter)),
  }));

  return volumes.sort((a, b) => numericSortValue(b.volume) - numericSortValue(a.volume));
}

export function buildPageUrl(baseUrl: string, hash: string, fileName: string, quality: 'data' | 'data-saver'): string {
  return `${baseUrl}/${quality}/${hash}/${fileName}`;
}
