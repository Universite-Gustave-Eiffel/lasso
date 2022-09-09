import { FC, PropsWithChildren, useState, useEffect } from "react";
import { Map, LatLngBoundsExpression } from "leaflet";
import { MapContainer } from "react-leaflet";

interface PrimaryMapProps {
  setMap?: (map: Map | null) => void;
  bounds?: LatLngBoundsExpression;
}
export const PrimaryMap: FC<PropsWithChildren<PrimaryMapProps>> = ({ setMap, bounds, children }) => {
  const [localMap, setLocalMap] = useState<Map | null>(null);

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

  return (
    <MapContainer inertia={false} trackResize={true} ref={setLocalMap} bounds={bounds}>
      {children}
    </MapContainer>
  );
};
