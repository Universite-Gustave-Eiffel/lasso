import { FC, useEffect, useState } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl";
import maplibregl from "maplibre-gl";

import { ExportedData, Project, BBOX } from "@lasso/dataprep";
import { Geometry } from "geojson";

interface MapProperties {
  bbox: ExportedData["bbox"];
  projects: Array<Project>;
  selected: Project | null;
  setSelected: (p: Project | null) => void;
}

function rectangle(bbox: BBOX): Geometry {
  return {
    type: "Polygon",
    coordinates: [[bbox[1], [bbox[0][0], bbox[1][1]], bbox[0], [bbox[1][0], bbox[0][1]], bbox[1]]],
  };
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
    <Map mapLib={maplibregl} ref={setMap}>
      <Source id="osm" type="raster" tiles={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}>
        <Layer id="basemap" type="raster" source="osm" />
      </Source>
      <Source
        id="projects"
        type="geojson"
        data={{
          type: "FeatureCollection",
          features: projects.map((project) => ({
            type: "Feature",
            geometry: rectangle(project.bbox),
            properties: { color: project.color, projectId: project.id },
          })),
        }}
      >
        <Layer
          id="projectsRectangles"
          type="fill"
          source="projects"
          paint={{ "fill-color": ["get", "color"], "fill-opacity": 0.4 }}
        />
      </Source>
    </Map>
  );
};
