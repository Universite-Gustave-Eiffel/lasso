import { IconType } from "react-icons";
import { FaCarSide } from "react-icons/fa";
import { GiHummingbird } from "react-icons/gi";
import { RiUserVoiceFill } from "react-icons/ri";
import { expression } from "@mapbox/mapbox-gl-style-spec";

import { SOUNDSCAPE_VARIABLES_TYPES } from "@lasso/dataprep";

export interface LegendSymbolSpec {
  icon?: IconType;
  colorStyleExpression?: expression.StyleExpression;
}

export type LegendSpecType = Partial<Record<SOUNDSCAPE_VARIABLES_TYPES, LegendSymbolSpec>>;

export const defaultLegendSpecs: LegendSpecType = {
  acoustic_trafic: {
    icon: FaCarSide,
  },
  acoustic_birds: {
    icon: GiHummingbird,
  },
  acoustic_voices: {
    icon: RiUserVoiceFill,
  },
};