import { FC, useMemo } from "react";
import { toNumber } from "lodash";
import { Feature } from "geojson";
import { useT } from "@transifex/react";
import cx from "classnames";

import { LoadedProject, useCurrentProject } from "../../../hooks/useProject";
import { getProjectVariables, getVariableColor, ProjectLayerVariable } from "../../../utils/project";

const AcousticCircle: FC<{
  project: LoadedProject;
  variable: ProjectLayerVariable;
  feature: Feature;
}> = ({ project, variable, feature }) => {
  const t = useT();

  const symbolSpec = project.legendSpecs[variable.variable];
  const value =
    feature?.properties && feature.properties[variable.variable]
      ? toNumber(feature.properties[variable.variable])
      : undefined;
  const color = value ? getVariableColor(project, variable, value) : "#CCC";
  const percent = value ? (value / variable.maximumValue) * 100 : 0;

  return (
    <div className={cx("d-flex align-items-center p-1", !value && "opacity-25")}>
      <div
        className={`acoustic-circle`}
        style={{
          backgroundImage: `linear-gradient(0deg, ${color} 0%, ${color} ${percent}%, rgba(255,255,255,0) ${percent}%)`,
        }}
        title={`${t(`variable.${variable.variable}`)} : ${value || t("no data")}`}
      >
        {symbolSpec && symbolSpec.icon ? symbolSpec.icon({ className: "icon", size: "2em" }) : null}
      </div>
      <label className="d-flex flex-column ms-1">
        <div>{t(`variable.${variable.variable}`)}</div>
        <div>{value ? value.toFixed(2) : "?"}</div>
      </label>
    </div>
  );
};

export const AcousticFeatureCircles: FC<{ feature: Feature }> = ({ feature }) => {
  const t = useT();
  const { project } = useCurrentProject();

  const variables = useMemo(() => {
    if (project) return getProjectVariables(project);
    return {};
  }, [project]);

  return (
    <>
      {project && (
        <div className="acoustic-panel">
          <h6>{t("Perceiced Sound Sources")}</h6>
          <div className="acoustic-circles">
            {["birds", "trafic", "voices", "soundlevel"].map((name) => (
              <AcousticCircle key={name} project={project} variable={variables[`acoustic_${name}`]} feature={feature} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
