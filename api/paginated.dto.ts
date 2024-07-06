export interface PaginatedDto<T> {
    data: T[];
    page: number;
    nextPage: number;
    hasNextPage: boolean;
}