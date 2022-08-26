import { FC } from "react";
import { Map } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

interface PrimaryMapProps {
  setMap?: (map: Map) => void;
}
export const PrimaryMap: FC<PrimaryMapProps> = ({ setMap }) => {
  return (
    <MapContainer inertia={false} center={[0, 0]} zoom={13} ref={setMap}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};
