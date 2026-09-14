import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { useMemo, useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { useGetMangaAggregateQuery, useGetMangaDetailQuery } from '../../api/mangadexApi';
import Badge from '../../components/Badge';
import Chip, { type ChipTone } from '../../components/Chip';
import type { DetailStackScreenProps } from '../../navigation/types';
import { addBookmark, removeBookmark } from '../../store/librarySlice';
import type { RootState } from '../../store';
import type { AggregateVolume } from '../../types/manga';

const HERO_HEIGHT = 320;
const COMPACT_BAR_HEIGHT = 56;
const CHIP_TONES: ChipTone[] = ['teal', 'coral', 'rose', 'sky'];

interface ChapterRow {
  id: string;
  label: string;
  isUnavailable: boolean;
}

function flattenChapters(volumes: AggregateVolume[]): ChapterRow[] {
  const rows: ChapterRow[] = [];
  for (const volume of volumes) {
    for (const chapter of volume.chapters) {
      rows.push({
        id: chapter.id,
        label:
          volume.volume === 'none'
            ? `Chapter ${chapter.chapter}`
            : `Vol. ${volume.volume} Ch. ${chapter.chapter}`,
        isUnavailable: chapter.isUnavailable,
      });
    }
  }
  return rows;
}

export default function MangaDetailScreen({
  navigation,
  route,
}: DetailStackScreenProps<'MangaDetail'>) {
  const { mangaId } = route.params;
  const dispatch = useDispatch();
  const isBookmarked = useSelector((state: RootState) =>
    state.library.bookmarkedMangaIds.includes(mangaId),
  );

  const { data: manga, isLoading: isMangaLoading, isError: isMangaError } =
    useGetMangaDetailQuery(mangaId);
  const { data: volumes } = useGetMangaAggregateQuery({ mangaId });
  const chapters = useMemo(() => flattenChapters(volumes ?? []), [volumes]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const compactBarOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT - COMPACT_BAR_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  function toggleBookmark() {
    dispatch(isBookmarked ? removeBookmark(mangaId) : addBookmark(mangaId));
  }

  return (
    <View className="flex-1 bg-canvas">
      <Animated.FlatList
        data={chapters}
        keyExtractor={(item: ChapterRow) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        contentContainerClassName="pb-xl"
        ListHeaderComponent={
          <View>
            <View style={{ height: HERO_HEIGHT }} className="bg-surface-soft">
              {manga?.coverUrl ? (
                <Image
                  source={{ uri: manga.coverUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : null}
            </View>

            <View className="px-md pt-md">
              {isMangaLoading ? (
                <Text className="font-sans text-body-md text-ink-muted">Memuat...</Text>
              ) : isMangaError || !manga ? (
                <Text className="font-sans text-body-md text-ink-muted">
                  Gagal memuat detail manga.
                </Text>
              ) : (
                <>
                  <View className="flex-row flex-wrap items-center gap-xs">
                    <Text className="font-heading text-heading-1 text-ink">{manga.title}</Text>
                    <Badge label={manga.status} variant={manga.status} />
                  </View>

                  {manga.authors.length > 0 || manga.artists.length > 0 ? (
                    <Text className="mt-xxs font-sans text-body-sm text-ink-muted">
                      {[...manga.authors, ...manga.artists].map((person) => person.name).join(', ')}
                    </Text>
                  ) : null}

                  {manga.tags.length > 0 ? (
                    <View className="mt-sm flex-row flex-wrap gap-xs">
                      {manga.tags.map((tag, index) => (
                        <Chip key={tag.id} label={tag.name} tone={CHIP_TONES[index % CHIP_TONES.length]} />
                      ))}
                    </View>
                  ) : null}

                  {manga.description ? (
                    <Text className="mt-md font-sans text-body-md text-ink-secondary">
                      {manga.description}
                    </Text>
                  ) : null}

                  <Text className="mt-lg font-sans-semibold text-title text-ink">Chapter</Text>
                </>
              )}
            </View>
          </View>
        }
        renderItem={({ item }: { item: ChapterRow }) => (
          <Pressable
            disabled={item.isUnavailable}
            onPress={() => navigation.navigate('Reader', { mangaId, chapterId: item.id })}
            className="flex-row items-center justify-between border-b border-hairline px-md py-sm active:bg-surface-soft">
            <Text
              className={`font-sans text-body-md ${item.isUnavailable ? 'text-ink-faint' : 'text-ink'}`}>
              {item.label}
            </Text>
            {item.isUnavailable ? (
              <Text className="font-sans text-body-sm text-ink-faint">Tidak tersedia</Text>
            ) : null}
          </Pressable>
        )}
      />

      <Animated.View
        style={{ opacity: compactBarOpacity }}
        className="absolute left-0 right-0 top-0 border-b border-hairline bg-canvas-elevated">
        <SafeAreaView edges={['top']}>
          <View
            style={{ height: COMPACT_BAR_HEIGHT }}
            className="flex-row items-center justify-center px-[56px]">
            <Text
              className="text-center font-heading text-heading-3 text-ink"
              numberOfLines={1}>
              {manga?.title ?? ''}
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>

      <SafeAreaView edges={['top']} className="absolute left-0 right-0 top-0">
        <View className="flex-row items-center justify-between px-md pt-xs">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface">
            <ArrowLeft color="#211f1c" size={20} />
          </Pressable>
          <Pressable
            onPress={toggleBookmark}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Bookmark
              color="#211f1c"
              size={20}
              fill={isBookmarked ? '#ffd02f' : 'none'}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
