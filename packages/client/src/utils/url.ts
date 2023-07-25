import { isNil } from "lodash";

export function makeUrl(...args: Array<string>): string {
  const urls = args.flatMap((e) => e.split("/")).filter((e) => e !== ".");
  return `${process.env.PUBLIC_URL}/${urls.join("/")}`;
}

/**
 * Compute the new Url search parameter
 */
export function updateQueryParam(
  setParams: (p: URLSearchParams, o?: { replace?: boolean }) => void,
  params: URLSearchParams,
  name: string,
  value: unknown | null,
  replace?: boolean,
): void {
  let hasChange = false;
  const searchParams = new URLSearchParams(params);

  if (value && searchParams.get(name) !== value) {
    searchParams.set(name, `${value}`);
    hasChange = true;
  }
  if (isNil(value) && searchParams.has(name)) {
    searchParams.delete(name);
    hasChange = true;
  }
  if (hasChange) {
    setParams(searchParams, { replace: isNil(replace) ? false : replace });
  }
}
