import { FC } from "react";
import cx from "classnames";
import { useT } from "@transifex/react";

import { ColorAxis, ColorAxisProps } from "./ColorAxis";

const SQUARE_SIZE = 80;

interface EmotionScatterPlotProps {
  pleasantAxis: ColorAxisProps;
  evenfulAxis: ColorAxisProps;
  value: {
    eventful?: number;
    pleasant?: number;
  };
}
export const EmotionScatterPlot: FC<EmotionScatterPlotProps> = ({ value, pleasantAxis, evenfulAxis }) => {
  const t = useT();

  return (
    <div className={cx("emotions-scatter-plot", (!value.eventful || !value.pleasant) && "empty")}>
      <label className="min-x-label">{t("variable.unpleasant")}</label>
      <div className="scatter-plot-row">
        <label>{t("variable.eventful")}</label>

        <div className={`scatter-plot`}>
          {value.eventful && value.pleasant && (
            <div
              className="point"
              title={`${t("variable.emotion-pleasant")}: ${value.pleasant} ${t("variable.emotion-eventful")}: ${
                value.eventful
              }`}
              style={{
                left: `${(SQUARE_SIZE * (value.pleasant - pleasantAxis.min)) / pleasantAxis.max}px`,
                bottom: `${(SQUARE_SIZE * (value.eventful - evenfulAxis.min)) / evenfulAxis.max}px`,
              }}
            />
          )}
          <div className="x-axe">
            <ColorAxis {...pleasantAxis} />
          </div>
          <div className="y-axe">
            <ColorAxis {...evenfulAxis} />
          </div>
        </div>
        <label>{t("variable.calm")}</label>
      </div>
      <label className="max-x-label">{t("variable.pleasant")}</label>
    </div>
  );
};
