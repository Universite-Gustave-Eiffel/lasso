import { FC, CSSProperties, useMemo, useState, useEffect } from "react";
import Select from "react-select";
import cx from "classnames";
import L, { Map, Layer, GeoJSONOptions } from "leaflet";

import { Project, ProjectLayer } from "@lasso/dataprep";
import { config } from "../../config";
import { pick, values } from "lodash";

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
      const layersTodisplay = project.layers
        .map((l) => {
          const layerToDisplay = mapToDisplay.layers.find((layer) =>
            typeof layer === "string" ? layer === l.id : layer.layerId === l.id,
          );
          if (layerToDisplay) {
            if (typeof layerToDisplay === "string" || !l.variables || !layerToDisplay.variable) return l;
            else return { ...l, variables: pick(l.variables, layerToDisplay.variable) };
          } else return false;
        })
        .filter((l): l is ProjectLayer<string> => !!l);

      Promise.all(
        layersTodisplay.map(async (l) => {
          if (l.layer.includes("{x}") && l.layer.includes("{y}")) {
            return L.tileLayer(l.layer);
          } else {
            const response = await fetch(`${config.data_path}/${l.layer}`);
            const geoJson = await response.json();
            const variableToDisplay = values(l.variables)[0];

            const options: GeoJSONOptions = variableToDisplay
              ? {
                  onEachFeature: (feature, layer) => {
                    const propertyName =
                      typeof variableToDisplay == "string" ? variableToDisplay : variableToDisplay.propertyName;
                    if (feature.properties && feature.properties[propertyName]) {
                      layer.bindPopup("" + feature.properties[propertyName]);
                    }
                  },
                  filter(feature) {
                    const propertyName =
                      typeof variableToDisplay == "string" ? variableToDisplay : variableToDisplay.propertyName;
                    return feature.properties && feature.properties[propertyName];
                  },
                }
              : {};
            return L.geoJSON(geoJson as any, options);
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
