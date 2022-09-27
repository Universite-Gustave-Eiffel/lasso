import { FC, CSSProperties, useState, useEffect } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Map } from "leaflet";
import cx from "classnames";
import { useT } from "@transifex/react";

import { Project } from "@lasso/dataprep";
import { ProjectMap } from "./map/ProjectMap";
import { SyncMap } from "./map/SyncMap";
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
  const [primaryMap, setPrimaryMap] = useState<Map | null>(null);
  const [primaryMapProjectId, setPrimaryMapProjectId] = useState<string | null>(null);
  const [secondaryMap, setSecondaryMap] = useState<Map | null>(null);
  const [secondaryMapProjectId, setSecondaryMapProjectId] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "side-by-side">("side-by-side");

  /**
   * When mode change
   * => invalidate  maps size
   * => remove 2nd map in state
   */
  useEffect(() => {
    if (mode === "single") {
      if (primaryMap) primaryMap.invalidateSize();
      setSecondaryMap(null);
    } else {
      if (primaryMap) primaryMap.invalidateSize();
      if (secondaryMap) secondaryMap.invalidateSize();
    }
  }, [mode, primaryMap, secondaryMap]);

  return (
    <div {...htmlProps}>
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
      {mode === "side-by-side" && primaryMap && (
        <>
          <div className={cx("d-flex flex-column flex-grow-1")} style={{ width: "calc(50% - 1em)" }}>
            {secondaryMap && <LayerSelector setProjectMapId={setSecondaryMapProjectId} project={project} />}
            <SyncMap
              setMap={setSecondaryMap}
              projectMapId={secondaryMapProjectId}
              syncWithMap={primaryMap}
              project={project}
            ></SyncMap>
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
        {primaryMap && <LayerSelector setProjectMapId={setPrimaryMapProjectId} project={project} />}
        <ProjectMap
          project={project}
          setMap={setPrimaryMap}
          projectMapId={primaryMapProjectId}
          bounds={project.bbox}
        ></ProjectMap>
      </div>
    </div>
  );
};
