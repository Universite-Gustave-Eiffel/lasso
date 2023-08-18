import { FC, CSSProperties, useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import cx from "classnames";
import { useT } from "@transifex/react";
import { MapProvider } from "react-map-gl/maplibre";

import { ProjectMap } from "./map/ProjectMap";
import { SyncMaps } from "./map/SyncMaps";
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
}

export const ProjectMaps: FC<ProjectMapsProps> = ({ id, className, style }) => {
  const t = useT();
  const htmlProps = { id, className: cx(className, "d-flex flex-grow-1"), style };
  const [mode, setMode] = useState<"side-by-side" | "single">("side-by-side");

  return (
    <div {...htmlProps}>
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
              <LayerSelector mapId="left" />
              <ProjectMap mapId="left" />
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
          <LayerSelector mapId="right" />
          <ProjectMap mapId="right" />
        </div>
      </MapProvider>
    </div>
  );
};
