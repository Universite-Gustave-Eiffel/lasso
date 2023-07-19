import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { parseTemplate } from "url-template";

import { APIResult } from "./useHttpGet";

/**
 * API hook for GET
 */
export function useLazyHttpGet<
  P extends Record<string, string | number | boolean>,
  Q extends Record<string, string | number | boolean | string[]>,
  R,
>(variables: {
  path?: string;
  pathParams?: P;
}): APIResult<R> & { fetch: (variables: { pathParams?: P; queryParams?: Q }) => Promise<R> } {
  // return state
  const [data, setData] = useState<R | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [path] = useState(parseTemplate(`${variables.path}`));
  const [pathParams] = useState(variables.pathParams);

  const fetch = useCallback(
    async (variables: { pathParams?: P; queryParams?: Q }) => {
      setData(null);
      setLoading(true);
      setError(null);
      try {
        const response = await axios({
          url: path.expand(variables?.pathParams || pathParams || {}),
          method: "GET",
          params: variables.queryParams,
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
    [path, pathParams],
  );

  return { loading, error, data, fetch };
}
