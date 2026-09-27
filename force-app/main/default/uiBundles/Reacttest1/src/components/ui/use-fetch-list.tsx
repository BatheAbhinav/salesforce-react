import * as React from 'react';

export type UseFetchListResult<T> = {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Fetches a JSON array from `url` on mount (and whenever `url` changes).
 * Point this at whatever your internal app's API layer exposes for
 * Accounts / Contacts, e.g. `/api/accounts` or an Apex-backed REST
 * resource — swap the fetch call for your org's data client if you have
 * one (e.g. a generated SDK) instead of raw `fetch`.
 */
function useFetchList<T>(url: string): UseFetchListResult<T> {
  const [data, setData] = React.useState<T[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(url, { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((json: T[]) => {
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, reloadToken]);

  const refetch = React.useCallback(() => setReloadToken((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}

export { useFetchList };