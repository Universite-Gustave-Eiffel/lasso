import axios, { AxiosError } from "axios";

export function parseError(error: unknown): string {
  let message = `${error}`;
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError;
    if (e.response && e.response.data && e.response.data.message) {
      if (e.response.data.message === "Validation Failed") {
        message = `Validation failed: ${Object.keys(e.response?.data.details || {})
          .map((key) => e.response?.data.details[key].message)
          .join(", ")}`;
      } else message = e.response.data.message;
    }
  }
  return message;
}
