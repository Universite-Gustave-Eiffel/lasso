import { FC, useEffect, useMemo } from "react";
import { Howl } from "howler";
import { Feature } from "geojson";

import { useCurrentProject } from "../../../hooks/useCurrentProject";

export const SoundFeature: FC<{ feature?: Feature; mapId: string }> = ({ mapId, feature }) => {
  const { project } = useCurrentProject();
  const timeKey = useMemo(() => project.maps[mapId].timeKey, [project, mapId]);
  const muted = useMemo(() => project.maps[mapId].muted, [project.maps, mapId]);

  useEffect(() => {
    // handle sound
    let howler: Howl | null = null;
    if (!muted && feature && feature.properties) {
      const properties = timeKey && feature.properties[timeKey] ? feature.properties[timeKey] : feature.properties;
      const noiseVariable = project.lassoVariables[`acoustic_soundlevel`];

      if (properties.sound) {
        const volume = feature.properties.acoustic_soundlevel
          ? 10 ** (((50 * (feature.properties.acoustic_soundlevel - noiseVariable.minimumValue)) / (noiseVariable.maximumValue - noiseVariable.minimumValue)) - 50) / 20
          : 1;
        howler = new Howl({
          src: [feature.properties.sound],
          autoplay: true,
          loop: true,
          html5: true,
          format: ["mp3"],
          volume,
        });
      }
    }

    return () => {
      if (howler !== null) {
        howler.fade(howler.volume(), 0, 200);
        window.setTimeout(() => {
          if (howler) howler.unload();
        }, 200);
      }
    };
  }, [feature, timeKey, project.lassoVariables, muted]);

  return null;
};
