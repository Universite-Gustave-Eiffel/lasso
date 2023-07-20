import { FC, CSSProperties, useMemo, useCallback } from "react";
import Select, { OptionProps, SingleValueProps } from "react-select";
import cx from "classnames";
import { useLocale } from "@transifex/react";

import { IProjectMap } from "@lasso/dataprep";
import { getMapProjectMappedVariable, getVariableColor } from "../../utils/project";
import { LoadedProject } from "../../hooks/useProject";
import { getI18NText } from "../../utils/i18n";
import { ColorAxis } from "../ColorAxis";

const ProjectMapOption: FC<{ project: LoadedProject; map: IProjectMap }> = ({ project, map }) => {
  const locale = useLocale();

  const mapVariable = useMemo(() => getMapProjectMappedVariable(project, map), [project, map]);
  const getColor = useCallback(
    (value: number) => (mapVariable ? getVariableColor(project, mapVariable, value) : "#FFF"),
    [mapVariable, project],
  );

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>{getI18NText(locale, map.name)}</div>
      {mapVariable && project.legendSpecs[mapVariable.variable] && (
        <div className="d-flex" style={{ width: "50px" }}>
          <ColorAxis
            min={mapVariable?.minimumValue}
            max={mapVariable?.maximumValue}
            nbSteps={100}
            getColorByValue={getColor}
          />
        </div>
      )}
    </div>
  );
};

function getSingleValueComponent(project: LoadedProject) {
  return ({ data }: SingleValueProps<IProjectMap>) => {
    return (
      <div style={{ width: "100%" }}>
        <ProjectMapOption project={project} map={data} />
      </div>
    );
  };
}

function getOptionComponent(project: LoadedProject) {
  return ({ data, innerProps, className, isFocused }: OptionProps<IProjectMap, false>) => {
    return (
      <div
        {...innerProps}
        className={cx(className, "m-1 hoverable cursor-pointer", isFocused && "bg-light")}
        onMouseMove={undefined}
        onMouseOver={undefined}
      >
        <ProjectMapOption project={project} map={data} />
      </div>
    );
  };
}

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
   * The project to display
   */
  project: LoadedProject;
  /**
   * The map on which the component is linked
   */
  projectMapId?: string;
  setProjectMapId: (projetMapId: string) => void;
}

//TODO: selected in url
export const LayerSelector: FC<LayerSelectorProps> = ({
  id,
  className,
  style,
  project,
  projectMapId,
  setProjectMapId,
}) => {
  const htmlProps = { id, className: cx("layer-selector", className), style };

  return (
    <div {...htmlProps}>
      <Select<IProjectMap>
        options={project.maps}
        className="cursor-pointer"
        value={project.maps.find((o) => o.id === projectMapId)}
        onChange={(e) => {
          if (e) setProjectMapId(e.id);
        }}
        components={{
          SingleValue: getSingleValueComponent(project),
          Option: getOptionComponent(project),
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
