import { FC, Fragment } from "react";
import { Feature } from "geojson";
import { keys, round, sortBy } from "lodash";

import { TimeSpecification } from "@lasso/dataprep";
import withSize, { SizeState } from "../../WithSize";
import { ProjectLayerVariable } from "../../../utils/project";
import { useCurrentProject } from "../../../hooks/useCurrentProject";

export interface DonutDayProps {
  timelineKey: string;
  timeSpecification: TimeSpecification;
  feature: Feature;
  setCurrentTimeKey: (timeKey?: string) => void;
  currentTimeKey?: string | null;
  mapVariable: ProjectLayerVariable;
}

const PRECISION = 4;

const xStart = (radius: number, offset: number) => round(Math.cos(offset) * radius, PRECISION);
const yStart = (radius: number, offset: number) => -round(Math.sin(offset) * radius, PRECISION);

const getCircleSlicePath = function (radius: number, angle: number, offset: number): string {
  return (
    `M ${xStart(radius, offset)},${yStart(radius, offset)} ` +
    `A ${radius},${radius},` +
    `0,${angle > Math.PI ? 1 : 0},0,` +
    `${round(Math.cos(offset + angle) * radius, PRECISION)},${-round(Math.sin(offset + angle) * radius, PRECISION)}`
  );
};

interface DonutSegment {
  color: string;
  key: string;
  label: string;
  selected: boolean;
  anglePosition: number;
  angleSize: number;
  startHour: number;
}

export const DonutChart = withSize<{ segments: DonutSegment[]; onClick: (key: string) => void } & SizeState>(
  ({ segments, height, onClick }) => {
    const radius = height / 2 - 28;
    // TODO: use variables for margins
    return (
      <svg width={height} height={height}>
        <g transform={`translate(${height / 2} ${height / 2}) scale(-1 1)`}>
          {segments.map((segment) => (
            <Fragment key={segment.key}>
              <path
                style={{ cursor: "pointer" }}
                key={segment.key}
                d={getCircleSlicePath(radius, segment.angleSize, segment.anglePosition)}
                stroke={segment.color}
                strokeWidth={segment.selected ? 15 : 8}
                fill={"transparent"}
                onClick={() => onClick(segment.key)}
              >
                <title>{segment.label}</title>
              </path>
            </Fragment>
          ))}
        </g>
        <g transform={`translate(${height / 2} ${height / 2})`}>
          {segments.map((segment) => {
            const x = -xStart(radius + 18, segment.anglePosition);
            const y = yStart(radius + 18, segment.anglePosition);
            return (
              <text key={segment.key} x={x} dy={y} textAnchor={x > 0 && y > 0 ? "middle" : "start"}>
                {segment.startHour}h
              </text>
            );
          })}
        </g>
      </svg>
    );
  },
);

//TODO: move those into DonutChart
const hoursInAngle = (hours: number): number => {
  // 0 is middle right
  // we want 24h middle bottom
  // => offset 1.5 * PI
  return (nbHoursInAngle(hours) + 1.5 * Math.PI) % (2 * Math.PI);
};

const nbHoursInAngle = (nbHours: number): number => {
  // 24 => 2*PI
  return (nbHours * 2 * Math.PI) / 24;
};

export const DonutDay: FC<DonutDayProps> = ({
  timelineKey,
  timeSpecification,
  feature,
  setCurrentTimeKey,
  currentTimeKey,
  mapVariable,
}) => {
  const { project } = useCurrentProject();
  const variable = mapVariable.variable;

  const timelineHoursKeys = timeSpecification.hoursLabels
    ? sortBy(
        keys(timeSpecification.hoursLabels),
        (k) => timeSpecification!.hoursLabels && timeSpecification!.hoursLabels[k].hours[0],
      )
    : [];
  const segments: DonutSegment[] = timelineHoursKeys
    .map((k) => {
      const hoursKey = `${timelineKey}|${k}`;
      const hoursLabel = timeSpecification.hoursLabels && timeSpecification.hoursLabels[k];

      const hoursValue = feature.properties && feature.properties[hoursKey] && feature.properties[hoursKey][variable];
      const color =
        project &&
        project.data.legendSpecs &&
        project.data.legendSpecs[variable]?.colorStyleExpression?.evaluate(
          { zoom: 14 },
          { type: feature.type, geometry: feature.geometry, properties: { [variable]: hoursValue } },
        );

      if (hoursLabel) {
        const duration =
          hoursLabel.hours[1] - hoursLabel.hours[0] + (hoursLabel.hours[1] <= hoursLabel.hours[0] ? 24 : 0) + 1;
        const segment: DonutSegment = {
          key: hoursKey,
          color: color || "lightgrey",
          anglePosition: hoursInAngle(hoursLabel.hours[0]),
          angleSize: nbHoursInAngle(duration) - 0.1,
          selected: hoursKey === currentTimeKey,
          startHour: hoursLabel.hours[0],
          label: `${hoursLabel.label.fr}: ${hoursValue || "N/A"}`,
        };
        return segment;
      } else return null;
    })
    .filter((s): s is DonutSegment => !!s);

  return (
    <div className="donut-day">
      <DonutChart
        wrapperClassName="donut-chart"
        segments={segments}
        onClick={(hoursKey: string) => {
          setCurrentTimeKey(currentTimeKey === hoursKey ? undefined : hoursKey);
        }}
      />
    </div>
  );
};
