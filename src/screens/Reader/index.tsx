import { useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StatusBar, Text, View } from 'react-native';

import type { DetailStackScreenProps } from '../../navigation/types';

export default function ReaderScreen({ navigation, route }: DetailStackScreenProps<'Reader'>) {
  const { mangaId, chapterId } = route.params;
  const [chromeVisible, setChromeVisible] = useState(true);

  return (
    <Pressable
      className="flex-1 bg-black"
      onPress={() => setChromeVisible((visible) => !visible)}>
      <StatusBar hidden={!chromeVisible} />
      <View className="flex-1 items-center justify-center">
        <Text className="font-sans text-body-sm text-ink-faint">
          Page-by-page / continuous scroll reader (Milestone 8)
        </Text>
        <Text className="mt-xs font-sans text-body-sm text-ink-faint">
          chapterId: {chapterId}
        </Text>
      </View>

      {chromeVisible ? (
        <View className="absolute inset-x-0 top-0 flex-row items-center justify-between px-md pt-xl">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/60">
            <ArrowLeft color="#f7f5f2" size={20} />
          </Pressable>
          <View className="rounded-full bg-black/60 px-md py-xxs">
            <Text className="font-sans text-caption text-on-dark">
              manga {mangaId.slice(0, 8)}… · 1 / 27
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}
