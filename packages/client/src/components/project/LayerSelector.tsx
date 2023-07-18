import { FC, CSSProperties } from "react";
import Select, { OptionProps, SingleValueProps } from "react-select";
import cx from "classnames";
import { useLocale } from "@transifex/react";

import { IProjectMap, Project } from "@lasso/dataprep";
// import { getMapProjectVariables } from "../../utils/project";
import { getI18NText } from "../../utils/string";

const ProjectMapOption: FC<{ project: Project; map: IProjectMap }> = ({ map }) => {
  // console.log(getMapProjectVariables(project, map));
  const locale = useLocale();

  return <span>{getI18NText(locale, map.name)}</span>;
};

function getSingleValueComponent(project: Project) {
  return ({ data }: SingleValueProps<IProjectMap>) => {
    return <ProjectMapOption project={project} map={data} />;
  };
}

function getOptionComponent(project: Project) {
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
  project: Project;
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
