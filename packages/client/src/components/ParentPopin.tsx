import { FC, PropsWithChildren, useRef } from "react";

interface ParentPopinProps {
  close: () => void;
}
export const ParentPopin: FC<PropsWithChildren<ParentPopinProps>> = ({ children, close }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="parent-overlay"
      onClick={(e) => {
        if (ref.current && !ref.current.contains(e.target as any)) {
          close();
        }
      }}
    >
      <div ref={ref} className="parent-popin">
        <button className="btn-close" onClick={close}></button>
        {children}
      </div>
    </div>
  );
};
