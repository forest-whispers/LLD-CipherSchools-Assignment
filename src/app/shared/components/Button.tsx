import React from "react";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed rounded";

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variantStyles = {
    primary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-transparent",
    secondary: "bg-zinc-900 text-zinc-200 border border-zinc-700 hover:bg-zinc-800",
    danger: "bg-red-950/60 text-red-300 border border-red-800 hover:bg-red-900/80",
    ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <Spinner
          size="sm"
          className={`mr-2 ${variant === "primary" ? "border-zinc-400 border-t-zinc-900" : ""}`}
        />
      )}
      {children}
    </button>
  );
}
