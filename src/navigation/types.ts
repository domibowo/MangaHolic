import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Tiap tab (Browse, Search, Library) punya stack sendiri dengan bentuk
 * sama: home screen tab itu -> MangaDetail -> Reader. MangaDetail & Reader
 * BUKAN tab tersendiri — diakses via push, lihat DECISIONS.md #007. Semua
 * stack berbagi bentuk param MangaDetail/Reader yang identik, jadi kedua
 * screen itu di-type terhadap `DetailStackParamList` generik (bukan
 * per-tab) supaya bisa dipakai di ketiga stack tanpa duplikasi komponen.
 */
export type MangaDetailParams = { mangaId: string };
export type ReaderParams = { mangaId: string; chapterId: string };

export type DetailStackParamList = {
  MangaDetail: MangaDetailParams;
  Reader: ReaderParams;
};

export type BrowseStackParamList = DetailStackParamList & {
  Browse: undefined;
};

export type SearchStackParamList = DetailStackParamList & {
  Search: undefined;
};

export type LibraryStackParamList = DetailStackParamList & {
  Library: undefined;
};

export type RootTabParamList = {
  BrowseTab: undefined;
  SearchTab: undefined;
  LibraryTab: undefined;
};

export type DetailStackScreenProps<T extends keyof DetailStackParamList> = NativeStackScreenProps<
  DetailStackParamList,
  T
>;

export type BrowseStackScreenProps<T extends keyof BrowseStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<BrowseStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type SearchStackScreenProps<T extends keyof SearchStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SearchStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type LibraryStackScreenProps<T extends keyof LibraryStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<LibraryStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;
