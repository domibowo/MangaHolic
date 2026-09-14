import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import type { ReactElement } from 'react';

import Button from './Button';
import MangaCard from './MangaCard';
import type { MangaListItem } from '../types/manga';

const GRID_COLUMNS = 2;

interface MangaRow {
  key: string;
  items: MangaListItem[];
}

type ListEntry =
  | { type: 'sticky' }
  | { type: 'loading' }
  | { type: 'error' }
  | { type: 'empty' }
  | { type: 'row'; row: MangaRow };

function chunkIntoRows(mangaList: MangaListItem[]): MangaRow[] {
  const rows: MangaRow[] = [];
  for (let i = 0; i < mangaList.length; i += GRID_COLUMNS) {
    rows.push({ key: mangaList[i].id, items: mangaList.slice(i, i + GRID_COLUMNS) });
  }
  return rows;
}

interface MangaGridProps {
  data: MangaListItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPressManga: (mangaId: string) => void;
  emptyMessage: string;
  errorMessage?: string;
  /** Konten non-sticky di atas grid (mis. judul "Mangaholic" di Browse) — scroll bersama grid. */
  ListHeaderComponent?: ReactElement;
  /**
   * Konten sticky yang nempel di bawah `ListHeaderComponent` begitu grid
   * discroll (mis. filter chip row di Browse, search-input di Search) —
   * lihat DESIGN.md § Navigasi.
   */
  stickyContent?: ReactElement;
  contentContainerClassName?: string;
}

// Dipakai bersama Browse (Milestone 5) & Search (Milestone 6) supaya card
// manga, chunking 2-kolom, dan state loading/error/empty tidak diduplikasi.
export default function MangaGrid({
  data,
  isLoading,
  isError,
  onRetry,
  onPressManga,
  emptyMessage,
  errorMessage = 'Gagal memuat manga. Periksa koneksi internet lalu coba lagi.',
  ListHeaderComponent,
  stickyContent,
  contentContainerClassName = 'pb-xl',
}: MangaGridProps) {
  const listData: ListEntry[] = useMemo(() => {
    let body: ListEntry[];
    if (isLoading) {
      body = [{ type: 'loading' }];
    } else if (isError) {
      body = [{ type: 'error' }];
    } else {
      const rows = chunkIntoRows(data ?? []);
      body = rows.length === 0 ? [{ type: 'empty' }] : rows.map((row) => ({ type: 'row', row }));
    }
    return stickyContent ? [{ type: 'sticky' }, ...body] : body;
  }, [isLoading, isError, data, stickyContent]);

  // RN menghitung stickyHeaderIndices TERMASUK offset ListHeaderComponent
  // (+1 kalau ada) — dienkapsulasi di sini supaya konsumen komponen ini
  // tidak perlu tahu kuirk internal tersebut (lihat TODO.md Milestone 5).
  const stickyHeaderIndices = stickyContent ? [ListHeaderComponent ? 1 : 0] : undefined;

  function renderItem({ item }: { item: ListEntry }) {
    switch (item.type) {
      case 'sticky':
        return stickyContent ?? null;

      case 'loading':
        return (
          <View className="items-center py-xxl">
            <ActivityIndicator color="#211f1c" />
          </View>
        );

      case 'error':
        return (
          <View className="mx-md mt-md items-center rounded-lg bg-surface-soft px-lg py-xxl">
            <Text className="text-center font-sans text-body-md text-ink-muted">
              {errorMessage}
            </Text>
            <Button label="Coba Lagi" variant="secondary" onPress={onRetry} className="mt-md" />
          </View>
        );

      case 'empty':
        return (
          <View className="mx-md mt-md items-center rounded-lg bg-surface-soft px-lg py-xxl">
            <Text className="text-center font-sans text-body-md text-ink-muted">
              {emptyMessage}
            </Text>
          </View>
        );

      case 'row':
        return (
          <View className="flex-row gap-sm px-md pt-sm">
            {item.row.items.map((manga) => (
              <MangaCard key={manga.id} manga={manga} onPress={() => onPressManga(manga.id)} />
            ))}
            {item.row.items.length < GRID_COLUMNS ? <View className="flex-1" /> : null}
          </View>
        );
    }
  }

  return (
    <FlatList
      data={listData}
      keyExtractor={(item, index) => (item.type === 'row' ? item.row.key : `${item.type}-${index}`)}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      stickyHeaderIndices={stickyHeaderIndices}
      contentContainerClassName={contentContainerClassName}
    />
  );
}
