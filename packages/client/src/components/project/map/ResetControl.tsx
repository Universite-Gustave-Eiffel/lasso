import { FC, useCallback } from "react";
import { GrMapLocation } from "react-icons/gr";
import { useT } from "@transifex/react";
import { useMap } from "react-map-gl";

import { useCurrentProject } from "../../../hooks/useCurrentProject";
import { MapControl } from "../../MapControl";

export const ResetControl: FC<{ point?: { lat: number; lng: number } }> = ({ point }) => {
  const t = useT();
  const { current: map } = useMap();
  const { project } = useCurrentProject();

  const onClick = useCallback(() => {
    if (project) {
      if (point) map?.setCenter(point);
      else map?.fitBounds(project.bbox, { pitch: 0 });
    }
  }, [map, project, point]);

  return (
    <MapControl id="reset">
      <button
        className="maplibregl-ctrl-fullscreen mapboxgl-ctrl-fullscreen"
        onClick={onClick}
        title={t("map.control.bboxReset")}
      >
        <GrMapLocation size="1.8em" />
      </button>
    </MapControl>
  );
};
