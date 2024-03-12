import { FC, useCallback, useMemo } from "react";
import { Feature } from "geojson";
import { useT } from "@transifex/react";
import { isNil, toNumber } from "lodash";

import { SOUNDSCAPE_VARIABLES_TYPES } from "@lasso/dataprep";
import { useCurrentProject } from "../../../hooks/useCurrentProject";
import { ProjectLayerVariable } from "../../../utils/project";
import { EmotionScatterPlot } from "../../EmotionScatterPlot";

interface EmotionFeatureScatterPlotProps {
  mapVariable: ProjectLayerVariable | null;
  feature: Feature;
  currentTimeKey?: string | null;
}
export const EmotionFeatureScatterPlot: FC<EmotionFeatureScatterPlotProps> = ({
  mapVariable,
  feature,
  currentTimeKey,
}) => {
  const t = useT();
  const { project } = useCurrentProject();

  const hasEmotionsData = useMemo(() => {
    if (feature.properties) {
      return !isNil(feature.properties.emotion_pleasant) || !isNil(feature.properties.emotion_eventful);
    }
    return false;
  }, [feature]);

  const getColorFunctionForVariable = useCallback(
    (variable: SOUNDSCAPE_VARIABLES_TYPES) => {
      return (value: number) => {
        if (variable === mapVariable?.variable) {
          const colorExp = project.data.legendSpecs[variable]?.colorStyleExpression;
          if (colorExp) return colorExp.evaluate({ zoom: 14 }, { ...feature, properties: { [variable]: value } });
          return "#FFF";
        }
        return "var(--lasso-gray)";
      };
    },
    [feature, project, mapVariable?.variable],
  );

  const value = useMemo(() => {
    let data: { pleasant?: number; eventful?: number } = { pleasant: undefined, eventful: undefined };

    if (feature.properties) {
      if (currentTimeKey) {
        if (feature.properties[currentTimeKey]) {
          data = {
            pleasant: feature.properties[currentTimeKey]["emotion_pleasant"]
              ? toNumber(feature.properties[currentTimeKey]["emotion_pleasant"])
              : undefined,
            eventful: feature.properties[currentTimeKey]["emotion_eventful"]
              ? toNumber(feature.properties[currentTimeKey]["emotion_eventful"])
              : undefined,
          };
        }
      } else {
        data = { pleasant: feature.properties.emotion_pleasant, eventful: feature.properties.emotion_eventful };
      }
    }
    return data;
  }, [feature, currentTimeKey]);

  return (
    <>
      {hasEmotionsData && (
        <div>
          <h6>{t("Emotions plot")}</h6>
          <EmotionScatterPlot
            evenfulAxis={{
              arrow: true,
              min: project.lassoVariables["emotion_eventful"].minimumValue,
              max: project.lassoVariables["emotion_eventful"].maximumValue,
              nbSteps: 100,
              getColorByValue: getColorFunctionForVariable("emotion_eventful"),
            }}
            pleasantAxis={{
              arrow: true,
              min: project.lassoVariables["emotion_pleasant"].minimumValue,
              max: project.lassoVariables["emotion_pleasant"].maximumValue,
              nbSteps: 100,
              getColorByValue: getColorFunctionForVariable("emotion_pleasant"),
            }}
            value={value}
          />
        </div>
      )}
    </>
  );
};
