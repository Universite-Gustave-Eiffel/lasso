import { FC, CSSProperties, useState, useEffect, useRef } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

import cx from "classnames";
import { useT } from "@transifex/react";
import { MapProvider, MapRef, useMap } from "react-map-gl";

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
  const { rightmap, leftmap, current } = useMap();
  const rightMap = useRef<MapRef>(null);
  const leftMap = useRef<MapRef>(null);
  const [primaryMapProjectId, setPrimaryMapProjectId] = useState<string | null>(project.maps[0].id);

  const [secondaryMapProjectId, setSecondaryMapProjectId] = useState<string | null>(project.maps[0].id);
  const [mode, setMode] = useState<"single" | "side-by-side">("side-by-side");

  useEffect(() => {
    console.log(rightmap, leftmap, current);
  }, [rightmap, leftmap, current]);

  /**
   * When mode change
   * => invalidate  maps size
   * => remove 2nd map in state
   */
  useEffect(() => {
    if (mode === "single") {
      if (rightMap && rightMap.current) rightMap.current.resize();
      //if (leftmap) leftmap.resize();
    } else {
      if (rightMap && rightMap.current) rightMap.current.resize();
      if (leftMap && leftMap.current) leftMap.current.resize();
    }
  }, [mode, rightMap, leftMap]);

  return (
    <div {...htmlProps}>
      <MapProvider>
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
              <LayerSelector setProjectMapId={setSecondaryMapProjectId} project={project} />
              <SyncMap
                id="leftmap"
                refMap={leftMap}
                syncMap={rightMap}
                projectMapId={secondaryMapProjectId}
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
          <LayerSelector setProjectMapId={setPrimaryMapProjectId} project={project} />
          <ProjectMap
            id="rightmap"
            refMap={rightMap}
            project={project}
            projectMapId={primaryMapProjectId}
            bounds={project.bbox}
          ></ProjectMap>
        </div>
      </MapProvider>
    </div>
  );
};
