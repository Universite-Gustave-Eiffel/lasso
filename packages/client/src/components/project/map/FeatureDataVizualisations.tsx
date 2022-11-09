import { toPairs } from "lodash";
import { FC } from "react";
import { Feature } from "geojson";

import { useCurrentProject } from "../../../hooks/useProject";
import { AcousticFeatureCircles } from "./AcousticFeatureCircles";

export const FeatureDataVizualisations: FC<{ feature: Feature }> = ({ feature }) => {
  const project = useCurrentProject();

  if (feature.properties && project)
    return (
      <div className="map-feature-viz">
        <div className="d-flex acoustics">
          <AcousticFeatureCircles feature={feature} />
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
