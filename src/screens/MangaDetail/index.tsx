import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import type { DetailStackScreenProps } from '../../navigation/types';

const DUMMY_CHAPTER_ID = '3ca35a77-212b-4f8c-a4a1-67562dfa047c';

export default function MangaDetailScreen({
  navigation,
  route,
}: DetailStackScreenProps<'MangaDetail'>) {
  const { mangaId } = route.params;

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="absolute left-0 top-0 z-10">
        <Pressable
          onPress={() => navigation.goBack()}
          className="ml-md mt-xs h-10 w-10 items-center justify-center rounded-full bg-surface">
          <ArrowLeft color="#211f1c" size={20} />
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerClassName="pt-section">
        <View className="h-64 bg-surface-soft items-center justify-center">
          <Text className="font-sans text-body-sm text-ink-faint">
            Hero cover collapsible (Milestone 7)
          </Text>
        </View>

        <View className="px-md pt-md">
          <View className="flex-row items-center gap-xs">
            <Text className="font-heading text-heading-1 text-ink">MangaDetail</Text>
            <Badge label="Ongoing" variant="ongoing" />
          </View>
          <Text className="mt-xs font-sans text-body-sm text-ink-muted">mangaId: {mangaId}</Text>

          <View className="mt-sm flex-row gap-xs">
            <Chip label="Action" tone="coral" />
            <Chip label="Fantasy" tone="sky" />
          </View>

          <Button
            label="Buka Reader (test nav)"
            onPress={() => navigation.navigate('Reader', { mangaId, chapterId: DUMMY_CHAPTER_ID })}
            className="mt-lg self-start"
          />
        </View>
      </ScrollView>
    </View>
  );
}
