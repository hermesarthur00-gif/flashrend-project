import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "btn-fill inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent font-semibold transition-[border-color,color,transform,opacity] duration-300 ease-[var(--ease-out)] active:scale-[.97] disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-flash text-on-flash [--fill:var(--ink)] hover:text-flash focus-visible:text-flash",
        dark: "bg-ink text-ink-inverse [--fill:var(--flash)] hover:text-on-flash focus-visible:text-on-flash",
        band: "bg-band text-on-band [--fill:var(--flash)] hover:text-on-flash focus-visible:text-on-flash",
        secondary: "bg-surface-raised text-ink border-line-strong [--fill:var(--flash-soft)] hover:border-ink",
        ghost: "bg-transparent text-current [--fill:color-mix(in_srgb,var(--ink)_8%,transparent)]",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-13 px-6 text-base",
      },
      block: { true: "flex w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, block, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function ButtonLink({ className, variant, size, block, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
