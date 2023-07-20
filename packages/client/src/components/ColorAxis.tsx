import { FC, useMemo } from "react";
import { range } from "lodash";

interface ColorAxisProps {
  min: number;
  max: number;
  nbSteps: number;
  getColorByValue: (value: number) => string;
}

export const ColorAxis: FC<ColorAxisProps> = ({ min, max, nbSteps, getColorByValue }) => {
  const colors = useMemo(() => {
    return range(min, max, (max - min) / nbSteps).map((i) => getColorByValue(i));
  }, [min, max, nbSteps, getColorByValue]);

  return (
    <>
      {colors.map((color, index) => (
        <div key={index} style={{ backgroundColor: color, width: "5px", height: "100%" }} />
      ))}
    </>
  );
};
