import { FC, PropsWithChildren, useState, useEffect } from "react";
import L, { Map, LatLngBoundsExpression, GeoJSONOptions, Layer, LatLngExpression } from "leaflet";
import { MapContainer } from "react-leaflet";
import { Project, ProjectLayer } from "@lasso/dataprep";
import { pick, values } from "lodash";
import { config } from "../../../config";
import { useNotifications } from "../../../core/notifications";

export interface ProjectMapProps {
  project: Project;
  setMap?: (map: Map | null) => void;
  projectMapId?: string | null;
  bounds?: LatLngBoundsExpression;
  center?: LatLngExpression;
}
export const ProjectMap: FC<PropsWithChildren<ProjectMapProps>> = ({
  project,
  setMap,
  projectMapId,
  bounds,
  center,
  children,
}) => {
  const [localMap, setLocalMap] = useState<Map | null>(null);
  const { notify } = useNotifications();

  /**
   * When map is ready
   * => calling setMap
   */
  useEffect(() => {
    if (setMap) {
      setMap(localMap);
    }
    return () => {
      if (setMap) setMap(null);
    };
  }, [setMap, localMap]);

  /**
   * When map is ready
   * => calling setMap
   */
  useEffect(() => {
    if (localMap && bounds) {
      localMap.fitBounds(bounds);
    }
  }, [localMap, bounds]);

  /**
   * When layers selection change
   * => refresh state
   */
  useEffect(() => {
    if (localMap && projectMapId) {
      const projectMap = project.maps.find((m) => m.id === projectMapId);
      if (!projectMap) notify({ message: `Unkown project map ${projectMapId}`, type: "error" });
      else {
        localMap.attributionControl.addAttribution(projectMap.attribution);
        const layersTodisplay = project.layers
          .map((l) => {
            const layerToDisplay = projectMap.layers.find((layer) =>
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
          layers.forEach((l: Layer) => localMap.addLayer(l));
        });
      }
    }
    return () => {
      if (localMap) localMap.eachLayer((layer) => localMap.removeLayer(layer));
    };
  }, [projectMapId, localMap, project, notify]);

  return (
    <MapContainer inertia={false} trackResize={true} ref={setLocalMap} bounds={bounds} center={center}>
      {children}
    </MapContainer>
  );
};
