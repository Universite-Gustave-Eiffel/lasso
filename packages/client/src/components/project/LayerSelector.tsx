import { FC, CSSProperties, useMemo, useCallback } from "react";
import Select, { OptionProps, SingleValueProps } from "react-select";
import cx from "classnames";
import { useLocale } from "@transifex/react";

import { IProjectMap } from "@lasso/dataprep";
import { getMapProjectVariable, getVariableColor } from "../../utils/project";
import { getI18NText } from "../../utils/i18n";
import { useCurrentProject } from "../../hooks/useCurrentProject";
import { ColorAxis } from "../ColorAxis";

const ProjectMapOption: FC<{ map: IProjectMap }> = ({ map }) => {
  const locale = useLocale();
  const { project } = useCurrentProject();

  const mapVariable = useMemo(() => getMapProjectVariable(project.data, map), [project, map]);
  const getColor = useCallback(
    (value: number) => (mapVariable ? getVariableColor(project.data, mapVariable, value) : "#FFF"),
    [mapVariable, project],
  );

  console.log(mapVariable);

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>{getI18NText(locale, map.name)}</div>
      {mapVariable && project.data.legendSpecs[mapVariable.variable] && (
        <div className="d-flex" style={{ width: "50px" }}>
          <ColorAxis
            min={mapVariable?.minimumValue}
            max={mapVariable?.maximumValue}
            nbSteps={100}
            getColorByValue={getColor}
            size="4px"
          />
        </div>
      )}
    </div>
  );
};

const SingleValue = ({ data }: SingleValueProps<IProjectMap>) => {
  return (
    <div style={{ width: "100%" }}>
      <ProjectMapOption map={data} />
    </div>
  );
};

const Option = ({ data, innerProps, className, isFocused }: OptionProps<IProjectMap, false>) => {
  return (
    <div
      {...innerProps}
      className={cx(className, "m-1 hoverable cursor-pointer", isFocused && "bg-light")}
      onMouseMove={undefined}
      onMouseOver={undefined}
    >
      <ProjectMapOption map={data} />
    </div>
  );
};

export interface LayerSelectorProps {
  /**
   * HTML id
   */
  id?: string;
  /**
   * HTML class
   */
  className?: string;
  /**
   * HTML CSS style
   */
  style?: CSSProperties;
  /**
   * Map Id
   */
  mapId: "left" | "right";
}

export const LayerSelector: FC<LayerSelectorProps> = ({ id, className, style, mapId }) => {
  const htmlProps = { id, className: cx("layer-selector", className), style };
  const { project, setProjectMap } = useCurrentProject();

  return (
    <div {...htmlProps}>
      <Select<IProjectMap>
        options={project.data.maps}
        className="cursor-pointer"
        value={project.maps[mapId].map}
        onChange={(e) => {
          if (e) setProjectMap(mapId, e);
        }}
        components={{
          SingleValue,
          Option,
        }}
        styles={{
          menu: (styles) => ({ ...styles, borderRadius: 0 }),
          control: (styles) => {
            return {
              ...styles,
              cursor: "pointer",
            };
          },
          valueContainer: (provided) => ({
            ...provided,
            display: "flex",
            flexWrap: "nowrap",
          }),
        }}
      />
    </div>
  );
};
