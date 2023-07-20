import { toPairs } from "lodash";
import { Dispatch, FC, SetStateAction } from "react";
import { Feature } from "geojson";
import { useLocale, useT } from "@transifex/react";

import { TimeSpecification } from "@lasso/dataprep";
import { DonutDay } from "./DonutDay";
import { getI18NText } from "../../../utils/i18n";

interface FeatureDataTimelineProps {
  feature: Feature;
  timeSpecification: TimeSpecification;
  setCurrentTimeKey: Dispatch<SetStateAction<string | null>>;
  currentTimeKey: string | null;
  layerId: string;
}

export const FeatureDataTimeline: FC<FeatureDataTimelineProps> = ({
  feature,
  timeSpecification,
  setCurrentTimeKey,
  currentTimeKey,
  layerId,
}) => {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="timelines-panel">
      <h6>{t("viz-panel.time")}</h6>
      <div className="timelines">
        {/* TODO: handle cases where no monthsLabel */}
        {toPairs(timeSpecification.monthsLabels).map(([monthKey, monthLabel]) => {
          return (
            <div className="season" key={monthKey}>
              <label>{getI18NText(locale, monthLabel.label)}</label>
              <div className="d-flex">
                {toPairs(timeSpecification.daysLabels).map(([dayKey, dayLabel]) => {
                  return (
                    <div key={dayKey} className="timeline">
                      <label>{getI18NText(locale, dayLabel.label)}</label>
                      <DonutDay
                        timelineKey={`${monthKey}|${dayKey}`}
                        feature={feature}
                        timeSpecification={timeSpecification}
                        setCurrentTimeKey={setCurrentTimeKey}
                        currentTimeKey={currentTimeKey}
                        layerId={layerId}
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
