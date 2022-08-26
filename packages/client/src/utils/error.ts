export function parseError(error: unknown): string {
  let message = `${error}`;
  if (error instanceof Error) {
    const e = error as Error;
    message = e.message;
  }
  return message;
}
