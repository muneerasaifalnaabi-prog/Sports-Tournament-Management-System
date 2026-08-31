import { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`input ${className}`.trim()} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", children, ...props }, ref) {
    return (
      <select ref={ref} className={`input ${className}`.trim()} {...props}>
        {children}
      </select>
    );
  },
);

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="label" {...props} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}
