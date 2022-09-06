import chroma from "chroma-js";

/**
 * Get a random color in hex format.
 */
export function getRandomHexColor(): string {
  return chroma.random().hex();
}
