import { Search as SearchIcon } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import type { SearchStackScreenProps } from '../../navigation/types';

const DUMMY_MANGA_ID = 'a1c7c817-4e59-43b7-9365-09675a149a6f';

export default function SearchScreen({ navigation }: SearchStackScreenProps<'Search'>) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-row items-center gap-xs rounded-md bg-surface-soft px-md mx-md mt-md h-11">
        <SearchIcon color="#847d72" size={18} />
        <TextInput
          placeholder="Cari judul manga..."
          placeholderTextColor="#b3aca0"
          className="flex-1 font-sans text-body-md text-ink"
          autoFocus
        />
      </View>
      <View className="flex-1 items-center justify-center px-lg">
        <Text className="font-sans text-body-md text-ink-muted">
          Hasil pencarian muncul di sini (Milestone 6)
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
