import { FC, PropsWithChildren, useState } from "react";
import cx from "classnames";
import {
  BsFillCheckCircleFill,
  BsFillInfoCircleFill,
  BsFillExclamationTriangleFill,
  BsFillExclamationOctagonFill,
} from "react-icons/bs";

const CLASSES_ALERT = {
  success: "alert-success",
  info: "alert-info",
  warning: "alert-warning",
  error: "alert-danger",
};

const ICONS_ALERT = {
  success: <BsFillCheckCircleFill className="text-success" />,
  info: <BsFillInfoCircleFill className="text-info" />,
  warning: <BsFillExclamationTriangleFill className="text-warning" />,
  error: <BsFillExclamationOctagonFill className="text-danger" />,
};

interface AlertProps {
  type: "success" | "info" | "warning" | "error";
}

export const Alert: FC<PropsWithChildren<AlertProps>> = ({ type, children }) => {
  const [close, setClose] = useState<boolean>(false);

  if (close) return null;
  return (
    <div className={cx("alert d-flex align-items-center", CLASSES_ALERT[type])} role="alert">
      {ICONS_ALERT[type]}
      <div>{children}</div>
      <button type="button" className="btn-close" onClick={() => setClose(true)}></button>
    </div>
  );
};
