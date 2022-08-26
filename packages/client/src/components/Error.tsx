import { FC, useState, useEffect } from "react";
import cx from "classnames";

import { parseError } from "../utils/error";

const DEFAULT_MESSAGE = "Sorry, an unknown error occured";

export const Error: FC<{ className?: string; error?: Error }> = ({ className, error }) => {
  const [message, setMessage] = useState<string>(DEFAULT_MESSAGE);

  useEffect(() => {
    setMessage(error ? parseError(error) : DEFAULT_MESSAGE);
  }, [error]);

  return (
    <div className={cx("container text-center col-4", className)}>
      <div className="row">
        <h1>Error</h1>
        <h2>{message}</h2>
      </div>
    </div>
  );
};
