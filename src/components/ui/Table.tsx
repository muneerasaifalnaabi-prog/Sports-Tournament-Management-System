import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-sm ${className}`.trim()} {...props} />
    </div>
  );
}

export function Thead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="sticky top-0 bg-white" {...props} />;
}

export function Th({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`border-b border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted ${className}`.trim()}
      {...props}
    />
  );
}

export function Tr({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`odd:bg-white even:bg-slate-50/60 hover:bg-brand-light/40 ${className}`.trim()} {...props} />;
}

export function Td({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`border-b border-border px-4 py-2.5 text-foreground ${className}`.trim()} {...props} />;
}
