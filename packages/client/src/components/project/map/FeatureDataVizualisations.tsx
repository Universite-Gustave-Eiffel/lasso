import { toPairs } from "lodash";
import { Feature } from "geojson";
import { FC } from "react";

export const FeatureDataVizualisations: FC<{ feature: Feature }> = ({ feature }) => {
  if (feature.properties)
    return (
      <div className="map-feature-viz">
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
