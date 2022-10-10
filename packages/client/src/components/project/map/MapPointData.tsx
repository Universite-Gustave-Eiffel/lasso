import { MapboxGeoJSONFeature } from "mapbox-gl";
import { FC } from "react";

export const MapPointData: FC<{ pointData: MapboxGeoJSONFeature | null }> = ({ pointData }) => {
  return (
    <div className="map-point-data ">
      {pointData && (
        <>
          <h2>Map point data</h2>
          <div>{JSON.stringify(pointData.properties)}</div>
        </>
      )}
    </div>
  );
};
