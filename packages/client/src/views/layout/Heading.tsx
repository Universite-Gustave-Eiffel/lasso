import { FC } from "react";
import cx from "classnames";

export const Heading: FC<{
  heading?: string | JSX.Element;
  headingTools?: JSX.Element;
}> = ({ heading, headingTools }) => {
  if (!heading && !headingTools) return null;
  return (
    <div
      className={cx(
        "heading pb-3 d-flex flex-wrap align-items-centerpt-3 pt-3 pb-2 border-bottom",
        heading && "justify-content-between",
        !heading && "justify-content-end"
      )}
    >
      {heading && <h1 className="mb-0">{heading}</h1>}
      {headingTools && (
        <div className="tools align-self-center">{headingTools}</div>
      )}
    </div>
  );
};
