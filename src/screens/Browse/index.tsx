import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BrowseStackScreenProps } from '../../navigation/types';

const DUMMY_MANGA_ID = 'a1c7c817-4e59-43b7-9365-09675a149a6f';

export default function BrowseScreen({ navigation }: BrowseStackScreenProps<'Browse'>) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="px-md pt-md">
        <Text className="font-heading text-heading-1 text-ink">Mangaholic</Text>
      </View>
      <View className="flex-1 items-center justify-center px-lg">
        <Text className="font-sans text-body-md text-ink-muted">
          Browse — grid manga + sticky filter chip (Milestone 5)
        </Text>
        <Pressable
          onPress={() => navigation.navigate('MangaDetail', { mangaId: DUMMY_MANGA_ID })}
          className="mt-lg rounded-full bg-brand-yellow px-lg py-sm active:bg-brand-yellow-deep">
          <Text className="font-sans text-button font-semibold text-ink-on-yellow">
            Buka MangaDetail (test nav)
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
