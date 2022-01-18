import React, { useEffect, useRef } from "react";

export type MuiHtmlAudioElementProps = React.DetailedHTMLProps<
  React.AudioHTMLAttributes<HTMLAudioElement>,
  HTMLAudioElement
> & {
  onMount?: (ref: React.MutableRefObject<HTMLAudioElement | null>) => any;
};

const MuiHtmlAudioElement = ({
  onMount,
  ...props
}: MuiHtmlAudioElementProps) => {
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (ref && onMount) onMount(ref);
  }, []);
  return <audio ref={ref} {...props} />;
};

export default MuiHtmlAudioElement;
