import { FC, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { GrMapLocation } from "react-icons/gr";
import { useT } from "@transifex/react";
import { useMap, useControl } from "react-map-gl";

import { useCurrentProject } from "../../../hooks/useProject";

export const ResetControl: FC<{ point?: { lat: number; lng: number } }> = ({ point }) => {
  const t = useT();
  const { current: map } = useMap();
  const { project } = useCurrentProject();

  const container = useMemo(() => {
    const div = document.createElement("div");
    div.setAttribute("id", "map-control-reset");
    return div;
  }, []);

  useControl(() => {
    return {
      onAdd: () => {
        return container;
      },
      onRemove: () => {},
    };
  }, {});

  const onClick = useCallback(() => {
    if (project) {
      if (point) map?.setCenter(point);
      else map?.fitBounds(project.bbox, { pitch: 0 });
    }
  }, [map, project, point]);

  return createPortal(
    <div className="maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group">
      <button
        className="maplibregl-ctrl-fullscreen mapboxgl-ctrl-fullscreen"
        onClick={onClick}
        title={t("map.control.reset")}
      >
        <GrMapLocation size="1.8em" />
      </button>
    </div>,
    container,
  );
};
