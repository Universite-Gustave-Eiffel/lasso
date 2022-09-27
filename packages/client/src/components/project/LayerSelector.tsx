import { FC, CSSProperties, useMemo, useState, useEffect } from "react";
import Select from "react-select";
import cx from "classnames";

import { Project } from "@lasso/dataprep";

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
  setProjectMapId: (projetMapId: string | null) => void;
}

//TODO: selected in url
export const LayerSelector: FC<LayerSelectorProps> = ({ id, className, style, project, setProjectMapId }) => {
  const htmlProps = { id, className: cx("layer-selector", className), style };
  const options = useMemo(() => project.maps.map((m) => ({ value: m.id, label: m.name })), [project]);
  const [selected, setSelected] = useState<{ value: string; label: string }>(options[0]);

  /**
   * When the selected map changes
   * => we trigger map rendering through projetMapId state
   */
  useEffect(() => {
    setProjectMapId(selected ? selected.value : null);
  }, [selected, setProjectMapId]);

  // useEffect(() => {
  //   if (map) {
  //     map.fitBounds(project.bbox);
  //   }
  // }, [map, project]);

  return (
    <div {...htmlProps}>
      <Select
        isMulti={false}
        isClearable={false}
        options={options}
        value={selected}
        formatOptionLabel={(i) => <div>{i.label}</div>}
        onChange={(e) => setSelected(e ? e : options[0])}
      />
    </div>
  );
};
