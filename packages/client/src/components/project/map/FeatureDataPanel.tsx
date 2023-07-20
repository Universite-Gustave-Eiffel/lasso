import { TimeSpecification } from "@lasso/dataprep";
import { Dispatch, FC, SetStateAction, useMemo } from "react";
import { GrClose } from "react-icons/gr";
import { Feature } from "geojson";

import { LassoSourceVariables, IProjectMap } from "@lasso/dataprep";
import { FeatureDataTimeline } from "./FeatureDataTimeline";
import { EmotionFeatureScatterPlot } from "./EmotionFeatureScatterPlot";
import { AcousticFeatureCircles } from "./AcousticFeatureCircles";
import { LoadedProject } from "../../../hooks/useProject";
import { getMapProjectMappedVariable } from "../../../utils/project";

export const FeatureDataPanel: FC<{
  project: LoadedProject;
  map: IProjectMap;
  feature?: Feature;
  timeSpecification?: TimeSpecification;
  variables?: LassoSourceVariables;
  setCurrentTimeKey: Dispatch<SetStateAction<string | null>>;
  currentTimeKey: string | null;
  layerId: string;
  isLeft?: boolean;
  onClose: () => void;
}> = ({
  project,
  map,
  feature,
  setCurrentTimeKey,
  currentTimeKey,
  timeSpecification,
  layerId,
  isLeft,
  onClose,
  variables,
}) => {
  const mapVariable = useMemo(() => getMapProjectMappedVariable(project, map), [project, map]);

  return (
    <div className={`map-point-data ${isLeft ? "is-left" : ""}`}>
      {feature && (
        <>
          <AcousticFeatureCircles feature={feature} />
          {variables && variables["emotion_pleasant"] !== undefined && variables["emotion_eventful"] !== undefined && (
            <EmotionFeatureScatterPlot mapVariable={mapVariable} feature={feature} />
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
