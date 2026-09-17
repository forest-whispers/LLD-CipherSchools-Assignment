import React from "react";

export interface Option {
  label: string;
  value: string;
}

export interface CustomSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
}

export function CustomSelect({
  label,
  options,
  error,
  helperText,
  id,
  className = "",
  disabled,
  ...props
}: CustomSelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-zinc-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        disabled={disabled}
        className={`w-full bg-zinc-900 text-zinc-100 text-sm rounded border px-3 py-2 transition-colors focus:outline-none focus:ring-1 ${
          error
            ? "border-red-600/80 focus:border-red-500 focus:ring-red-500"
            : "border-zinc-800 focus:border-zinc-500 focus:ring-zinc-500"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-zinc-900 text-zinc-100"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
      )}
    </div>
  );
}
