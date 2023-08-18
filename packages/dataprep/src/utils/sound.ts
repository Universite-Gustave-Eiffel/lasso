import { toNumber, sortBy, head } from "lodash";

import { readCsv } from "./files";
import { config } from "../config";

export type SoundData = Array<{
  filename: string;
  acoustic_birds: number;
  acoustic_trafic: number;
  acoustic_voices: number;
}>;

export async function parseSoundData(): Promise<SoundData> {
  const fileData = await readCsv<{ Name: string; B: number; T: number; V: number; N: number }>(
    `${config.importPath}/sound.csv`,
  );
  const data = fileData.map((row) => ({
    filename: row.Name,
    acoustic_birds: toNumber(row.B),
    acoustic_trafic: toNumber(row.T),
    acoustic_voices: toNumber(row.V),
  }));
  return data;
}

export function getSoundFile(data: SoundData, values: Omit<SoundData[0], "filename">): string | undefined {
  const closest = head(
    sortBy(
      data.map((row) => ({
        row,
        distance: distance(row, values),
      })),
      (i) => i.distance,
    ),
  );

  return closest ? `./sounds/${closest?.row.filename}.mp3` : undefined;
}

function distance(pt1: SoundData[0], pt2: Omit<SoundData[0], "filename">): number {
  return Math.sqrt(
    Math.pow(pt1.acoustic_birds - pt2.acoustic_birds, 2) +
      Math.pow(pt1.acoustic_trafic - pt2.acoustic_trafic, 2) +
      Math.pow(pt1.acoustic_voices - pt2.acoustic_voices, 2),
  );
}
