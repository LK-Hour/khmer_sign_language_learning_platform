'use client';

import type { SvgIconProps } from '@mui/material/SvgIcon';
import SvgIcon from '@mui/material/SvgIcon';
import { getIcon, type IconKey } from '@/lib/icons';

type TranslatedIconProps = {
  iconKey: IconKey;
  label?: string;
  size?: 'small' | 'medium' | 'large' | 'inherit';
  color?: SvgIconProps['color'];
  className?: string;
};

/**
 * Renders an MUI icon by icon key
 * Used throughout the app to replace emojis with proper Material Design icons
 */
export function TranslatedIcon({
  iconKey,
  label,
  size = 'medium',
  color = 'inherit',
  className,
}: TranslatedIconProps): JSX.Element {
  const IconComponent = getIcon(iconKey);

  return (
    <SvgIcon
      component={IconComponent}
      fontSize={size}
      color={color}
      className={className}
      aria-label={label}
    />
  );
}

/**
 * Renders an icon with text label
 * Typically used for dashboard stats: "🔥 5-day streak" → Icon + "5-day streak"
 */
type IconWithLabelProps = TranslatedIconProps & {
  text: string;
  direction?: 'row' | 'column';
};

export function IconWithLabel({
  iconKey,
  text,
  label,
  size = 'small',
  color = 'inherit',
  direction = 'row',
  className,
}: IconWithLabelProps): JSX.Element {
  const IconComponent = getIcon(iconKey);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: direction === 'row' ? '0.5rem' : '0.25rem',
        flexDirection: direction,
      }}
      className={className}
    >
      <SvgIcon
        component={IconComponent}
        fontSize={size}
        color={color}
        aria-label={label}
      />
      <span>{text}</span>
    </div>
  );
}

/**
 * Renders a badge/chip style element with icon
 * Used for streak counter, XP display, etc.
 */
type IconBadgeProps = Omit<IconWithLabelProps, 'direction'> & {
  variant?: 'filled' | 'outlined';
};

export function IconBadge({
  iconKey,
  text,
  label,
  size = 'small',
  color = 'primary',
  variant = 'filled',
  className,
}: IconBadgeProps): JSX.Element {
  const IconComponent = getIcon(iconKey);
  const backgroundColor =
    variant === 'filled' ? 'rgba(192, 57, 43, 0.1)' : 'transparent';
  const border = variant === 'outlined' ? '1px solid rgba(192, 57, 43, 0.2)' : 'none';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        backgroundColor,
        border,
      }}
      className={className}
    >
      <SvgIcon
        component={IconComponent}
        fontSize={size}
        color={color}
        aria-label={label}
      />
      <span style={{ fontWeight: 500 }}>{text}</span>
    </div>
  );
}
