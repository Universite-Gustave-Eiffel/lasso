import { FC, useEffect, useState } from "react";
import { MapContainer, TileLayer, Rectangle } from "react-leaflet";
import { Map } from "leaflet";

import { ExportedData, Project } from "@lasso/dataprep";

interface MapProperties {
  bbox: ExportedData["bbox"];
  projects: Array<Project>;
  selected: Project | null;
  setSelected: (p: Project | null) => void;
}
export const ProjectsMap: FC<MapProperties> = ({ bbox, projects, setSelected, selected }) => {
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (map) map.fitBounds(selected ? selected.bbox : bbox);
  }, [selected, map, bbox]);

  return (
    <MapContainer bounds={bbox} ref={setMap}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {projects.map((project) => (
        <Rectangle
          eventHandlers={{
            click() {
              setSelected(project);
            },
          }}
          key={project.id}
          bounds={project.bbox}
          pathOptions={{ color: project.color }}
        />
      ))}
    </MapContainer>
  );
};
