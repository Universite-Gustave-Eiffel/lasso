import { FC, PropsWithChildren, useEffect, useState, useMemo, Ref } from "react";

import { ProjectMap, ProjectMapProps } from "./ProjectMap";
import { useMap, MapRef } from "react-map-gl";

function syncPosition(source: MapRef | undefined, target: MapRef | undefined) {
  if (source && target) {
    target.fitBounds(source.getBounds(), { animate: false, padding: 0 });
  }
}
type SyncMapProps = ProjectMapProps & {
  syncMap: Ref<MapRef>;
};

export const SyncMap: FC<PropsWithChildren<SyncMapProps>> = ({
  id: mapId,
  project,
  projectMapId,
  children,
  refMap,
}) => {
  //const [leftmap, setLocalMap] = useState<Map | null>(null);
  const [whoIsMoving, setWhoIsMoving] = useState<string | null>(null);
  const { leftmap, rightmap } = useMap();

  useEffect(() => {
    if (leftmap && rightmap) {
      leftmap.fitBounds(rightmap.getBounds());
    }
  }, [leftmap, rightmap]);

  /**
   * Listen to movestart/moveend events to know who is moving.
   */
  useEffect(() => {
    const fnLocalStart = () => setWhoIsMoving((prev) => (prev === null ? "local" : prev));
    const fnSyncStart = () => setWhoIsMoving((prev) => (prev === null ? "sync" : prev));
    const fnLocalEnd = () => setWhoIsMoving((prev) => (prev === "local" ? null : prev));
    const fnSyncEnd = () => setWhoIsMoving((prev) => (prev === "sync" ? null : prev));

    if (leftmap) {
      leftmap.on("movestart", fnLocalStart);
      leftmap.on("moveend", fnLocalEnd);
    }
    if (rightmap) {
      rightmap.on("movestart", fnSyncStart);
      rightmap.on("moveend", fnSyncEnd);
    }
    return () => {
      if (leftmap) {
        leftmap.off("movestart", fnLocalStart);
        leftmap.off("moveend", fnLocalEnd);
      }
      if (rightmap) {
        rightmap.off("movestart", fnSyncStart);
        rightmap.off("moveend", fnSyncEnd);
      }
    };
  }, [leftmap, rightmap]);

  /**
   * Listen on the provided map move event
   * in order to synchronise the viewbox, except when the local map is moving
   */
  useEffect(() => {
    const syncLocal = () => {
      if (whoIsMoving === "sync") syncPosition(rightmap, leftmap);
    };
    const syncMap = () => {
      if (whoIsMoving === "local") syncPosition(leftmap, rightmap);
    };

    if (rightmap) rightmap.on("move", syncLocal);
    if (leftmap) leftmap.on("move", syncMap);
    return () => {
      if (rightmap) rightmap.off("move", syncLocal);
      if (leftmap) leftmap.off("move", syncMap);
    };
  }, [rightmap, leftmap, whoIsMoving]);

  const displayMap = useMemo(
    () => (
      <ProjectMap id={mapId} refMap={refMap} project={project} projectMapId={projectMapId} center={[0, 0]}>
        {children}
      </ProjectMap>
    ),
    [children, mapId, project, projectMapId],
  );

  return <>{displayMap}</>;
};
