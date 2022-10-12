import { flatten, keys, sortBy } from "lodash";
import { TimeSpecification } from "@lasso/dataprep/src/types";
import { FC } from "react";
import { Feature } from "geojson";

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
  const timelineHoursKeys = timeSpecification.hoursLabels
    ? sortBy(
        keys(timeSpecification.hoursLabels),
        (k) => timeSpecification!.hoursLabels && timeSpecification!.hoursLabels[k].hours[0],
      )
    : [];

  return (
    <div className="timelines d-flex flex-column">
      {timelineKeys.map((timelineKey) => {
        return (
          <div key={timelineKey} className="timeline">
            {timelineKey}:{" "}
            {timelineHoursKeys.map((k) => {
              const hoursKey = `${timelineKey}|${k}`;
              const hoursLabel = timeSpecification.hoursLabels && timeSpecification.hoursLabels[k];

              const hoursValue =
                feature.properties && feature.properties[hoursKey] && feature.properties[hoursKey][layerId];

              if (hoursLabel)
                return (
                  <button
                    className={`btn btn-small ${hoursKey === currentTimeKey ? "active" : ""}`}
                    key={k}
                    onClick={() => setCurrentTimeKey(hoursKey)}
                  >
                    {hoursLabel.label.fr}: {hoursValue || "N/A"}
                  </button>
                );
              else return <></>;
            })}
          </div>
        );
      })}
    </div>
  );
};
