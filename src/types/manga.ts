export type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';

export interface Tag {
  id: string;
  name: string;
  group: string;
}

export interface Author {
  id: string;
  name: string;
}

export interface MangaListItem {
  id: string;
  title: string;
  coverUrl: string | null;
  status: MangaStatus;
  tags: Tag[];
}

export interface Manga extends MangaListItem {
  description: string;
  authors: Author[];
  artists: Author[];
}

export interface Chapter {
  id: string;
  chapter: string | null;
  title: string | null;
  translatedLanguage: string;
  publishAt: string;
  /** Chapter tidak punya halaman di MangaDex — dibaca via link eksternal (mis. MangaPlus/Viz), bukan `/at-home/server`. */
  externalUrl: string | null;
  pageCount: number;
}

export interface AggregateChapter {
  chapter: string;
  id: string;
  otherIds: string[];
  count: number;
  isUnavailable: boolean;
}

export interface AggregateVolume {
  volume: string;
  chapters: AggregateChapter[];
}

export interface ChapterPages {
  chapterId: string;
  /** URL halaman kualitas penuh, sudah dirakit `${baseUrl}/data/{hash}/{file}` — siap dipakai langsung sebagai <Image> source. */
  pageUrls: string[];
  /** URL halaman data-saver (kompresi lebih tinggi), untuk mode hemat data. */
  pageUrlsDataSaver: string[];
}
