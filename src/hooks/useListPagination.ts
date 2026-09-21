import { useEffect, useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function useListPagination<T>(items: T[], initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [items.length, pageSize]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const paginationProps = {
    page,
    totalPages,
    totalCount,
    rangeStart: totalCount === 0 ? 0 : (page - 1) * pageSize + 1,
    rangeEnd: Math.min(page * pageSize, totalCount),
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize: paginationProps.onPageSizeChange,
    pageItems,
    totalCount,
    totalPages,
    rangeStart: paginationProps.rangeStart,
    rangeEnd: paginationProps.rangeEnd,
    paginationProps,
  };
}
