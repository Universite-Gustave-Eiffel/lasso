import { MapboxGeoJSONFeature } from "mapbox-gl";
import { Project } from "@lasso/dataprep/src/types";
import { FC } from "react";
import { FeatureDataTimeline } from "./FeatureDataTimeline";
import { FeatureDataVizualisations } from "./FeatureDataVizualisations";

export const FeatureDataPanel: FC<{ feature: MapboxGeoJSONFeature | null; project: Project }> = ({
  feature,
  project,
}) => {
  const source =
    feature?.layer.source && typeof feature.layer.source === "string"
      ? project.sources[feature?.layer.source]
      : undefined;

  return (
    <div className="map-point-data ">
      {feature && (
        <>
          {<FeatureDataVizualisations feature={feature} />}
          {source && source.timeSeries && (
            <FeatureDataTimeline feature={feature} timeSpecification={source.timeSeries} />
          )}
        </>
      )}
    </div>
  );
};
