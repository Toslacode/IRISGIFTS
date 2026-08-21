import type { ReactElement, SVGProps } from 'react';

/* ==========================================================================
   Line icons, drawn to one grid: 24×24, 1.5 stroke, round caps.
   SVG only — never emoji, which render inconsistently and carry no label.
   ========================================================================== */

export type IconName =
  | 'woman'
  | 'man'
  | 'couple'
  | 'bride'
  | 'groom'
  | 'baby'
  | 'family'
  | 'sparkle'
  | 'cake'
  | 'rings'
  | 'heart'
  | 'henna'
  | 'candle'
  | 'gift'
  | 'thanks'
  | 'calendar'
  | 'towel'
  | 'robe'
  | 'cream'
  | 'chocolate'
  | 'wine'
  | 'cup'
  | 'scroll'
  | 'tag'
  | 'check'
  | 'close'
  | 'arrow-right'
  | 'arrow-left'
  | 'plus'
  | 'minus'
  | 'swap'
  | 'trash'
  | 'edit'
  | 'whatsapp'
  | 'truck'
  | 'store'
  | 'phone'
  | 'basket'
  | 'search';

const paths: Record<IconName, ReactElement> = {
  woman: (
    <>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M12 10.2v4.4M9 21l3-6.4 3 6.4M8.4 14.6h7.2" />
    </>
  ),
  man: (
    <>
      <circle cx="12" cy="6.8" r="3.1" />
      <path d="M12 9.9v6.3M8.6 21v-4.8h6.8V21M9 13h6" />
    </>
  ),
  couple: (
    <>
      <circle cx="8" cy="7" r="2.6" />
      <circle cx="16" cy="7" r="2.6" />
      <path d="M4.5 20v-3.4a3.5 3.5 0 0 1 7 0V20M12.5 20v-3.4a3.5 3.5 0 0 1 7 0V20" />
    </>
  ),
  bride: (
    <>
      <circle cx="12" cy="9.4" r="3.2" />
      <path d="M6.6 7.4C7.6 4.6 9.6 3 12 3s4.4 1.6 5.4 4.4" />
      <path d="M7 21c.6-3.4 2.4-5.4 5-5.4s4.4 2 5 5.4" />
    </>
  ),
  groom: (
    <>
      <circle cx="12" cy="6.6" r="3" />
      <path d="M12 9.6 9.4 12l2.6 2.2L14.6 12 12 9.6Z" />
      <path d="M7 21v-4.6a3 3 0 0 1 2-2.8M17 21v-4.6a3 3 0 0 0-2-2.8" />
    </>
  ),
  baby: (
    <>
      <circle cx="12" cy="11" r="6.4" />
      <path d="M9.6 10.4h.01M14.4 10.4h.01M9.8 13.6c1.4 1.1 3 1.1 4.4 0" />
      <path d="M12 4.6V3" />
    </>
  ),
  family: (
    <>
      <circle cx="7" cy="7.4" r="2.4" />
      <circle cx="17" cy="7.4" r="2.4" />
      <circle cx="12" cy="12.6" r="1.9" />
      <path d="M3.6 20v-3a3.4 3.4 0 0 1 6.8 0M13.6 20v-3a3.4 3.4 0 0 1 6.8 0M9.4 20v-1.8a2.6 2.6 0 0 1 5.2 0V20" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.6 9l5.5 1.6-5.5 1.6L12 17.7l-1.6-5.5L4.9 10.6 10.4 9 12 3.5Z" />
      <path d="M18.6 16.4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </>
  ),
  cake: (
    <>
      <path d="M4.4 20v-5.2c0-1 .8-1.8 1.8-1.8h11.6c1 0 1.8.8 1.8 1.8V20" />
      <path d="M3.4 20h17.2M4.4 16.6c1.6 1.2 3.2 1.2 4.8 0s3.2-1.2 4.8 0 3.2 1.2 4.8 0" />
      <path d="M8.6 9.6V7.4M12 9.6V7.4M15.4 9.6V7.4" />
      <path d="M8.6 5.2a1 1 0 1 1-1.4-1.4c.4-.4 1.4-.8 1.4-.8s.4 1 0 1.6ZM15.4 5.2a1 1 0 1 0 1.4-1.4c-.4-.4-1.4-.8-1.4-.8s-.4 1 0 1.6Z" />
    </>
  ),
  rings: (
    <>
      <circle cx="9" cy="14.4" r="4.6" />
      <circle cx="15.6" cy="14.4" r="4.6" />
      <path d="M15.6 8 14 5.2h3.2L15.6 8Z" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.2-4.4-7.2-9.4A4.2 4.2 0 0 1 12 8.2a4.2 4.2 0 0 1 7.2 2.4c0 5-7.2 9.4-7.2 9.4Z" />
  ),
  henna: (
    <>
      <path d="M12 3.4c2.8 2.4 4.4 5 4.4 7.6A4.4 4.4 0 0 1 12 15.4a4.4 4.4 0 0 1-4.4-4.4c0-2.6 1.6-5.2 4.4-7.6Z" />
      <path d="M12 15.4V21M8.6 18.6h6.8" />
    </>
  ),
  candle: (
    <>
      <rect x="8.4" y="9.6" width="7.2" height="11" rx="1.6" />
      <path d="M12 9.6V7.4" />
      <path d="M12 3.2c1.4 1.6 2 2.6 2 3.4a2 2 0 1 1-4 0c0-.8.6-1.8 2-3.4Z" />
    </>
  ),
  gift: (
    <>
      <rect x="3.6" y="9.6" width="16.8" height="11" rx="1.8" />
      <path d="M3 9.6h18M12 9.6V20.6" />
      <path d="M12 9.6S9.8 9 8.6 7.8a2.1 2.1 0 0 1 3-3c1.1 1.1.4 4.8.4 4.8ZM12 9.6s2.2-.6 3.4-1.8a2.1 2.1 0 0 0-3-3c-1.1 1.1-.4 4.8-.4 4.8Z" />
    </>
  ),
  thanks: (
    <>
      <path d="M20.4 12.4c0 3.9-3.8 7-8.4 7-1 0-2-.2-2.9-.5L4 20.4l1.6-4.2a6.4 6.4 0 0 1-1.9-4.4c0-3.9 3.8-7 8.4-7s8.3 3.1 8.3 7Z" />
      <path d="M9.4 11.6h.01M12 11.6h.01M14.6 11.6h.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.6" y="5.4" width="16.8" height="15" rx="2" />
      <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6" />
    </>
  ),
  towel: (
    <>
      <rect x="4.4" y="4.4" width="15.2" height="15.2" rx="2.4" />
      <path d="M8.6 4.4v15.2M12 8.2h5.4M12 12h5.4M12 15.8h5.4" />
    </>
  ),
  robe: (
    <>
      <path d="M8.6 3.4 12 6.6l3.4-3.2 3.4 2.2-1.6 4 .8 11H6l.8-11-1.6-4 3.4-2.2Z" />
      <path d="M12 6.6v8.4M6.4 15.6h11.2" />
    </>
  ),
  cream: (
    <>
      <rect x="6" y="8.6" width="12" height="12" rx="2.4" />
      <path d="M9.4 8.6V6.4a2.6 2.6 0 0 1 5.2 0v2.2M6.4 12.4h11.2" />
    </>
  ),
  chocolate: (
    <>
      <rect x="4.6" y="4.6" width="14.8" height="14.8" rx="1.8" />
      <path d="M4.6 9.6h14.8M4.6 14.4h14.8M9.6 4.6v14.8M14.4 4.6v14.8" />
    </>
  ),
  wine: (
    <>
      <path d="M8 3.4h8v5.2a4 4 0 0 1-8 0V3.4Z" />
      <path d="M8 7.6h8M12 12.6v6M9 20.6h6" />
    </>
  ),
  cup: (
    <>
      <path d="M5 7.4h11v6.2a5.5 5.5 0 0 1-11 0V7.4Z" />
      <path d="M16 9h1.8a2.4 2.4 0 0 1 0 4.8H16M3.6 20.6h14" />
    </>
  ),
  scroll: (
    <>
      <path d="M6.4 3.6h11.2v13.8a3 3 0 0 1-3 3H6.4a3 3 0 0 1-3-3V6.6a3 3 0 0 1 3-3Z" />
      <path d="M17.6 3.6a3 3 0 0 1 3 3v1.8h-3M7.6 8.4h6.4M7.6 12h6.4M7.6 15.6h4" />
    </>
  ),
  tag: (
    <>
      <path d="M11 3.6H4.6a1 1 0 0 0-1 1V11a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l6-6a2 2 0 0 0 0-2.8L13 4.2a2 2 0 0 0-1.4-.6Z" />
      <circle cx="8" cy="8" r="1.3" />
    </>
  ),
  check: <path d="m4.6 12.6 4.8 4.8L19.4 7.2" />,
  close: <path d="M5.6 5.6 18.4 18.4M18.4 5.6 5.6 18.4" />,
  'arrow-right': <path d="M4.6 12h14.8M13 5.6 19.4 12 13 18.4" />,
  'arrow-left': <path d="M19.4 12H4.6M11 5.6 4.6 12 11 18.4" />,
  plus: <path d="M12 4.8v14.4M4.8 12h14.4" />,
  minus: <path d="M4.8 12h14.4" />,
  swap: (
    <path d="M4.4 8.4h13.2m0 0-3.4-3.4m3.4 3.4-3.4 3.4M19.6 15.6H6.4m0 0 3.4-3.4m-3.4 3.4 3.4 3.4" />
  ),
  trash: (
    <>
      <path d="M4.6 6.6h14.8M9.4 6.6V4.8a1.2 1.2 0 0 1 1.2-1.2h2.8a1.2 1.2 0 0 1 1.2 1.2v1.8" />
      <path d="M6.6 6.6 7.4 19a1.6 1.6 0 0 0 1.6 1.4h6a1.6 1.6 0 0 0 1.6-1.4l.8-12.4M10.4 10.4v6M13.6 10.4v6" />
    </>
  ),
  edit: (
    <path d="M4.6 19.4h3.2L18.2 9a2.3 2.3 0 0 0-3.2-3.2L4.6 16.2v3.2ZM13.6 7.2l3.2 3.2" />
  ),
  whatsapp: (
    <>
      <path d="M20.4 11.7c0 4.6-3.8 8.3-8.4 8.3-1.5 0-2.9-.4-4.1-1.1L3.6 20.4l1.6-4.2A8.1 8.1 0 0 1 3.6 11.7c0-4.6 3.8-8.3 8.4-8.3s8.4 3.7 8.4 8.3Z" />
      <path d="M9 8.6c.3-.1.7 0 .9.4l.7 1.3c.2.3.1.7-.1.9l-.5.5c.5 1 1.3 1.8 2.3 2.3l.5-.5c.2-.2.6-.3.9-.1l1.3.7c.4.2.5.6.4.9-.3.8-1.1 1.3-1.9 1.2-2.9-.3-5.1-2.5-5.4-5.4-.1-.8.3-1.6 1.1-1.9Z" />
    </>
  ),
  truck: (
    <>
      <path d="M3.6 6.6h10v10h-10zM13.6 10h3.4l2.8 3v3.6h-6.2" />
      <circle cx="7.2" cy="18" r="1.8" />
      <circle cx="16.4" cy="18" r="1.8" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.6V20h16V9.6M3 9.6 5.2 4.4h13.6L21 9.6a2.4 2.4 0 0 1-4.5 1.2 2.4 2.4 0 0 1-4.5 0 2.4 2.4 0 0 1-4.5 0A2.4 2.4 0 0 1 3 9.6Z" />
      <path d="M9.8 20v-5.2h4.4V20" />
    </>
  ),
  phone: (
    <path d="M8.2 4.2 5.6 4a1.6 1.6 0 0 0-1.7 1.3c-.6 3.6 1 7.3 3.6 9.9 2.6 2.6 6.3 4.2 9.9 3.6a1.6 1.6 0 0 0 1.3-1.7l-.2-2.6a1.4 1.4 0 0 0-1-1.2l-2.4-.7a1.4 1.4 0 0 0-1.4.4l-1 1a11 11 0 0 1-4.2-4.2l1-1a1.4 1.4 0 0 0 .4-1.4l-.7-2.4a1.4 1.4 0 0 0-1-1Z" />
  ),
  basket: (
    <>
      <path d="M3.4 8.6h17.2l-1.5 10a2 2 0 0 1-2 1.7H6.9a2 2 0 0 1-2-1.7l-1.5-10Z" />
      <path d="M8.2 8.6 10.4 3.6M15.8 8.6 13.6 3.6M9.4 12.4v4.2M14.6 12.4v4.2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.6 15.6 4.2 4.2" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  /** Give a label when the icon is the only content of a control. */
  label?: string;
}

export function Icon({ name, size = 24, label, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
