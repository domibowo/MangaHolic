import { Pressable, Text, View } from 'react-native';

export type ChipTone = 'teal' | 'coral' | 'rose' | 'sky';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  /** Chip terpilih (mis. filter genre aktif) — override tone jadi aksen kuning, lihat DESIGN.md prinsip "kanvas tenang, aksen yang bicara". */
  selected?: boolean;
  onPress?: () => void;
}

// Lihat DESIGN.md `components.chip-genre` — palet pastel ala Miro sticky-note.
const TONE_STYLE: Record<ChipTone, { container: string; text: string }> = {
  teal: { container: 'bg-teal-soft', text: 'text-accent-teal' },
  coral: { container: 'bg-coral-soft', text: 'text-accent-coral' },
  rose: { container: 'bg-rose-soft', text: 'text-accent-rose' },
  sky: { container: 'bg-sky-soft', text: 'text-accent-sky' },
};

export default function Chip({ label, tone = 'teal', selected = false, onPress }: ChipProps) {
  const containerClassName = selected
    ? 'rounded-full bg-brand-yellow px-[10px] py-[4px]'
    : `rounded-full px-[10px] py-[4px] ${TONE_STYLE[tone].container}`;
  const textClassName = selected
    ? 'font-sans-medium text-caption text-ink-on-yellow'
    : `font-sans-medium text-caption ${TONE_STYLE[tone].text}`;

  if (!onPress) {
    return (
      <View className={containerClassName}>
        <Text className={textClassName}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress} className={`active:opacity-70 ${containerClassName}`}>
      <Text className={textClassName}>{label}</Text>
    </Pressable>
  );
}
