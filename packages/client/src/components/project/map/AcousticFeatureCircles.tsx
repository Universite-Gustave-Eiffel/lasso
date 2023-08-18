import { FC } from "react";
import { toNumber, isNil } from "lodash";
import { Feature } from "geojson";
import { useT } from "@transifex/react";

import { getVariableColor } from "../../../utils/project";
import { useCurrentProject } from "../../../hooks/useCurrentProject";
import { AcousticCircle } from "../../AcousticCircle";

export const AcousticFeatureCircles: FC<{ feature: Feature; currentTimeKey?: string | null }> = ({
  feature,
  currentTimeKey,
}) => {
  const t = useT();
  const { project } = useCurrentProject();

  const circlesData = ["birds", "trafic", "voices", "soundlevel"]
    .filter((name) => project.lassoVariables[`acoustic_${name}`])
    .map((name) => {
      const variable = project.lassoVariables[`acoustic_${name}`];
      const symbolSpec = project.data.legendSpecs[variable.variable];

      let value = undefined;
      if (feature.properties) {
        // default is the generic value
        if (!isNil(feature.properties[variable.variable])) value = toNumber(feature.properties[variable.variable]);
        // if time is specified, we try to get it
        if (
          currentTimeKey &&
          feature.properties[currentTimeKey] &&
          !isNil(feature.properties[currentTimeKey][variable.variable])
        )
          value = toNumber(feature.properties[currentTimeKey][variable.variable]);
      }

      return {
        icon: symbolSpec?.icon,
        color: value ? getVariableColor(project.data, variable, value) : "#CCC",
        value,
        min: variable.minimumValue,
        max: variable.maximumValue,
        label: `${t(`variable.${variable.variable}`)}`,
      };
    });

  return (
    <div className="acoustic-panel">
      <h6>{t("Perceiced Sound Sources")}</h6>
      <div className="acoustic-circles">
        {circlesData.map((data, index) => (
          <AcousticCircle key={index} {...data} />
        ))}
      </div>
    </div>
  );
};
