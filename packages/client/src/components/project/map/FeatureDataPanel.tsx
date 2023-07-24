import { TimeSpecification } from "@lasso/dataprep";
import { FC } from "react";
import { Feature } from "geojson";

import { FeatureDataTimeline } from "./FeatureDataTimeline";
import { EmotionFeatureScatterPlot } from "./EmotionFeatureScatterPlot";
import { AcousticFeatureCircles } from "./AcousticFeatureCircles";
import { useCurrentProject } from "../../../hooks/useCurrentProject";

export const FeatureDataPanel: FC<{
  mapId: string;
  feature?: Feature;
  timeSpecification?: TimeSpecification;
  onClose: () => void;
}> = ({ mapId, feature, timeSpecification, onClose }) => {
  const { project, setProjectMapTime } = useCurrentProject();

  const projectVariables = project.lassoVariables;
  const mapVariable = project.maps[mapId].lassoVariable;

  return (
    <>
      {feature && (
        <div className="map-point-data">
          <button className="btn-close" onClick={() => onClose()}></button>

          <div className="map-point-data-content">
            <AcousticFeatureCircles feature={feature} currentTimeKey={project.maps[mapId].timeKey} />

            {/* Display emotion plot only if variables are available in the project */}
            {projectVariables["emotion_pleasant"] !== undefined &&
              projectVariables["emotion_eventful"] !== undefined && (
                <EmotionFeatureScatterPlot
                  mapVariable={mapVariable}
                  feature={feature}
                  currentTimeKey={project.maps[mapId].timeKey}
                />
              )}

            {/* Display time  plot only if variables are available in the project */}
            {timeSpecification && mapVariable && (
              <FeatureDataTimeline
                mapVariable={mapVariable}
                timeSpecification={timeSpecification}
                currentTimeKey={project.maps[mapId].timeKey}
                setCurrentTimeKey={(timeKey?: string) => setProjectMapTime(mapId, timeKey)}
                feature={feature}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
