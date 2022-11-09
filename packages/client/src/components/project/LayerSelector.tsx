import { FC, CSSProperties, useMemo } from "react";
import Select from "react-select";
import cx from "classnames";

import { IProjectMap } from "@lasso/dataprep";

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
  maps: IProjectMap[];
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
  maps,
  projectMapId,
  setProjectMapId,
}) => {
  const htmlProps = { id, className: cx("layer-selector", className), style };
  const options = useMemo(() => maps.map((m) => ({ value: m.id, label: m.name })), [maps]);

  return (
    <div {...htmlProps}>
      <Select
        isMulti={false}
        isClearable={false}
        options={options}
        value={options.find((o) => o.value === projectMapId)}
        formatOptionLabel={(i) => <div>{i.label}</div>}
        onChange={(e) => setProjectMapId(e ? e.value : options[0].value)}
      />
    </div>
  );
};
