import { TimeSpecification } from "@lasso/dataprep";
import { FC } from "react";
import { Feature } from "geojson";

import { FeatureDataTimeline } from "./FeatureDataTimeline";
import { EmotionFeatureScatterPlot } from "./EmotionFeatureScatterPlot";
import { AcousticFeatureCircles } from "./AcousticFeatureCircles";

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
          <div className="d-flex justify-content-center align-items-center p-1">
            <AcousticFeatureCircles feature={feature} />
          </div>
          <EmotionFeatureScatterPlot feature={feature} />
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
