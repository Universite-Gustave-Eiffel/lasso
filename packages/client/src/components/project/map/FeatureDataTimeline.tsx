import { toPairs, values } from "lodash";
import { TimeSpecification } from "@lasso/dataprep";
import { Dispatch, FC, SetStateAction } from "react";
import { Feature } from "geojson";
import { DonutDay } from "./DonutDay";
import { useLocale, useT } from "@transifex/react";

interface FeatureDataTimelineProps {
  feature: Feature;
  timeSpecification: TimeSpecification;
  setCurrentTimeKey: Dispatch<SetStateAction<string | null>>;
  currentTimeKey: string | null;
  layerId: string;
}

const translateLabel = (label: Record<"fr" | "en", string>, locale: any): string =>
  ["fr", "en"].includes(locale) ? label[locale as "fr" | "en"] : values(label)[0];

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
              {/* TODO: retrieve current language in transiflex or context ? */}
              <label>{translateLabel(monthLabel.label, locale)}</label>
              <div className="d-flex">
                {toPairs(timeSpecification.daysLabels).map(([dayKey, dayLabel]) => {
                  return (
                    <div key={dayKey} className="timeline">
                      <label>{translateLabel(dayLabel.label, locale)}</label>
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
