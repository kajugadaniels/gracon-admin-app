// useApi — wraps API calls with loading, error, and success state.
// Identical pattern to the user app's hook — consistent DX across both projects.
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showErrorToast?: boolean;
    successMessage?: string;
}

interface UseApiReturn<TArgs extends unknown[], TReturn> {
    execute: (...args: TArgs) => Promise<TReturn | undefined>;
    loading: boolean;
    error: string | null;
    reset: () => void;
}

export function useApi<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<{ data: TReturn }>,
    options: UseApiOptions<TReturn> = {},
): UseApiReturn<TArgs, TReturn> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        onSuccess,
        onError,
        showErrorToast = true,
        successMessage,
    } = options;

    const execute = useCallback(
        async (...args: TArgs): Promise<TReturn | undefined> => {
            setLoading(true);
            setError(null);

            try {
                const response = await fn(...args);
                const data = response.data;

                if (successMessage) {
                    toast.success(successMessage);
                }

                onSuccess?.(data);
                return data;
            } catch (err) {
                const axiosError = err as AxiosError<{ message: string }>;
                const message =
                    axiosError.response?.data?.message ??
                    axiosError.message ??
                    'Something went wrong.';

                setError(message);

                if (showErrorToast) {
                    toast.error(message);
                }

                onError?.(message);
                return undefined;
            } finally {
                setLoading(false);
            }
        },
        [fn, onSuccess, onError, showErrorToast, successMessage],
    );

    const reset = useCallback(() => {
        setError(null);
    }, []);

    return { execute, loading, error, reset };
}