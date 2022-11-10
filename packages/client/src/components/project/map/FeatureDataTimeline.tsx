import { flatten, keys } from "lodash";
import { TimeSpecification } from "@lasso/dataprep";
import { FC } from "react";
import { Feature } from "geojson";
import { DonutDay } from "./DonutDay";

interface FeatureDataTimelineProps {
  feature: Feature;
  timeSpecification: TimeSpecification;
  setCurrentTimeKey: (timeKey: string | null) => void;
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
  const timelineKeys = flatten(
    keys(timeSpecification.monthsLabels).map((mlKey) => {
      return keys(timeSpecification.daysLabels).map((dlKey) => [mlKey, dlKey].join("|"));
    }),
  );

  return (
    <div className="timelines d-flex flex-wrap">
      {timelineKeys.map((timelineKey) => {
        return (
          <div key={timelineKey} className="timeline">
            <div>{timelineKey}</div>
            <DonutDay
              timelineKey={timelineKey}
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
  );
};
