import { FC, useMemo } from "react";
import { useT, useLocale } from "@transifex/react";
import cx from "classnames";
import { isNil } from "lodash";

import { TimeSpecification } from "@lasso/dataprep";
import { getI18NText } from "../utils/i18n";

function isSelected(timeKey: string | null | undefined, value: string): boolean {
  return timeKey ? timeKey.split("|").includes(value) : false;
}
interface TimeSelectorProps {
  mapId: "left" | "right";
  specification: TimeSpecification;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}
export const TimeSelector: FC<TimeSelectorProps> = ({ mapId, specification, value, onChange }) => {
  const t = useT();
  const locale = useLocale();

  const defaultTimeKey = useMemo(() => {
    let time: string[] = [];
    if (specification) {
      (["monthsLabels", "daysLabels", "hoursLabels"] as Array<keyof TimeSpecification>).forEach((period) => {
        const values = Object.keys(specification[period] || {});
        if (values.length > 0) {
          time.push(values[0]);
        }
      });
    }
    return time.join("|");
  }, [specification]);

  return (
    <div className="p-1">
      <h4 className="d-flex justify-content-between align-items-center">
        <span>{t("time selector")}</span>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="flexSwitchCheckChecked"
            checked={value !== undefined}
            onChange={() => {
              if (value) onChange(undefined);
              else onChange(defaultTimeKey);
            }}
          />
        </div>
      </h4>

      {(["monthsLabels", "daysLabels", "hoursLabels"] as Array<keyof TimeSpecification>)
        .filter((timePeriod) => Object.keys(specification[timePeriod] || {}).length > 0)
        .map((timePeriod, index) => (
          <div key={`${mapId}-${timePeriod}`} className="my-3">
            <h5>{t(`time.selector.${timePeriod}`)}</h5>
            <div className="d-flex justify-content-center">
              {Object.keys(specification[timePeriod] || {}).map((timeValue) => (
                <div key={`${mapId}-${timePeriod}-${timeValue}`} className="mx-1">
                  <input
                    type="radio"
                    className={cx("btn-check")}
                    name={timePeriod}
                    id={`${mapId}-${timePeriod}-${timeValue}`}
                    disabled={isNil(value)}
                    checked={isSelected(value, timeValue)}
                    onChange={() => {
                      const newTimeKey = `${value}`.split("|");
                      newTimeKey[index] = timeValue;
                      onChange(newTimeKey.join("|"));
                    }}
                  />
                  <label
                    className={cx(
                      "btn",
                      isSelected(value, timeValue) ? "btn-primary" : "btn-outline-primary text-dark",
                    )}
                    htmlFor={`${mapId}-${timePeriod}-${timeValue}`}
                  >
                    {getI18NText(locale, (specification as any)[timePeriod][timeValue].label)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};
