import { FC } from "react";
import { IconType } from "react-icons";
import cx from "classnames";
import { isNil } from "lodash";
import { useT } from "@transifex/react";

interface AcousticCircleProps {
  icon?: IconType;
  color: string;
  label: string;
  min: number;
  max: number;
  value?: number;
}
export const AcousticCircle: FC<AcousticCircleProps> = ({ icon, color, label, max, value }) => {
  const t = useT();
  const percent = value ? (value / max) * 100 : 0;

  return (
    <div className={cx("d-flex align-items-center p-1", isNil(value) && "opacity-25")}>
      <div
        className={`acoustic-circle`}
        style={{
          backgroundImage: `linear-gradient(0deg, ${color} 0%, ${color} ${percent}%, rgba(255,255,255,0) ${percent}%)`,
        }}
        title={`${label} : ${value || t("no data")}`}
      >
        {icon ? icon({ className: "icon", size: "2em" }) : null}
      </div>
      <label className="d-flex flex-column ms-1">
        <div>{label}</div>
        <div>{!isNil(value) ? value.toFixed(2) : "?"}</div>
      </label>
    </div>
  );
};
