import { FC } from "react";
import { BsVolumeUp, BsVolumeMute } from "react-icons/bs";
import { useT } from "@transifex/react";
import { isNil } from "lodash";

import { useCurrentProject } from "../../../hooks/useCurrentProject";
import { MapControl } from "../../MapControl";

export const SoundControl: FC<{ mapId: "left" | "right" }> = ({ mapId }) => {
  const t = useT();
  const { project, setProjectMapSound } = useCurrentProject();
  const projectMap = project.maps[mapId];

  const layerHasSound = !isNil((projectMap.lassoVariable?.featureExample?.properties ?? {}).sound);

  return (
    <>
      {layerHasSound && (
        <>
          <MapControl id="sound">
            <button
              title={projectMap.muted ? t("Enable sounds") : t("Mute sounds")}
              onClick={() => setProjectMapSound(mapId, !projectMap.muted)}
            >
              {projectMap.muted ? <BsVolumeMute size="1.5em" /> : <BsVolumeUp size="1.5em" />}
            </button>
          </MapControl>
        </>
      )}
    </>
  );
};
