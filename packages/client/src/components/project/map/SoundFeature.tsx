import { FC, useEffect, useMemo } from "react";
import { Howl } from "howler";
import { Feature } from "geojson";

import { useCurrentProject } from "../../../hooks/useCurrentProject";

export const SoundFeature: FC<{ feature?: Feature; mapId: string; currentTimeKey?: string | null }> = ({ 
  mapId, 
  feature, 
  currentTimeKey }) => {
  const { project } = useCurrentProject();
  const timeKey = useMemo(() => project.maps[mapId].timeKey, [project, mapId]);
  const muted = useMemo(() => project.maps[mapId].muted, [project.maps, mapId]);
  //const previousHowler = useRef<Howl | null>(null);

  useEffect(() => {
    // handle sound
    let howler: Howl | null = null;

    if (!muted && feature && feature.properties ) {


      // if time is specified, we try to get it
      if (currentTimeKey ) {

       const properties = currentTimeKey && feature.properties[currentTimeKey] ? feature.properties[currentTimeKey] : feature.properties;
       const noiseVariable = project.lassoVariables[`acoustic_soundlevel`];
       if (properties.sound && feature.properties[currentTimeKey]) {
          
        const volume01 = - noiseVariable.minimumValue +  feature.properties[currentTimeKey].acoustic_soundlevel/ (noiseVariable.maximumValue - noiseVariable.minimumValue );
        const volumedB = -30 + 30 * (volume01);
        const volume = feature.properties[currentTimeKey].acoustic_soundlevel ? Math.pow(10, volumedB / 20)  : 1;

         /* const volume =  feature.properties[currentTimeKey].acoustic_soundlevel
            ? feature.properties[currentTimeKey].acoustic_soundlevel / noiseVariable.maximumValue
            : 1;*/

       
            

          howler = new Howl({
            src: [feature.properties[currentTimeKey].sound],
            autoplay: true,
            loop: true,
            html5: true,
            format: ["mp3"],
            volume,
          });
        }else{

        }
      } else {
        if (timeKey ) {

        }else{

       const properties = timeKey && feature.properties[timeKey] ? feature.properties[timeKey] : feature.properties;
        const noiseVariable = project.lassoVariables[`acoustic_soundlevel`];

        if (properties.sound) {
          


          const volume01 = - noiseVariable.minimumValue +  feature.properties.acoustic_soundlevel/ (noiseVariable.maximumValue - noiseVariable.minimumValue );
          const volumedB = -30 + 30 * (volume01);
          const volume = feature.properties.acoustic_soundlevel ? Math.pow(10, volumedB / 20)  : 1;

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
  }, [feature, currentTimeKey, project.lassoVariables, muted]);

  return null;
};
