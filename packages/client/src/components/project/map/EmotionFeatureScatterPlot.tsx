import { FC } from "react";
import { Feature } from "geojson";

//import { useCurrentProject } from "../../../hooks/useProject";
import { useT } from "@transifex/react";
import { LassoSourceVariables } from "@lasso/dataprep";
import { range } from "lodash";
import { useCurrentProject } from "../../../hooks/useProject";

const SQUARE_SIZE = 80;

export const EmotionFeatureScatterPlot: FC<{ feature: Feature; variables: LassoSourceVariables }> = ({
  feature,
  variables,
}) => {
  const project = useCurrentProject();
  const t = useT();
  const notEmpty =
    feature && feature.properties && feature.properties.emotion_pleasant && feature.properties.emotion_eventful;
  return (
    <div>
      <h6>{t("viz-panel.emotions")}</h6>
      <div className={`emotions-scatter-plot ${notEmpty ? "" : "empty"}`}>
        <label className="min-x-label">{t("variable.unpleasant")}</label>
        <div className="scatter-plot-row">
          <label>{t("variable.eventful")}</label>

          <div className={`scatter-plot`}>
            {notEmpty && (
              <div
                className="point"
                title={`${t("variable.emotion-pleasant")}: ${feature.properties?.emotion_pleasant} ${t(
                  "variable.emotion-eventful",
                )}: ${feature.properties?.emotion_eventful}`}
                style={{
                  left: `${
                    (SQUARE_SIZE *
                      (feature.properties?.emotion_pleasant - (variables["emotion_pleasant"]?.minimumValue || 0))) /
                    (variables["emotion_pleasant"]?.maximumValue || 10)
                  }px`,
                  bottom: `${
                    (SQUARE_SIZE *
                      (feature.properties?.emotion_eventful - (variables["emotion_eventful"]?.minimumValue || 0))) /
                    (variables["emotion_eventful"]?.maximumValue || 10)
                  }px`,
                }}
              />
            )}
            <div className="x-axe">
              {range(
                variables["emotion_pleasant"]?.minimumValue || 0,
                variables["emotion_pleasant"]?.maximumValue || 10,
                (variables["emotion_pleasant"]?.maximumValue ||
                  10 - (variables["emotion_pleasant"]?.minimumValue || 0)) / 100,
              ).map((i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: project?.legendSpecs?.emotion_pleasant?.colorStyleExpression?.evaluate(
                      { zoom: 14 },
                      { ...feature, properties: { emotion_pleasant: i } },
                    ),
                  }}
                />
              ))}
            </div>
            <div className="y-axe">
              {range(
                variables["emotion_eventful"]?.minimumValue || 0,
                variables["emotion_eventful"]?.maximumValue || 10,
                (variables["emotion_eventful"]?.maximumValue ||
                  10 - (variables["emotion_eventful"]?.minimumValue || 0)) / 100,
              ).map((i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: project?.legendSpecs?.emotion_eventful?.colorStyleExpression?.evaluate(
                      { zoom: 14 },
                      { ...feature, properties: { emotion_eventful: i } },
                    ),
                  }}
                />
              ))}
            </div>
          </div>
          <label>{t("variable.calm")}</label>
        </div>
        <label className="max-x-label">{t("variable.pleasant")}</label>
      </div>
    </div>
  );
};
