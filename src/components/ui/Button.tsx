import Link from 'next/link';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group inline-flex items-center justify-center gap-2 rounded-md font-sans font-medium ' +
  'transition-[transform,background-color,color,border-color,box-shadow] duration-300 ' +
  'ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ' +
  'hover:-translate-y-0.5 active:translate-y-0 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-espresso text-cream shadow-soft hover:shadow-lift',
  outline: 'border border-border bg-transparent text-foreground hover:bg-sand-50',
  ghost: 'bg-transparent text-foreground hover:bg-sand-50',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Bouton générique premium. Rendu en `<Link>` Next si `href` est fourni,
 * sinon en `<button>`. Micro-interaction (léger lift) purement CSS, donc
 * server-component compatible et neutralisée par `prefers-reduced-motion`.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if ('href' in rest && rest.href) {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
