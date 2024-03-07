import { FC, useState } from "react";
import { BsClockHistory } from "react-icons/bs";
import { useLocale, useT } from "@transifex/react";
import cx from "classnames";

import { TimeSpecification } from "@lasso/dataprep";
import { useCurrentProject } from "../../../hooks/useCurrentProject";
import { getI18NTimekey } from "../../../utils/i18n";
import { MapControl } from "../../MapControl";
import { TimeSelector } from "../../TimeSelector";
import { ParentPopin } from "../../ParentPopin";

export const TimeSelectorControl: FC<{ mapId: "left" | "right" }> = ({ mapId }) => {
  const t = useT();
  const locale = useLocale();
  const { project, setProjectMapTime } = useCurrentProject();
  const [opened, setOpened] = useState<boolean>(false);
  const projectMap = project.maps[mapId];

  return (
    <>
      {projectMap.timeSpecification && (
        <>
          <MapControl id="reset">
            <button
              className={cx(projectMap.timeKey && "bg-warning")}
              title={
                projectMap.timeKey
                  ? `${t("Current time selection")} : ${getI18NTimekey(
                      locale,
                      projectMap.timeSpecification,
                      projectMap.timeKey,
                    )}`
                  : t("Display time selector")
              }
              onClick={() => setOpened(true)}
            >
              <BsClockHistory size="1.5em" />
            </button>
          </MapControl>

          {opened && (
            <ParentPopin close={() => setOpened(false)}>
              <TimeSelector
                mapId={mapId}
                value={projectMap.timeKey ?? undefined}
                onChange={(value) => setProjectMapTime(mapId, value)}
                specification={projectMap.timeSpecification as TimeSpecification}
              />

              <div className="d-flex justify-content-center mt-3 p-3">
                <button type="button" className="btn btn-secondary" onClick={() => setOpened(false)}>
                  {t("Close")}
                </button>
              </div>
            </ParentPopin>
          )}
        </>
      )}
    </>
  );
};
