import { T } from "@transifex/react";

import { IconType } from "react-icons";
import { FaCarSide } from "react-icons/fa";
import { GiNestBirds } from "react-icons/gi";
import { expression } from "@mapbox/mapbox-gl-style-spec";

import { SOUNDSCAPE_VARIABLES_TYPES } from "@lasso/dataprep";

export interface LegendSymbolSpec {
  label: typeof T;
  icon?: IconType;
  colorStyleExpression?: expression.StyleExpression;
}

export type LegendSpecType = Partial<Record<SOUNDSCAPE_VARIABLES_TYPES, LegendSymbolSpec>>;

export const defaultLegendSpecs: LegendSpecType = {
  acoustic_trafic: {
    label: <T _key="acoustic_trafic_label" />,
    icon: FaCarSide,
  },
  acoustic_birds: {
    label: <T _key="acoustic_birds_label" />,
    icon: GiNestBirds,
  },
};
