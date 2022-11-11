import { FC } from "react";
import { Feature } from "geojson";

//import { useCurrentProject } from "../../../hooks/useProject";
import { useT } from "@transifex/react";

const SQUARE_SIZE = 80;

export const EmotionFeatureScatterPlot: FC<{ feature: Feature }> = ({ feature }) => {
  const t = useT();
  //const project = useCurrentProject();
  if (feature.properties && feature.properties.emotion_pleasant && feature.properties.emotion_eventful) {
    return (
      <div className="emotions-scatter-plot">
        <label className="min-x-label">{t("unpleasant")}</label>
        <div className="scatter-plot-row">
          <label>{t("eventful")}</label>

          <div className="scatter-plot">
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
            <div className="x-axe" />
            <div className="y-axe" />
          </div>
          <label>{t("calm")}</label>
        </div>
        <label className="max-x-label">{t("pleasant")}</label>
      </div>
    );
  } else return null;
};
