import { Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  className?: string;
}

// Lihat DESIGN.md `components.button-primary` / `button-secondary` / `button-ghost`.
const CONTAINER_BY_VARIANT: Record<ButtonVariant, string> = {
  primary: 'rounded-full bg-brand-yellow px-lg py-sm active:bg-brand-yellow-deep',
  secondary:
    'rounded-full border border-hairline-strong px-lg py-sm active:bg-surface-soft',
  ghost: 'px-sm py-xs active:opacity-60',
};

const TEXT_BY_VARIANT: Record<ButtonVariant, string> = {
  primary: 'text-ink-on-yellow',
  secondary: 'text-ink',
  ghost: 'text-ink-secondary',
};

export default function Button({
  label,
  variant = 'primary',
  className,
  disabled,
  ...pressableProps
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      className={[
        'items-center justify-center',
        CONTAINER_BY_VARIANT[variant],
        disabled ? 'opacity-40' : '',
        className ?? '',
      ].join(' ')}
      {...pressableProps}>
      <Text className={`font-sans-semibold text-button ${TEXT_BY_VARIANT[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
