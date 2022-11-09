import { FC } from "react";
import { Feature } from "geojson";

import { AcousticFeatureCircles } from "./AcousticFeatureCircles";
import { EmotionFeatureScatterPlot } from "./EmotionFeatureScatterPlot";

export const FeatureDataVizualisations: FC<{ feature: Feature }> = ({ feature }) => {
  if (feature.properties)
    return (
      <div className="map-feature-viz">
        <AcousticFeatureCircles feature={feature} />
        <EmotionFeatureScatterPlot feature={feature} />
      </div>
    );
  else return <></>;
};
