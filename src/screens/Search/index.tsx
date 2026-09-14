import { Search as SearchIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSearchMangaQuery } from '../../api/mangadexApi';
import MangaGrid from '../../components/MangaGrid';
import type { SearchStackScreenProps } from '../../navigation/types';

const DEBOUNCE_MS = 400;

export default function SearchScreen({ navigation }: SearchStackScreenProps<'Search'>) {
  const [queryText, setQueryText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(queryText.trim()), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [queryText]);

  const hasQuery = debouncedQuery.length > 0;

  const {
    data: mangaList,
    isLoading,
    isError,
    refetch,
  } = useSearchMangaQuery({ title: debouncedQuery, limit: 20 }, { skip: !hasQuery });

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <MangaGrid
        // Belum ada query (`hasQuery` false) — jangan tampilkan state
        // loading/error dari hook (query di-skip juga lewat RTK Query),
        // cuma prompt "ketik dulu" lewat emptyMessage di bawah.
        data={hasQuery ? mangaList : []}
        isLoading={hasQuery && isLoading}
        isError={hasQuery && isError}
        onRetry={refetch}
        onPressManga={(mangaId) => navigation.navigate('MangaDetail', { mangaId })}
        emptyMessage={
          hasQuery
            ? `Tidak ada hasil untuk "${debouncedQuery}".`
            : 'Ketik judul manga untuk mulai mencari.'
        }
        stickyContent={
          // Search-input jadi "header" screen (lihat DESIGN.md § Navigasi) —
          // selalu di posisi yang sama di tree (sticky content MangaGrid)
          // biar tidak remount/kehilangan fokus keyboard saat hasQuery
          // berubah dari false ke true.
          <View className="border-b border-hairline bg-canvas py-xs">
            <View className="mx-md h-11 flex-row items-center gap-xs rounded-md bg-surface-soft px-md">
              <SearchIcon color="#847d72" size={18} />
              <TextInput
                value={queryText}
                onChangeText={setQueryText}
                placeholder="Cari judul manga..."
                placeholderTextColor="#b3aca0"
                className="flex-1 font-sans text-body-md text-ink"
                autoFocus
                returnKeyType="search"
              />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
