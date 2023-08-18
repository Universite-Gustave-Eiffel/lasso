import { FC, useEffect, useState } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/maplibre";

import { ExportedData, Project } from "@lasso/dataprep";
import { ProjectMapBoundingBox } from "../project/map/ProjectMapBoundingBox";

interface MapProperties {
  bbox: ExportedData["bbox"];
  projects: Array<Project>;
  selected: Project | null;
  setSelected: (p: Project | null) => void;
}

export const ProjectsMap: FC<MapProperties> = ({ bbox, projects, setSelected, selected }) => {
  const [map, setMap] = useState<MapRef | null>(null);

  useEffect(() => {
    if (map) {
      map.on("click", "projectsRectangles", (e) => {
        if (e.features) {
          const selectedProjects = projects.find((p) =>
            (e.features?.map((f) => f.properties?.projectId) || []).includes(p.id),
          );
          setSelected(selectedProjects || null);
        }
      });
      map.on("mouseenter", "projectsRectangles", function () {
        map.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.on("mouseleave", "projectsRectangles", function () {
        map.getCanvas().style.cursor = "";
      });
    }
  }, [map, setSelected, projects]);

  useEffect(() => {
    if (map) {
      map.fitBounds(selected ? selected.bbox : bbox);
    }
  }, [selected, map, bbox]);

  return (
    <Map ref={setMap}>
      <Source id="osm" type="raster" tiles={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}>
        <Layer id="basemap" type="raster" source="osm" />
      </Source>
      {projects.map((project) => (
        <ProjectMapBoundingBox key={project.id} project={project} type="fill" />
      ))}
    </Map>
  );
};
