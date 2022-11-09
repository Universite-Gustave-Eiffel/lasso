import { FC } from "react";
import { Feature } from "geojson";

import { useCurrentProject } from "../../../hooks/useProject";
import { LegendSpecType } from "../../../utils/legend";
import { useT } from "@transifex/react";

const circleSize = "50px";

const AcousticCircle: FC<{
  variable: "birds" | "trafic" | "voices";
  feature: Feature;
  legendSpec?: LegendSpecType;
}> = ({ variable, feature, legendSpec }) => {
  const symbolSpec = legendSpec && legendSpec[`acoustic_${variable}`];
  const t = useT();
  return (
    <div
      className={`acoustic-${variable}`}
      style={{
        width: circleSize,
        height: circleSize,
        borderRadius: circleSize,
        backgroundColor: symbolSpec?.colorStyleExpression?.evaluate({ zoom: 14 }, feature) || null,
      }}
      title={`${t(`acoustic-${variable}`)} - ${
        (feature?.properties && feature?.properties[`acoustic_${variable}`]) || ""
      }`}
    >
      {symbolSpec && symbolSpec.icon ? symbolSpec.icon({ className: "icon", size: "2em" }) : null}
    </div>
  );
};

export const AcousticFeatureCircles: FC<{ feature: Feature }> = ({ feature }) => {
  const project = useCurrentProject();
  //TODO
  // - sound level as background centered circle
  // - circle size according to value (we need to compute range at build time)

  return (
    <div className="acoustic-circles">
      <AcousticCircle variable="birds" feature={feature} legendSpec={project?.legendSpecs} />
      <AcousticCircle variable="trafic" feature={feature} legendSpec={project?.legendSpecs} />
      <AcousticCircle variable="voices" feature={feature} legendSpec={project?.legendSpecs} />
    </div>
  );
};
