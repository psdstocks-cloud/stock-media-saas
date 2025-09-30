"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BrandButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "dark" | "light";
  loading?: boolean;
};

export function BrandButton({
  className,
  children,
  variant = "dark",
  loading: _loading = false,
  ...props
}: BrandButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const styles =
    variant === "dark"
      ? "bg-gradient-to-r from-[var(--brand-purple-hex)] to-[var(--brand-orange-hex)] text-white hover:brightness-110 focus:ring-[var(--brand-purple-hex)]"
      : "bg-white border border-[var(--brand-purple-20)] text-[var(--brand-purple-hex)] hover:bg-[var(--brand-purple-6)] focus:ring-[var(--brand-purple-hex)]";

  return (
    <button className={cn(base, styles, className)} {...props}>
      {children}
    </button>
  );
}


