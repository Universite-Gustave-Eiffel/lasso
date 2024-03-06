import { toPairs } from "lodash";
import { FC } from "react";
import { Feature } from "geojson";
import { useLocale, useT } from "@transifex/react";

import { TimeSpecification } from "@lasso/dataprep";
import { getI18NText } from "../../../utils/i18n";
import { ProjectLayerVariable } from "../../../utils/project";
import { DonutDay } from "./DonutDay";

const DEFAULT_MONTHS = {
  default: {
    label: "Default",
    months: [],
  },
};
const DEFAULT_DAYS = {
  default: {
    label: "Default",
    days: [],
  },
};
interface FeatureDataTimelineProps {
  feature: Feature;
  timeSpecification: TimeSpecification;
  setCurrentTimeKey: (timeKey?: string) => void;
  currentTimeKey?: string | null;
  mapVariable: ProjectLayerVariable;
}

export const FeatureDataTimeline: FC<FeatureDataTimelineProps> = ({
  feature,
  timeSpecification,
  setCurrentTimeKey,
  currentTimeKey,
  mapVariable,
}) => {
  const t = useT();
  const locale = useLocale();

  return (
    <div className="timelines-panel">
      <h6>{t("Over time")}</h6>
      <div className="timelines">
        {/* TODO: handle cases where no monthsLabel */}
        {toPairs(timeSpecification.monthsLabels || DEFAULT_MONTHS).map(([monthKey, monthLabel]) => {
          return (
            <div className="season d-flex justify-content-center flex-column" key={monthKey}>
              {monthKey !== "default" && (
                <label className="text-center my-2">{getI18NText(locale, monthLabel.label)}</label>
              )}
              <div className="d-flex">
                {toPairs(timeSpecification.daysLabels || DEFAULT_DAYS).map(([dayKey, dayLabel]) => {
                  return (
                    <div key={dayKey} className="timeline">
                      {dayKey !== "default" && <label>{getI18NText(locale, dayLabel.label)}</label>}
                      <DonutDay
                        timelineKeys={[monthKey, dayKey].filter((e) => e !== "default")}
                        feature={feature}
                        timeSpecification={timeSpecification}
                        setCurrentTimeKey={setCurrentTimeKey}
                        currentTimeKey={currentTimeKey}
                        mapVariable={mapVariable}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
