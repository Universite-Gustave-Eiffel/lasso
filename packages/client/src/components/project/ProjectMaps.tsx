import { FC, CSSProperties, useState } from "react";
import { Map } from "leaflet";

import { Project } from "@lasso/dataprep";
import { PrimaryMap } from "./map/PrimaryMap";
import { SyncMap } from "./map/SyncMap";

export interface ProjectMapProps {
  /**
   * HTML id
   */
  id?: string;
  /**
   * HTML class
   */
  className?: string;
  /**
   * HTML CSS style
   */
  style?: CSSProperties;
  /**
   * The corpus to display
   */
  project: Project;
  /**
   * Mode : single / side-by-side
   */
  mode: "single" | "side-by-side";
}

export const ProjectMaps: FC<ProjectMapProps> = ({ id, className, style, project, mode = "single" }) => {
  const htmlProps = { id, className, style };
  const [map, setMap] = useState<Map | null>(null);
  console.log(project);

  return (
    <div {...htmlProps}>
      <PrimaryMap setMap={setMap} />
      {mode === "side-by-side" && map && <SyncMap map={map} />}
    </div>
  );
};
