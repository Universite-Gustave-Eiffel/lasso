import { FC, CSSProperties, useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

import cx from "classnames";
import { useT } from "@transifex/react";
import { MapProvider } from "react-map-gl";

import { Project } from "@lasso/dataprep";
import { ProjectMap } from "./map/ProjectMap";
import { SyncMaps, SyncMapsModes } from "./map/SyncMaps";
import { LayerSelector } from "./LayerSelector";

export interface ProjectMapsProps {
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
}

export const ProjectMaps: FC<ProjectMapsProps> = ({ id, className, style, project }) => {
  const t = useT();

  const htmlProps = { id, className: cx(className, "d-flex flex-grow-1"), style };

  const [rightMapProjectId, setRightMapProjectId] = useState<string>(project.maps[0].id);
  const [leftMapProjectId, setLeftMapProjectId] = useState<string>(project.maps[0].id);
  const [mode, setMode] = useState<SyncMapsModes>("side-by-side");
  console.log(leftMapProjectId);
  return (
    <div {...htmlProps}>
      <MapProvider>
        <SyncMaps mode={mode} />
        {mode === "single" && (
          <div className="d-flex align-items-stretch justify-content-center" style={{ width: "2em" }}>
            <button
              className="btn btn-light p-0"
              title={t("map.mode-side-by-side")}
              onClick={() => setMode("side-by-side")}
            >
              <BsChevronRight />
            </button>
          </div>
        )}
        {mode === "side-by-side" && (
          <>
            <div className={cx("d-flex flex-column flex-grow-1")} style={{ width: "calc(50% - 1em)" }}>
              <LayerSelector setProjectMapId={setLeftMapProjectId} projectMapId={leftMapProjectId} project={project} />
              <ProjectMap id="leftMap" projectMapId={leftMapProjectId} project={project}></ProjectMap>
            </div>

            <div className="d-flex align-items-stretch justify-content-center" style={{ width: "2em" }}>
              <button className="btn btn-light p-0" title={t("map.mode-single")} onClick={() => setMode("single")}>
                <BsChevronLeft />
              </button>
            </div>
          </>
        )}
        <div
          className={cx("d-flex flex-column flex-grow-1")}
          style={{ width: mode === "single" ? "calc(100% - 2em)" : "calc(50% - 1em)" }}
        >
          <LayerSelector setProjectMapId={setRightMapProjectId} projectMapId={rightMapProjectId} project={project} />
          <ProjectMap
            id="rightMap"
            project={project}
            projectMapId={rightMapProjectId}
            bounds={project.bbox}
          ></ProjectMap>
        </div>
      </MapProvider>
    </div>
  );
};
