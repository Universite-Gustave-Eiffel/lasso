import { FC, useCallback, useMemo } from "react";
import { Feature } from "geojson";
import { useT } from "@transifex/react";

import { SOUNDSCAPE_VARIABLES_TYPES } from "@lasso/dataprep";
import { useCurrentProject } from "../../../hooks/useProject";
import { getProjectVariables, ProjectLayerVariable } from "../../../utils/project";
import { ColorAxis } from "../../ColorAxis";

const SQUARE_SIZE = 80;

export const EmotionFeatureScatterPlot: FC<{ mapVariable: ProjectLayerVariable | null; feature: Feature }> = ({
  mapVariable,
  feature,
}) => {
  const { project } = useCurrentProject();
  const t = useT();
  const notEmpty =
    feature && feature.properties && feature.properties.emotion_pleasant && feature.properties.emotion_eventful;

  const getColorFunctionForVariable = useCallback(
    (variable: SOUNDSCAPE_VARIABLES_TYPES) => {
      return (value: number) => {
        if (variable === mapVariable?.variable) {
          const colorExp = project?.legendSpecs[variable]?.colorStyleExpression;
          if (colorExp) return colorExp.evaluate({ zoom: 14 }, { ...feature, properties: { [variable]: value } });
          return "#FFF";
        }
        return "#ddd";
      };
    },
    [feature, project],
  );

  const projectVariables = useMemo(() => {
    if (project) return getProjectVariables(project);
    return {};
  }, [project]);

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
                      (feature.properties?.emotion_pleasant - projectVariables["emotion_pleasant"].minimumValue)) /
                    projectVariables["emotion_pleasant"].maximumValue
                  }px`,
                  bottom: `${
                    (SQUARE_SIZE *
                      (feature.properties?.emotion_eventful - projectVariables["emotion_eventful"].minimumValue)) /
                    projectVariables["emotion_eventful"].maximumValue
                  }px`,
                }}
              />
            )}
            <div className="x-axe">
              <ColorAxis
                arrow
                min={projectVariables["emotion_pleasant"].minimumValue}
                max={projectVariables["emotion_pleasant"].maximumValue}
                nbSteps={100}
                getColorByValue={getColorFunctionForVariable("emotion_pleasant")}
              />
            </div>
            <div className="y-axe">
              <ColorAxis
                arrow
                min={projectVariables["emotion_eventful"].minimumValue}
                max={projectVariables["emotion_eventful"].maximumValue}
                nbSteps={100}
                getColorByValue={getColorFunctionForVariable("emotion_eventful")}
              />
            </div>
          </div>
          <label>{t("variable.calm")}</label>
        </div>
        <label className="max-x-label">{t("variable.pleasant")}</label>
      </div>
    </div>
  );
};
