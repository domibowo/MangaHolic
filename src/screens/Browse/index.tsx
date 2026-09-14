import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMangaTagsQuery, useSearchMangaQuery } from '../../api/mangadexApi';
import Chip, { type ChipTone } from '../../components/Chip';
import MangaGrid from '../../components/MangaGrid';
import type { BrowseStackScreenProps } from '../../navigation/types';

const CHIP_TONES: ChipTone[] = ['teal', 'coral', 'rose', 'sky'];

export default function BrowseScreen({ navigation }: BrowseStackScreenProps<'Browse'>) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const { data: tags } = useGetMangaTagsQuery();
  const genreTags = useMemo(() => (tags ?? []).filter((tag) => tag.group === 'genre'), [tags]);

  const {
    data: mangaList,
    isLoading,
    isError,
    refetch,
  } = useSearchMangaQuery({
    limit: 20,
    includedTags: selectedTagId ? [selectedTagId] : undefined,
  });

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <MangaGrid
        data={mangaList}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onPressManga={(mangaId) => navigation.navigate('MangaDetail', { mangaId })}
        emptyMessage="Tidak ada manga untuk genre ini."
        ListHeaderComponent={
          <Text className="px-md pb-sm pt-md font-heading text-heading-1 text-ink">
            Mangaholic
          </Text>
        }
        stickyContent={
          <View className="border-b border-hairline bg-canvas py-xs">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-xs px-md">
              <Chip
                label="Semua"
                selected={selectedTagId === null}
                onPress={() => setSelectedTagId(null)}
              />
              {genreTags.map((tag, index) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  tone={CHIP_TONES[index % CHIP_TONES.length]}
                  selected={selectedTagId === tag.id}
                  onPress={() => setSelectedTagId(tag.id)}
                />
              ))}
            </ScrollView>
          </View>
        }
      />
    </SafeAreaView>
  );
}
