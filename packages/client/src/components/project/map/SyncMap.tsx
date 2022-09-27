import { FC, PropsWithChildren, useEffect, useState, useMemo } from "react";
import { Map } from "leaflet";
import { ProjectMap, ProjectMapProps } from "./ProjectMap";

function syncPosition(source: Map | null, target: Map | null) {
  if (source && target) {
    target.fitBounds(source.getBounds(), { animate: false, padding: [0, 0] });
  }
}

type SyncMapProps = ProjectMapProps & {
  syncWithMap: Map;
};
export const SyncMap: FC<PropsWithChildren<SyncMapProps>> = ({
  project,
  projectMapId,
  syncWithMap,
  setMap,
  children,
}) => {
  const [localMap, setLocalMap] = useState<Map | null>(null);
  const [whoIsMoving, setWhoIsMoving] = useState<string | null>(null);

  useEffect(() => {
    if (localMap) {
      if (setMap) setMap(localMap);
      localMap.fitBounds(syncWithMap.getBounds());
    }
  }, [localMap, setMap, syncWithMap]);

  /**
   * Listen to movestart/moveend events to know who is moving.
   */
  useEffect(() => {
    const fnLocalStart = () => setWhoIsMoving((prev) => (prev === null ? "local" : prev));
    const fnSyncStart = () => setWhoIsMoving((prev) => (prev === null ? "sync" : prev));
    const fnLocalEnd = () => setWhoIsMoving((prev) => (prev === "local" ? null : prev));
    const fnSyncEnd = () => setWhoIsMoving((prev) => (prev === "sync" ? null : prev));

    if (localMap) {
      localMap.on("movestart", fnLocalStart);
      localMap.on("moveend", fnLocalEnd);
    }
    syncWithMap.on("movestart", fnSyncStart);
    syncWithMap.on("moveend", fnSyncEnd);

    return () => {
      if (localMap) {
        localMap.off("movestart", fnLocalStart);
        localMap.off("moveend", fnLocalEnd);
      }
      syncWithMap.off("movestart", fnSyncStart);
      syncWithMap.off("moveend", fnSyncEnd);
    };
  }, [localMap, syncWithMap]);

  /**
   * Listen on the provided map move event
   * in order to synchronise the viewbox, except when the local map is moving
   */
  useEffect(() => {
    const syncLocal = () => {
      if (whoIsMoving === "sync") syncPosition(syncWithMap, localMap);
    };
    const syncMap = () => {
      if (whoIsMoving === "local") syncPosition(localMap, syncWithMap);
    };

    syncWithMap.on("move", syncLocal);
    if (localMap) localMap.on("move", syncMap);
    return () => {
      syncWithMap.off("move", syncLocal);
      if (localMap) localMap.off("move", syncMap);
    };
  }, [syncWithMap, localMap, whoIsMoving]);

  const displayMap = useMemo(
    () => (
      <ProjectMap setMap={setLocalMap} project={project} projectMapId={projectMapId} center={[0, 0]}>
        {children}
      </ProjectMap>
    ),
    [children, project, projectMapId],
  );

  return <>{displayMap}</>;
};
