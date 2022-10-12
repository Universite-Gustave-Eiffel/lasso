import { flatten, keys, sortBy } from "lodash";
import { TimeSpecification } from "@lasso/dataprep/src/types";
import { MapboxGeoJSONFeature } from "mapbox-gl";
import { FC } from "react";

interface FeatureDataTimelineProps {
  feature: MapboxGeoJSONFeature;
  timeSpecification: TimeSpecification;
}

export const FeatureDataTimeline: FC<FeatureDataTimelineProps> = ({ feature, timeSpecification }) => {
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
                feature.properties && feature.properties[hoursKey] && feature.properties[hoursKey][feature.layer.id];

              if (hoursLabel)
                return (
                  <span key={k}>
                    {hoursLabel.label.fr}: {hoursValue || "N/A"}
                  </span>
                );
              else return <></>;
            })}
          </div>
        );
      })}
    </div>
  );
};
