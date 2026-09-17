import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  badge?: "Required" | "Optional";
}

export function Textarea({
  label,
  error,
  helperText,
  badge,
  id,
  className = "",
  disabled,
  rows = 5,
  ...props
}: TextareaProps) {
  const textareaId =
    id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium text-zinc-300"
          >
            {label}
          </label>
          {badge && (
            <span
              className={`text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded border ${
                badge === "Required"
                  ? "text-zinc-300 border-zinc-700 bg-zinc-800/60"
                  : "text-zinc-500 border-zinc-800 bg-zinc-900/40"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
      <textarea
        id={textareaId}
        disabled={disabled}
        rows={rows}
        className={`w-full bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-sm rounded border px-3 py-2.5 transition-colors focus:outline-none focus:ring-1 font-mono leading-relaxed ${
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
