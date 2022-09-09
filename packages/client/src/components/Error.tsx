import { FC, useState, useEffect } from "react";
import cx from "classnames";
import { useT } from "@transifex/react";

import { parseError } from "../utils/error";
import { NotFound } from "./NotFound";

const DEFAULT_MESSAGE = "Sorry, an unknown error occured";

export const Error: FC<{ className?: string; error?: Error }> = ({ className, error }) => {
  const t = useT();
  const [isNotFound, setNotFound] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(DEFAULT_MESSAGE);

  useEffect(() => {
    if (error) setNotFound(parseError(error).endsWith("404"));
    setMessage(error ? parseError(error) : DEFAULT_MESSAGE);
  }, [error]);

  return (
    <>
      {isNotFound ? (
        <NotFound />
      ) : (
        <div className={cx("container text-center col-4", className)}>
          <div className="row">
            <h1>{t("common.error")}</h1>
            <h2>{message}</h2>
          </div>
        </div>
      )}
    </>
  );
};
