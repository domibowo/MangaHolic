import { ArrowLeft, GalleryHorizontal, GalleryVertical } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import type { ListViewToken } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useGetAtHomeServerQuery, useGetMangaFeedQuery } from '../../api/mangadexApi';
import Button from '../../components/Button';
import type { DetailStackScreenProps } from '../../navigation/types';

type ReaderMode = 'paged' | 'scroll';

export default function ReaderScreen({ navigation, route }: DetailStackScreenProps<'Reader'>) {
  const { mangaId, chapterId } = route.params;
  const { width, height } = useWindowDimensions();

  const [chromeVisible, setChromeVisible] = useState(true);
  const [mode, setMode] = useState<ReaderMode>('paged');
  const [currentPage, setCurrentPage] = useState(0);

  // Chapter bisa di-simulpub resmi (mis. MangaPlus) — datanya tidak
  // di-host MangaDex, jadi harus dibuka via link eksternal, bukan
  // di-fetch lewat /at-home/server (akan 404). Ditemukan saat smoke test
  // Milestone 2 — lihat AGENTS.md § api/ & TODO.md Milestone 2.
  const { data: feed, isLoading: isFeedLoading } = useGetMangaFeedQuery({ mangaId });
  const chapterMeta = useMemo(
    () => feed?.find((chapter) => chapter.id === chapterId),
    [feed, chapterId],
  );
  const externalUrl = chapterMeta?.externalUrl ?? null;
  // Situs pembaca resmi (tappytoon, webnovel, dst.) kadang menyisipkan skrip
  // iklan yang mem-force-redirect browser mobile ke situs spam pihak ketiga
  // (dikonfirmasi terjadi juga di Chrome biasa, bukan cuma WebView kita —
  // lihat TODO.md). Kita batasi navigasi WebView tetap di domain externalUrl
  // supaya redirect semacam itu diblokir daripada dituruti.
  const externalBaseDomain = useMemo(() => {
    if (!externalUrl) return null;
    try {
      const labels = new URL(externalUrl).hostname.split('.');
      return labels.slice(-2).join('.');
    } catch {
      return null;
    }
  }, [externalUrl]);

  const {
    data: pages,
    isLoading: isPagesLoading,
    isError: isPagesError,
  } = useGetAtHomeServerQuery(chapterId, { skip: isFeedLoading || Boolean(externalUrl) });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const firstVisible = viewableItems[0]?.index;
    if (firstVisible != null) {
      setCurrentPage(firstVisible);
    }
  }).current;

  if (isFeedLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#f7f5f2" />
      </View>
    );
  }

  if (externalUrl) {
    // Chapter di-simulpub resmi — tidak ada halaman untuk dirender native,
    // tapi tetap dibuka di dalam app lewat WebView (bukan Linking.openURL
    // yang lempar ke Chrome) supaya user tidak keluar dari Mangaholic.
    return (
      <View className="flex-1 bg-black">
        <SafeAreaView edges={['top']} className="flex-row items-center px-md py-xs">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/60">
            <ArrowLeft color="#f7f5f2" size={20} />
          </Pressable>
        </SafeAreaView>
        <WebView
          source={{ uri: externalUrl }}
          className="flex-1"
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(request) => {
            if (!externalBaseDomain) return true;
            try {
              return new URL(request.url).hostname.endsWith(externalBaseDomain);
            } catch {
              return false;
            }
          }}
        />
      </View>
    );
  }

  if (isPagesLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#f7f5f2" />
      </View>
    );
  }

  if (isPagesError || !pages || pages.pageUrls.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-lg">
        <Text className="text-center font-sans text-body-md text-on-dark">
          Gagal memuat halaman chapter.
        </Text>
        <Button
          label="Kembali"
          variant="ghost"
          onPress={() => navigation.goBack()}
          className="mt-sm"
        />
      </View>
    );
  }

  const pageUrls = pages.pageUrls;

  // `Pressable` untuk toggle chrome SENGAJA ditaruh di dalam `renderItem`
  // (anak dari FlatList), BUKAN membungkus seluruh FlatList. Membungkus
  // FlatList di dalam Pressable menyebabkan Pressable induk merebut
  // responder sentuh sebelum FlatList sempat mendeteksi gestur horizontal
  // swipe/pagingEnabled — bug ini ditemukan lewat laporan user (paging
  // sama sekali tidak jalan di iOS maupun Android walau page indicator
  // benar). Pola item-level Pressable ini standar & sudah teruji luas:
  // ScrollView sebagai ancestor Touchable anaknya, bukan sebaliknya.
  const toggleChrome = () => setChromeVisible((visible) => !visible);

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden={!chromeVisible} />

      {mode === 'paged' ? (
        <FlatList
          data={pageUrls}
          keyExtractor={(url, index) => `${index}-${url}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => (
            <Pressable onPress={toggleChrome} style={{ width, height }}>
              <Image source={{ uri: item }} style={{ width, height }} resizeMode="contain" />
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={pageUrls}
          keyExtractor={(url, index) => `${index}-${url}`}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => (
            <Pressable onPress={toggleChrome}>
              <Image
                source={{ uri: item }}
                style={{ width }}
                className="aspect-[2/3]"
                resizeMode="contain"
              />
            </Pressable>
          )}
        />
      )}

      {chromeVisible ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 top-0 flex-row items-center justify-between px-md pt-xl">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={16}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/60">
            <ArrowLeft color="#f7f5f2" size={20} />
          </Pressable>
          <View className="rounded-full bg-black/60 px-md py-xxs">
            <Text className="font-sans-medium text-caption text-on-dark">
              {currentPage + 1} / {pageUrls.length}
            </Text>
          </View>
          <Pressable
            onPress={() => setMode((current) => (current === 'paged' ? 'scroll' : 'paged'))}
            hitSlop={16}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/60">
            {mode === 'paged' ? (
              <GalleryVertical color="#f7f5f2" size={20} />
            ) : (
              <GalleryHorizontal color="#f7f5f2" size={20} />
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
