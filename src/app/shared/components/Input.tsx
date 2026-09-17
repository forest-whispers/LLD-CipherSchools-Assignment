import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  disabled,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-zinc-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        className={`w-full bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-sm rounded border px-3 py-2 transition-colors focus:outline-none focus:ring-1 ${
          error
            ? "border-red-600/80 focus:border-red-500 focus:ring-red-500"
            : "border-zinc-800 focus:border-zinc-500 focus:ring-zinc-500"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
      )}
    </div>
  );
}
