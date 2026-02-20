export interface PaginationMeta {
  total: number;
  totalPages: number;
  page: number;
  nextPage: number | null;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export const paginationMetaData = (
  pageNum: number,
  pageLimit: number,
  totalCount: number
): PaginationMeta => {

  const totalPages = Math.ceil(totalCount / pageLimit);

  return {
    total: totalCount,
    totalPages,
    page: pageNum,
    nextPage: pageNum < totalPages ? pageNum + 1 : null,
    hasPrevPage: pageNum > 1,
    hasNextPage: pageNum < totalPages,
  };
};
