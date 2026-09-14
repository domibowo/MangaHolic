import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
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
        <Button
          label="Buka MangaDetail (test nav)"
          onPress={() => navigation.navigate('MangaDetail', { mangaId: DUMMY_MANGA_ID })}
          className="mt-lg"
        />
      </View>
    </SafeAreaView>
  );
}
