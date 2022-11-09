import { toPairs } from "lodash";
import { Feature } from "geojson";
import { CSSProperties, FC } from "react";
import { SOUNDSCAPE_VARIABLES_TYPES } from "@lasso/dataprep";
import { useCurrentProject } from "../../../hooks/useProject";

export const FeatureDataVizualisations: FC<{ feature: Feature }> = ({ feature }) => {
  const project = useCurrentProject();

  if (feature.properties && project)
    return (
      <div className="map-feature-viz">
        <div className="d-flex acoustics">
          {toPairs(feature.properties).map(([key, value]) => {
            if (key.startsWith("acoustic")) {
              const legendSpec = project.legendSpecs ? project.legendSpecs[key as SOUNDSCAPE_VARIABLES_TYPES] : null;
              const itemStyle: CSSProperties = {};
              if (legendSpec && legendSpec.colorStyleExpression) {
                try {
                  itemStyle.backgroundColor = legendSpec.colorStyleExpression.evaluate({ zoom: 14 }, feature);
                } catch (e) {
                  console.error(e);
                }
              }

              return (
                <div key={key} style={itemStyle}>
                  {key}:{value}
                </div>
              );
            }
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
