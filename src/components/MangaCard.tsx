import { Image, Pressable, Text, View } from 'react-native';

import type { MangaListItem } from '../types/manga';

interface MangaCardProps {
  manga: MangaListItem;
  onPress: () => void;
}

const STATUS_LABEL: Record<MangaListItem['status'], string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'Hiatus',
  cancelled: 'Cancelled',
};

// Lihat DESIGN.md `components.manga-card` — cover rasio 2:3, flat, hairline
// border, judul heading-3 + metadata body-sm di bawah cover. Dipakai
// bersama di Browse (Milestone 5) & Search (Milestone 6).
//
// Catatan: DESIGN.md aslinya minta metadata "jumlah chapter", tapi endpoint
// search MangaDex tidak mengembalikan hitungan chapter per manga (butuh
// panggilan /aggregate terpisah per item — terlalu berat untuk grid). Diganti
// status manga sebagai metadata sampai ada kebutuhan/endpoint yang lebih pas.
export default function MangaCard({ manga, onPress }: MangaCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 overflow-hidden rounded-md border border-hairline bg-surface active:opacity-80">
      <View className="aspect-[2/3] w-full bg-surface-soft">
        {manga.coverUrl ? (
          <Image source={{ uri: manga.coverUrl }} className="h-full w-full" resizeMode="cover" />
        ) : null}
      </View>
      <View className="p-xs">
        <Text className="font-heading text-heading-3 text-ink" numberOfLines={2}>
          {manga.title}
        </Text>
        <Text className="mt-[2px] font-sans text-body-sm text-ink-muted">
          {STATUS_LABEL[manga.status]}
        </Text>
      </View>
    </Pressable>
  );
}
