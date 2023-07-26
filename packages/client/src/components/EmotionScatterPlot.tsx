import { FC } from "react";
import cx from "classnames";
import { useT } from "@transifex/react";
import { isNil } from "lodash";

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

  // compute value on a range of [0,1]
  const pleasantValue = value.pleasant ? (value.pleasant - pleasantAxis.min) / pleasantAxis.max : undefined;
  const evenfulValue = value.eventful ? (value.eventful - evenfulAxis.min) / evenfulAxis.max : undefined;

  return (
    <div className={cx("emotions-scatter-plot", (!value.eventful || !value.pleasant) && "empty")}>
      <label className="min-x-label">{t("variable.unpleasant")}</label>
      <div className="scatter-plot-row">
        <label>{t("variable.eventful")}</label>

        <div className={`scatter-plot`}>
          {!isNil(pleasantValue) && !isNil(evenfulValue) && (
            <div
              className="point"
              title={`${t("variable.emotion-pleasant")}: ${(pleasantValue * 10 - 5).toFixed(2)} ${t(
                "variable.emotion-eventful",
              )}: ${(evenfulValue * 10 - 5).toFixed(2)}`}
              style={{
                left: `${SQUARE_SIZE * pleasantValue + 5}px`, // +5 is for the margin
                bottom: `${SQUARE_SIZE * evenfulValue + 5}px`,
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
