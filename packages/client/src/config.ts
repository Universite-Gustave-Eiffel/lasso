export const config = {
  data_path: `${process.env.PUBLIC_URL}/data`,
  debounceTime: 200,
  notificationTimeoutMs: 3000,
  nbHiglightedProject: 3,
  defaultLocale: "en",
  transifexToken: process.env.TRANSIFEX_TOKEN || "1/78dd771fa7b374eeeae5827e6a2e44694dd1f925",
};
