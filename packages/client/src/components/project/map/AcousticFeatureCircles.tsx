import { FC } from "react";
import { Feature } from "geojson";

import { useCurrentProject } from "../../../hooks/useProject";
import { LegendSpecType } from "../../../utils/legend";
import { useT } from "@transifex/react";

const AcousticCircle: FC<{
  variable: "birds" | "trafic" | "voices" | "soundlevel";
  feature: Feature;
  legendSpec?: LegendSpecType;
}> = ({ variable, feature, legendSpec }) => {
  const symbolSpec = legendSpec && legendSpec[`acoustic_${variable}`];
  const t = useT();
  const value =
    feature?.properties && feature.properties[`acoustic_${variable}`]
      ? (+feature.properties[`acoustic_${variable}`]).toFixed(2)
      : "?";
  return (
    <div className="d-flex align-items-center p-1">
      <div
        className={`acoustic-circle`}
        style={{
          backgroundColor: symbolSpec?.colorStyleExpression?.evaluate({ zoom: 14 }, feature) || "lightgrey",
        }}
        title={`${t(`variable.acoustic-${variable}`)} - ${value}`}
      >
        {symbolSpec && symbolSpec.icon ? symbolSpec.icon({ className: "icon", size: "2em" }) : null}
      </div>
      <label className="d-flex flex-column ms-1">
        <div>{t(`variable.acoustic-${variable}`)}</div>
        <div>{value}</div>
      </label>
    </div>
  );
};

export const AcousticFeatureCircles: FC<{ feature: Feature }> = ({ feature }) => {
  const { project } = useCurrentProject();
  const t = useT();
  //TODO
  // - sound level as background centered circle
  // - circle size according to value (we need to compute range at build time)

  return (
    <div className="acoustic-panel">
      <h6>{t("Perceiced Sound Sources")}</h6>
      <div className="acoustic-circles">
        <AcousticCircle variable="birds" feature={feature} legendSpec={project?.legendSpecs} />
        <AcousticCircle variable="trafic" feature={feature} legendSpec={project?.legendSpecs} />
        <AcousticCircle variable="voices" feature={feature} legendSpec={project?.legendSpecs} />
        <AcousticCircle variable="soundlevel" feature={feature} legendSpec={project?.legendSpecs} />
      </div>
    </div>
  );
};
