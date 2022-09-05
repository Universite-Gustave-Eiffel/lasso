import { FC, CSSProperties, useState } from "react";
import { Map } from "leaflet";
import cx from "classnames";

import { Project } from "@lasso/dataprep";
import { PrimaryMap } from "./map/PrimaryMap";
import { SyncMap } from "./map/SyncMap";
import { LayerSelector } from "./LayerSelector";

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
  const htmlProps = { id, className: cx(className, "row"), style };
  const [primaryMap, setPrimaryMap] = useState<Map | null>(null);
  const [secondaryMap, setSecondaryMap] = useState<Map | null>(null);

  return (
    <div {...htmlProps}>
      <div className={cx(mode === "side-by-side" ? "col-6" : "col-12")}>
        {primaryMap && <LayerSelector map={primaryMap} project={project} />}
        <PrimaryMap setMap={setPrimaryMap}></PrimaryMap>
      </div>
      {mode === "side-by-side" && primaryMap && (
        <div className="col-6">
          {secondaryMap && <LayerSelector map={secondaryMap} project={project} />}
          <SyncMap setMap={setSecondaryMap} syncWithMap={primaryMap}></SyncMap>
        </div>
      )}
    </div>
  );
};
