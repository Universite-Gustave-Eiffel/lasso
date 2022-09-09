import { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { parseTemplate } from "url-template";

export interface APIResult<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

/**
 * API hook for GET
 */
export function useHttpGet<
  P extends Record<string, string | number | boolean | null>,
  Q extends Record<string, string | number | boolean | null>,
  R
>(variables: {
  path: string;
  pathParams: P;
  queryParams: Q;
}): APIResult<R> & { fetch: (variables?: { pathParams?: P; queryParams?: Q }) => Promise<R> } {
  // return state
  const [data, setData] = useState<R | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AxiosError | null>(null);

  const [path] = useState(parseTemplate(variables.path));
  const [pathParams] = useState(variables.pathParams);
  const [queryParams] = useState(variables.queryParams);

  const fetch = useCallback(
    async (variables?: { pathParams?: P; queryParams?: Q }) => {
      setData(null);
      setLoading(true);
      setError(null);
      try {
        const response = await axios({
          url: path.expand(variables?.pathParams || pathParams),
          method: "GET",
          params: variables?.queryParams || queryParams,
          responseType: "json",
        });
        const data = response.data as R;
        setData(data);
        return data;
      } catch (e) {
        setError(e as AxiosError);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [path, pathParams, queryParams],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { loading, error, data, fetch };
}
