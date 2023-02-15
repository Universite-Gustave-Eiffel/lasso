import { IconType } from "react-icons";
import { FaCar } from "react-icons/fa";
import { FaTwitter } from "react-icons/gi";
import { IoChatbubblesSharp } from "react-icons/ri";
import { FaVolumeUp } from "react-icons/hi";
import { expression } from "@mapbox/mapbox-gl-style-spec";

import { SOUNDSCAPE_VARIABLES_TYPES } from "@lasso/dataprep";

export interface LegendSymbolSpec {
  icon?: IconType;
  colorStyleExpression?: expression.StyleExpression;
}

export type LegendSpecType = Partial<Record<SOUNDSCAPE_VARIABLES_TYPES, LegendSymbolSpec>>;

export const defaultLegendSpecs: LegendSpecType = {
  acoustic_trafic: {
    icon: FaCar,
  },
  acoustic_birds: {
    icon: FaTwitter,
  },
  acoustic_voices: {
    icon: IoChatbubblesSharp,
  },
  acoustic_soundlevel: {
    icon: FaVolumeUp,
  },
  emotion_eventful: {},
  emotion_pleasant: {},
};
