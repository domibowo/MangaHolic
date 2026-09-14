import { Text, View } from 'react-native';

import type { MangaStatus } from '../types/manga';

export type BadgeVariant = MangaStatus | 'new';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

// Lihat DESIGN.md `components.badge-status-*` / `badge-new`. DESIGN.md
// cuma mendefinisikan ongoing/hiatus/error — completed & cancelled dipetakan
// ke tone netral/error yang paling dekat maknanya (belum ada di DESIGN.md,
// perlu dikonfirmasi kalau ternyata butuh tone sendiri).
const STYLE_BY_VARIANT: Record<BadgeVariant, { container: string; text: string }> = {
  ongoing: { container: 'bg-success-soft', text: 'text-success' },
  completed: { container: 'bg-surface-soft', text: 'text-ink-secondary' },
  hiatus: { container: 'bg-warning-soft', text: 'text-warning' },
  cancelled: { container: 'bg-error-soft', text: 'text-error' },
  new: { container: 'bg-brand-yellow', text: 'text-ink-on-yellow' },
};

export default function Badge({ label, variant }: BadgeProps) {
  const style = STYLE_BY_VARIANT[variant];
  const padding = variant === 'new' ? 'px-[6px] py-[2px]' : 'px-[8px] py-[3px]';

  return (
    <View className={`rounded-full ${padding} ${style.container}`}>
      <Text className={`font-sans-medium text-caption ${style.text}`}>{label}</Text>
    </View>
  );
}
