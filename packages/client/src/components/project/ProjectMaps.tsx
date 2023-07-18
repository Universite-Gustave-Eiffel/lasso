import { FC, CSSProperties, useState, useEffect } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

import cx from "classnames";
import { useT } from "@transifex/react";
import { MapProvider } from "react-map-gl";

import { ProjectMap } from "./map/ProjectMap";
import { SyncMaps, SyncMapsModes } from "./map/SyncMaps";
import { LayerSelector } from "./LayerSelector";
import { useCurrentProject } from "../../hooks/useProject";

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
}

export const ProjectMaps: FC<ProjectMapsProps> = ({ id, className, style }) => {
  const t = useT();
  const { project } = useCurrentProject();

  const htmlProps = { id, className: cx(className, "d-flex flex-grow-1"), style };

  const [rightMapProjectId, setRightMapProjectId] = useState<string | undefined>(project?.maps[0].id);
  const [leftMapProjectId, setLeftMapProjectId] = useState<string | undefined>(project?.maps[0].id);
  const [mode, setMode] = useState<SyncMapsModes>("side-by-side");

  useEffect(() => {
    if (project) {
      setRightMapProjectId(project?.maps[0].id);
      setLeftMapProjectId(project?.maps[1].id);
    }
  }, [project, setRightMapProjectId, setLeftMapProjectId]);

  return (
    <div {...htmlProps}>
      {project && (
        <MapProvider>
          <SyncMaps mode={mode} />
          {mode === "single" && (
            <div className="d-flex align-items-stretch justify-content-center bg-primary ml-0" style={{ width: "2em" }}>
              <button
                className="btn btn-primary p-0 rounded-0"
                title={t("map.mode-side-by-side")}
                onClick={() => setMode("side-by-side")}
              >
                <BsChevronRight size="2rem" />
              </button>
            </div>
          )}
          {mode === "side-by-side" && (
            <>
              <div className={cx("d-flex flex-column flex-grow-1")} style={{ width: "calc(50% - 1em)" }}>
                <LayerSelector
                  setProjectMapId={setLeftMapProjectId}
                  projectMapId={leftMapProjectId}
                  project={project}
                />
                <ProjectMap id="leftMap" projectMapId={leftMapProjectId}></ProjectMap>
              </div>

              <div className="d-flex align-items-stretch justify-content-center bg-primary" style={{ width: "2em" }}>
                <button
                  className="btn btn-primary rounded-0 p-0"
                  title={t("map.mode-single")}
                  onClick={() => setMode("single")}
                >
                  <BsChevronLeft size="2rem" />
                </button>
              </div>
            </>
          )}
          <div
            className={cx("d-flex flex-column flex-grow-1")}
            style={{ width: mode === "single" ? "calc(100% - 2em)" : "calc(50% - 1em)" }}
          >
            <LayerSelector project={project} setProjectMapId={setRightMapProjectId} projectMapId={rightMapProjectId} />
            <ProjectMap id="rightMap" projectMapId={rightMapProjectId} bounds={project.bbox}></ProjectMap>
          </div>
        </MapProvider>
      )}
    </div>
  );
};
