import { FC, PropsWithChildren } from "react";
import { Map } from "leaflet";
import { MapContainer } from "react-leaflet";

interface PrimaryMapProps {
  setMap?: (map: Map) => void;
}
export const PrimaryMap: FC<PropsWithChildren<PrimaryMapProps>> = ({ setMap, children }) => {
  return (
    <MapContainer inertia={false} ref={setMap}>
      {children}
    </MapContainer>
  );
};
