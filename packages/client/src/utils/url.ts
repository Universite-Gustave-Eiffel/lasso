export function makeUrl(...args: Array<string>): string {
  const urls = args.flatMap((e) => e.split("/")).filter((e) => e !== ".");
  return `${process.env.PUBLIC_URL}/${urls.join("/")}`;
}
