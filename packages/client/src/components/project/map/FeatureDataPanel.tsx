import { TimeSpecification } from "@lasso/dataprep";
import { FC } from "react";
import { Feature } from "geojson";

import { FeatureDataTimeline } from "./FeatureDataTimeline";
import { FeatureDataVizualisations } from "./FeatureDataVizualisations";

export const FeatureDataPanel: FC<{
  feature?: Feature;
  timeSpecification?: TimeSpecification;
  setCurrentTimeKey: (timeKey: string | null) => void;
  currentTimeKey: string | null;
  layerId: string;
}> = ({ feature, setCurrentTimeKey, currentTimeKey, timeSpecification, layerId }) => {
  return (
    <div className="map-point-data">
      {feature && (
        <>
          {<FeatureDataVizualisations feature={feature} />}
          {timeSpecification && (
            <FeatureDataTimeline
              feature={feature}
              layerId={layerId}
              timeSpecification={timeSpecification}
              currentTimeKey={currentTimeKey}
              setCurrentTimeKey={setCurrentTimeKey}
            />
          )}
        </>
      )}
    </div>
  );
};
