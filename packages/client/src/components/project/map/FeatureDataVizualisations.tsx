import { toPairs } from "lodash";
import { MapboxGeoJSONFeature } from "mapbox-gl";
import { FC } from "react";

export const FeatureDataVizualisations: FC<{ feature: MapboxGeoJSONFeature }> = ({ feature }) => {
  if (feature.properties)
    return (
      <div className="d-flex">
        <div className="d-flex acoustics">
          {toPairs(feature.properties).map(([key, value]) => {
            if (key.startsWith("acoustic"))
              return (
                <div key={key}>
                  {key}:{value}
                </div>
              );
            return null;
          })}
        </div>
        <div className="d-flex emotions">
          {toPairs(feature.properties).map(([key, value]) => {
            if (key.startsWith("emotion"))
              return (
                <div key={key}>
                  {key}:{value}
                </div>
              );
            return null;
          })}
        </div>
      </div>
    );
  else return <></>;
};
