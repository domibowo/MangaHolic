import { BookMarked } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import type { RootState } from '../../store';

export default function LibraryScreen() {
  const bookmarkCount = useSelector(
    (state: RootState) => state.library.bookmarkedMangaIds.length,
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="px-md pt-md">
        <Text className="font-heading text-heading-1 text-ink">Library</Text>
      </View>
      <View className="flex-1 items-center justify-center px-lg">
        <BookMarked color="#b3aca0" size={40} />
        <Text className="mt-md font-sans text-body-md text-ink-muted">
          {bookmarkCount > 0
            ? `${bookmarkCount} manga di-bookmark (list UI di Milestone 9)`
            : 'Belum ada manga yang di-bookmark'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
