import * as React from 'react';
import { cn } from '@/utils/cn';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full h-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-paragraph-sm border-separate border-spacing-0', className)} {...props} />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('sticky top-0 z-10 [&_th]:bg-bg-weak-50 [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg', className)} {...props} />
  ),
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child_td]:border-b-0', className)} {...props} />
  ),
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('border-t border-stroke-soft-200 bg-bg-weak-50 font-medium [&>tr]:last:border-b-0', className)} {...props} />
  ),
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('transition-colors duration-100 hover:bg-bg-weak-50 data-[state=selected]:bg-bg-weak-50 group/row', className)}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, style, children, ...props }, ref) => {
    const isActions =
      (typeof children === 'string' && /^actions?$/i.test(children.trim())) ||
      (typeof className === 'string' && /(?:^|\s)(?:actions?|table-actions-sticky)(?:\s|$)/i.test(className));
    return (
      <th
        ref={ref}
        className={cn(
          'h-10 px-3 text-left align-middle whitespace-nowrap bg-bg-weak-50',
          'first:rounded-l-lg last:rounded-r-lg',
          'text-subheading-xs text-text-soft-400 uppercase tracking-wide',
          '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
          isActions
            ? 'sticky right-0 z-20 bg-bg-weak-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] border-l border-stroke-soft-200 w-px whitespace-nowrap'
            : '',
          className,
        )}
        style={isActions ? { width: '1%', whiteSpace: 'nowrap', ...style } : style}
        {...props}
      >
        {children}
      </th>
    );
  },
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isActions?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, style, isActions, ...props }, ref) => {
    const isActionsCell =
      isActions ||
      (typeof className === 'string' && /(?:^|\s)(?:actions?|table-actions-sticky)(?:\s|$)/i.test(className));
    return (
      <td
        ref={ref}
        className={cn(
          'px-3 py-3 align-middle text-text-sub-600 border-b border-stroke-soft-200 bg-bg-white-0 transition-colors duration-100 group-hover/row:bg-bg-weak-50 group-data-[state=selected]/row:bg-bg-weak-50 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
          isActionsCell &&
            'sticky right-0 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] border-l border-stroke-soft-200 w-px whitespace-nowrap',
          className,
        )}
        style={isActionsCell ? { width: '1%', whiteSpace: 'nowrap', ...style } : style}
        {...props}
      />
    );
  },
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-paragraph-sm text-text-soft-400', className)} {...props} />
  ),
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
