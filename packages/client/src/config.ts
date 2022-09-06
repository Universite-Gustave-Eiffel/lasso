export const config = {
  data_path: `${process.env.PUBLIC_URL}/data`,
  debounceTime: 200,
  notificationTimeoutMs: 3000,
  nbHiglightedProject: 5,
  defaultLocale: "en",
  transifexToken: process.env.TRANSIFEX_TOKEN || "1/64b3147b4103c1a091faad1deaa05a23ac2cd32a",
  //
};
