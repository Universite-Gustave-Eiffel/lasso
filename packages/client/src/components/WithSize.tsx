import React, { Component, ComponentType } from "react";

export type SizeState = {
  width: number;
  height: number;
  isMounted: boolean;
};

export default function withSize<T extends SizeState>(
  WrappedComponent: ComponentType<T>,
  options?: { rafCheck?: boolean },
) {
  const opts = {
    rafCheck: true,
    ...options,
  };

  return class WithSize extends Component<{ wrapperClassName?: string } & Omit<T, keyof SizeState>> {
    rafId?: number;
    state = {
      width: 0,
      height: 0,
      isMounted: false,
    };
    wrapper: React.RefObject<HTMLDivElement> = React.createRef();

    handleResize = () => {
      const width = this.wrapper.current?.offsetWidth;
      const height = this.wrapper.current?.offsetHeight;

      if (!this.state.isMounted || width !== this.state.width || height !== this.state.height)
        this.setState({
          isMounted: true,
          width,
          height,
        });
    };
    handleRAFResize = () => {
      this.handleResize();
      this.rafId = requestAnimationFrame(this.handleRAFResize);
    };

    componentDidMount = () => {
      window.addEventListener("resize", this.handleResize);
      if (opts.rafCheck) this.rafId = requestAnimationFrame(this.handleRAFResize);
      this.handleResize();
    };
    componentWillUnmount = () => {
      window.removeEventListener("resize", this.handleResize);
      if (typeof this.rafId === "number") window.cancelAnimationFrame(this.rafId);
    };

    render = () => {
      return (
        <span ref={this.wrapper} className={this.props.wrapperClassName}>
          <WrappedComponent {...(this.props as T)} {...this.state} />
        </span>
      );
    };
  };
}
