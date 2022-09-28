import { FC, PropsWithChildren, useState, useEffect } from "react";
import L, { Map, LatLngBoundsExpression, GeoJSONOptions, Layer, LatLngExpression } from "leaflet";
import { MapContainer } from "react-leaflet";
import { Project, ProjectLayer } from "@lasso/dataprep";
import { config } from "../../../config";
import { useNotifications } from "../../../core/notifications";
import { SOUNDSCAPE_VARIABLES } from "@lasso/dataprep/src/types";

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
        const layersTodisplay: (ProjectLayer<string> & { variableToDisplay?: SOUNDSCAPE_VARIABLES })[] = project.layers
          .map((projectLayer) => {
            const layerToDisplay = projectMap.layers.find((layer) =>
              typeof layer === "string" ? layer === projectLayer.id : layer.layerId === projectLayer.id,
            );
            if (layerToDisplay) {
              if (typeof layerToDisplay === "string" || !projectLayer.variables || !layerToDisplay.variable)
                return projectLayer;
              else return { ...projectLayer, variableToDisplay: layerToDisplay.variable };
            } else return false;
          })
          .filter((l): l is ProjectLayer<string> & { variableToDisplay?: SOUNDSCAPE_VARIABLES } => !!l);
        Promise.all(
          layersTodisplay.map(async (projectLayer) => {
            if (projectLayer.layer.includes("{x}") && projectLayer.layer.includes("{y}")) {
              return L.tileLayer(projectLayer.layer);
            } else {
              const response = await fetch(`${config.data_path}/${projectLayer.layer}`);
              const geoJson = await response.json();
              const variableToDisplay =
                projectLayer.variableToDisplay &&
                projectLayer.variables &&
                projectLayer.variables[projectLayer.variableToDisplay];
              let featureIdentifier = "id";
              if (projectLayer.variables && projectLayer.variables.featureIdentifier)
                featureIdentifier =
                  typeof projectLayer.variables.featureIdentifier == "string"
                    ? projectLayer.variables.featureIdentifier
                    : projectLayer.variables.featureIdentifier.propertyName;
              const options: GeoJSONOptions = variableToDisplay
                ? {
                    onEachFeature: (feature, layer) => {
                      const propertyName =
                        typeof variableToDisplay == "string" ? variableToDisplay : variableToDisplay.propertyName;
                      if (feature.properties && feature.properties[propertyName] !== undefined) {
                        layer.bindPopup("" + feature.properties[propertyName]);
                      }
                      layer.on({
                        click: () => {
                          //TODO : handle selection state
                          console.log("clicked", feature.properties[featureIdentifier], feature);
                        },
                      });
                    },
                    filter(feature) {
                      const propertyName =
                        typeof variableToDisplay == "string" ? variableToDisplay : variableToDisplay.propertyName;
                      return feature.properties && feature.properties[propertyName] !== undefined;
                    },
                    // TODO: style points but also complex geometry (see color schemes)
                    pointToLayer: function (_, latlng) {
                      const geojsonMarkerOptions = {
                        radius: 8,
                        fillColor: "#ff7800",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8,
                      };
                      return L.circleMarker(latlng, geojsonMarkerOptions);
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
