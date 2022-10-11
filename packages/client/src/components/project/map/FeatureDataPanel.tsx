import { MapboxGeoJSONFeature } from "mapbox-gl";
import { Project } from "@lasso/dataprep/src/types";
import { FC } from "react";
import { flatten, keys, sortBy } from "lodash";

export const FeatureDataPanel: FC<{ feature: MapboxGeoJSONFeature | null; project: Project }> = ({
  feature,
  project,
}) => {
  const source =
    feature?.layer.source && typeof feature.layer.source === "string"
      ? project.sources[feature?.layer.source]
      : undefined;

  const timelineKeys = flatten(
    keys(source?.timeSeries?.monthsLabels).map((mlKey) => {
      return keys(source?.timeSeries?.daysLabels).map((dlKey) => [mlKey, dlKey].join("|"));
    }),
  );
  const timelineHoursKeys = source?.timeSeries?.hoursLabels
    ? sortBy(
        keys(source.timeSeries.hoursLabels),
        (k) => source.timeSeries!.hoursLabels && source.timeSeries!.hoursLabels[k].hours[0],
      )
    : [];
  console.log(timelineHoursKeys);
  return (
    <div className="map-point-data ">
      {feature && (
        <>
          <h2>Map point data</h2>
          <div className="timelines d-flex flex-column">
            {timelineKeys.map((timelineKey) => {
              return (
                <div className="timeline">
                  {timelineKey}:{" "}
                  {timelineHoursKeys.map((k) => {
                    const hoursKey = `${timelineKey}|${k}`;
                    const hoursLabel = source?.timeSeries?.hoursLabels && source.timeSeries.hoursLabels[k];

                    const hoursValue =
                      feature.properties &&
                      feature.properties[hoursKey] &&
                      feature.properties[hoursKey][feature.layer.id];

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
        </>
      )}
    </div>
  );
};
