import { FC } from "react";
import cx from "classnames";
import { useT } from "@transifex/react";

export const NotFound: FC<{ className?: string }> = ({ className }) => {
  const t = useT();

  return (
    <div className={cx("container text-center col-6", className)}>
      <div className="row">
        <h1>{t("page.notFound.title")}</h1>
        <h2>{t("page.notFound.subtitle")}</h2>
        <p>{t("page.notFound.text")}</p>
      </div>
    </div>
  );
};
