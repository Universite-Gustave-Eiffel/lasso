import { FC, PropsWithChildren, useMemo } from "react";
import { createPortal } from "react-dom";
import { useControl } from "react-map-gl";

export const MapControl: FC<PropsWithChildren<{ id: string }>> = ({ id, children }) => {
  const container = useMemo(() => {
    const div = document.createElement("div");
    div.setAttribute("id", `map-control-${id}`);
    return div;
  }, [id]);

  useControl(() => {
    return {
      onAdd: () => {
        return container;
      },
      onRemove: () => {},
    };
  }, {});

  return createPortal(
    <div className="maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group">{children}</div>,
    container,
  );
};
