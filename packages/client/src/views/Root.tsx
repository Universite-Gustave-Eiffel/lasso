import { FC } from "react";
import { BrowserRouter } from "react-router-dom";
import L from "leaflet";

import { AppContextProvider } from "../core/context";
import { Routing } from "../core/routing";

import markerIcon from "leaflet/dist/images/marker-icon.png";
L.Marker.prototype.setIcon(
  L.icon({
    iconUrl: markerIcon,
  }),
);

const Root: FC = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <AppContextProvider>
        <Routing />
      </AppContextProvider>
    </BrowserRouter>
  );
};

export default Root;
