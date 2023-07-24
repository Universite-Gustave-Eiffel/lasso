import { FC, useMemo } from "react";
import { range } from "lodash";

export interface ColorAxisProps {
  min: number;
  max: number;
  nbSteps: number;
  getColorByValue: (value: number) => string;
  arrow?: boolean;
  size?: string;
}

export const ColorAxis: FC<ColorAxisProps> = ({ min, max, nbSteps, getColorByValue, arrow, size }) => {
  const colors = useMemo(() => {
    return range(min, max, (max - min) / nbSteps).map((i) => getColorByValue(i));
  }, [min, max, nbSteps, getColorByValue]);

  return (
    <>
      {arrow && <div className="arrow" />}
      {colors.map((color, index) => (
        <div key={index} className="axis" style={{ borderColor: color, borderWidth: `${size} 0` }} />
      ))}
      {arrow && <div className="arrow" />}
    </>
  );
};
