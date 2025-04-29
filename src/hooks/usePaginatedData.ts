// src/hooks/usePaginatedData.ts
import { useState, useCallback, useEffect } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PaginatedResponse, QueryParams } from '@/types';

/**
 * Hook for handling paginated data with caching and infinite loading
 * 
 * @param queryKey Unique key for caching the query
 * @param fetchFunction Function to fetch data for a specific page
 * @param options Additional query options
 */
export function usePaginatedData<T>(
    queryKey: unknown[],
    fetchFunction: (params: QueryParams) => Promise<PaginatedResponse<T>>,
    initialParams: QueryParams = { page: 1, pageSize: 10 },
    options?: Omit<UseQueryOptions<PaginatedResponse<T>, Error, PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
) {
    // Pagination state
    const [params, setParams] = useState<QueryParams>(initialParams);
    const [allItems, setAllItems] = useState<T[]>([]);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Query for current page
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery<PaginatedResponse<T>, Error>({
        queryKey: [...queryKey, params],
        queryFn: () => fetchFunction(params),
        keepPreviousData: true,
        ...options,
    });

    // Update the accumulated items when data changes
    useEffect(() => {
        if (data) {
            if (params.page === 1) {
                // Reset the list for first page or when filters change
                setAllItems(data.data);
            } else {
                // Append new items for subsequent pages
                setAllItems(prev => [...prev, ...data.data]);
            }

            // Check if there are more pages
            setHasNextPage(data.page < data.totalPages);
        }
    }, [data, params.page]);

    // Go to a specific page
    const goToPage = useCallback((page: number) => {
        setParams(prev => ({ ...prev, page }));
    }, []);

    // Change page size
    const setPageSize = useCallback((pageSize: number) => {
        setParams(prev => ({ ...prev, page: 1, pageSize }));
    }, []);

    // Update search or filter terms
    const setFilters = useCallback((filters: Partial<QueryParams>) => {
        setParams(prev => ({ ...prev, page: 1, ...filters }));
    }, []);

    // Load next page (for infinite scrolling)
    const loadNextPage = useCallback(async () => {
        if (!hasNextPage || isLoadingMore || isFetching) return;

        setIsLoadingMore(true);

        try {
            const nextPage = params.page + 1;
            await goToPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasNextPage, isLoadingMore, isFetching, params.page, goToPage]);

    // Reset to first page with current filters
    const reset = useCallback(() => {
        setParams(prev => ({ ...prev, page: 1 }));
    }, []);

    return {
        // Current page data
        data,
        // All accumulated items (for infinite scrolling)
        items: allItems,
        // Loading states
        isLoading,
        isFetching,
        isLoadingMore,
        // Error states
        isError,
        error,
        // Pagination info
        page: params.page,
        pageSize: params.pageSize,
        totalPages: data?.totalPages || 0,
        totalItems: data?.total || 0,
        hasNextPage,
        // Actions
        goToPage,
        setPageSize,
        setFilters,
        loadNextPage,
        refetch,
        reset,
        // Current params
        params,
    };
}

/**
 * Hook for infinite scrolling on a container element
 * 
 * @param loadMore Function to load more items
 * @param options Configuration options
 */
export function useInfiniteScroll(
    loadMore: () => void,
    options: {
        enabled?: boolean;
        threshold?: number;
        containerRef?: React.RefObject<HTMLElement>;
    } = {}
) {
    const {
        enabled = true,
        threshold = 200,
        containerRef
    } = options;

    useEffect(() => {
        if (!enabled) return;

        const handleScroll = () => {
            if (!containerRef?.current) {
                // If no container specified, use window scroll
                const scrollHeight = document.documentElement.scrollHeight;
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                const clientHeight = window.innerHeight;

                if (scrollHeight - scrollTop - clientHeight < threshold) {
                    loadMore();
                }
            } else {
                // Use container scroll
                const { scrollHeight, scrollTop, clientHeight } = containerRef.current;

                if (scrollHeight - scrollTop - clientHeight < threshold) {
                    loadMore();
                }
            }
        };

        // Attach scroll listener
        const scrollContainer = containerRef?.current || window;
        scrollContainer.addEventListener('scroll', handleScroll);

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
        };
    }, [loadMore, enabled, threshold, containerRef]);
}