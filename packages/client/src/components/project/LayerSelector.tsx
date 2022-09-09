import { FC, CSSProperties, useMemo, useState, useEffect } from "react";
import Select from "react-select";
import cx from "classnames";
import L, { Map, Layer } from "leaflet";

import { Project } from "@lasso/dataprep";
import { config } from "../../config";

export interface LayerSelectorProps {
  /**
   * HTML id
   */
  id?: string;
  /**
   * HTML class
   */
  className?: string;
  /**
   * HTML CSS style
   */
  style?: CSSProperties;
  /**
   * The project to display
   */
  project: Project;
  /**
   * The map on which the component is linked
   */
  map: Map;
}

//TODO: selected in url
export const LayerSelector: FC<LayerSelectorProps> = ({ id, className, style, map, project }) => {
  const htmlProps = { id, className: cx("layer-selector", className), style };
  const options = useMemo(() => project.maps.map((m) => ({ value: m.id, label: m.name })), [project]);
  const [selected, setSelected] = useState<{ value: string; label: string }>(options[0]);

  /**
   * When the selected map changes
   * => we load all the related layers
   */
  useEffect(() => {
    const mapToDisplay = project.maps.find((m) => m.id === selected.value);
    if (mapToDisplay) {
      map.attributionControl.addAttribution(mapToDisplay.attribution);
      Promise.all(
        project.layers
          .filter((l) => mapToDisplay.layersId.includes(l.id))
          .map(async (l) => {
            if (l.layer.includes("{x}") && l.layer.includes("{y}")) {
              return L.tileLayer(l.layer);
            } else {
              const response = await fetch(`${config.data_path}/${l.layer}`);
              const geoJson = await response.json();
              return L.geoJSON(geoJson as any);
            }
          }),
      ).then((layers) => {
        layers.forEach((l: Layer) => map.addLayer(l));
      });
    }
    return () => {
      map.eachLayer((layer) => map.removeLayer(layer));
    };
  }, [selected, map, project]);

  // useEffect(() => {
  //   if (map) {
  //     map.fitBounds(project.bbox);
  //   }
  // }, [map, project]);

  return (
    <div {...htmlProps}>
      <Select
        isMulti={false}
        isClearable={false}
        options={options}
        value={selected}
        formatOptionLabel={(i) => <div>{i.label}</div>}
        onChange={(e) => setSelected(e ? e : options[0])}
      />
    </div>
  );
};
