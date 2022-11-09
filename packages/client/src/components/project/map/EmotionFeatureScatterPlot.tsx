import { FC } from "react";
import { Feature } from "geojson";

import { useCurrentProject } from "../../../hooks/useProject";
import { useT } from "@transifex/react";

const SQUARE_SIZE = 80;

export const EmotionFeatureScatterPlot: FC<{ feature: Feature }> = ({ feature }) => {
  const t = useT();
  const project = useCurrentProject();
  if (feature.properties && feature.properties.emotion_pleasant && feature.properties.emotion_eventful) {
    //TODO: retrieve min max value from stats to be done at build time
    const maxEventColor = project?.legendSpecs?.emotion_eventful?.colorStyleExpression?.evaluate(
      { zoom: 14 },
      { ...feature, properties: { emotion_eventful: 11 } },
    );
    const minEventColor = project?.legendSpecs?.emotion_eventful?.colorStyleExpression?.evaluate(
      { zoom: 14 },
      { ...feature, properties: { emotion_eventful: 0 } },
    );
    const maxPleaColor = project?.legendSpecs?.emotion_pleasant?.colorStyleExpression?.evaluate(
      { zoom: 14 },
      { ...feature, properties: { emotion_pleasant: 11 } },
    );
    const minPleaColor = project?.legendSpecs?.emotion_pleasant?.colorStyleExpression?.evaluate(
      { zoom: 14 },
      { ...feature, properties: { emotion_pleasant: 0 } },
    );

    return (
      <div className="emotions-scatter-plot">
        <div
          className="point"
          title={`${t("emotion_pleasant")}: ${feature.properties.emotion_pleasant} ${t("emotion_eventful")}: ${
            feature.properties.emotion_eventful
          }`}
          style={{
            left: `${(SQUARE_SIZE / 11) * feature.properties.emotion_pleasant}px`,
            bottom: `${(SQUARE_SIZE / 11) * feature.properties.emotion_eventful}px`,
          }}
        />
        <div className="x-axe">
          <label>{t("emotion_pleasant")}</label>
        </div>
        <div className="y-axe">
          <label>{t("emotion_eventful")}</label>
        </div>
        <div className="zero">0</div>

        <div
          className="background"
          style={{ background: `linear-gradient(to right, ${minEventColor}, ${maxEventColor})` }}
        />
        <div
          className="background_before"
          style={{ background: `linear-gradient(to right, ${minPleaColor}, ${maxPleaColor})` }}
        />
      </div>
    );
  } else return null;
};
