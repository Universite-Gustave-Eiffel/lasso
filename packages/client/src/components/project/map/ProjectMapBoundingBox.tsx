import { FC } from "react";
import { Source, Layer } from "react-map-gl";

import { Project } from "@lasso/dataprep";
import { projectBboxToGeometry } from "../../../utils/project";

export const ProjectMapBoundingBox: FC<{ project: Project; type: "border" | "fill" }> = ({ project, type }) => {
  return (
    <>
      <Source
        id={project.id}
        type="geojson"
        data={{
          type: "Feature",
          geometry: projectBboxToGeometry(project),
          properties: { color: project.color, projectId: project.id },
        }}
      >
        {type === "border" && (
          <Layer
            id={`projectsRectangles-${project.id}`}
            type="line"
            source={project.id}
            paint={{
              "line-color": ["get", "color"],
              "line-width": 2,
              "line-opacity": 0.4,
              "line-offset": ["interpolate", ["linear"], ["zoom"], 10, 0, 24, -200],
            }}
          />
        )}

        {type === "fill" && (
          <Layer
            id={`projectsRectangles-${project.id}`}
            type="fill"
            source={project.id}
            paint={{
              "fill-color": ["get", "color"],
              "fill-opacity": 0.4,
            }}
          />
        )}
      </Source>
    </>
  );
};
