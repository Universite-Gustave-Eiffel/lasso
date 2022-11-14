import { TimeSpecification } from "@lasso/dataprep";
import { FC } from "react";
import { Feature } from "geojson";

import { FeatureDataTimeline } from "./FeatureDataTimeline";
import { EmotionFeatureScatterPlot } from "./EmotionFeatureScatterPlot";
import { AcousticFeatureCircles } from "./AcousticFeatureCircles";
import { GrClose } from "react-icons/gr";
import { LassoSourceVariables } from "@lasso/dataprep";

export const FeatureDataPanel: FC<{
  feature?: Feature;
  timeSpecification?: TimeSpecification;
  variables?: LassoSourceVariables;
  setCurrentTimeKey: (timeKey: string | null) => void;
  currentTimeKey: string | null;
  layerId: string;
  isLeft?: boolean;
  onClose: () => void;
}> = ({ feature, setCurrentTimeKey, currentTimeKey, timeSpecification, layerId, isLeft, onClose, variables }) => {
  console.log(variables);
  return (
    <div className={`map-point-data ${isLeft ? "is-left" : ""}`}>
      {feature && (
        <>
          <AcousticFeatureCircles feature={feature} />
          {variables && variables["emotion_pleasant"] !== undefined && variables["emotion_eventful"] !== undefined && (
            <EmotionFeatureScatterPlot feature={feature} variables={variables} />
          )}
          {timeSpecification && (
            <FeatureDataTimeline
              feature={feature}
              layerId={layerId}
              timeSpecification={timeSpecification}
              currentTimeKey={currentTimeKey}
              setCurrentTimeKey={setCurrentTimeKey}
            />
          )}
          <button className="btn btn-icon close" onClick={() => onClose()}>
            <GrClose />
          </button>
        </>
      )}
    </div>
  );
};
