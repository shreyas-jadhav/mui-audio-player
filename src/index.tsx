import React from "react";
import MuiHtmlAudioElement, {
  MuiHtmlAudioElementProps,
} from "./MuiHtmlAudioElement";
import WebAudioElement, { WebAudioElementProps } from "./WebAudioElement";

type MuiAudioPlayerProps =
  | (MuiHtmlAudioElementProps & {
      useWebAudioApi: false;
    })
  | (WebAudioElementProps & {
      useWebAudioApi: true;
    });

const MuiAudioPlayer = ({
  useWebAudioApi = false,

  ...props
}: MuiAudioPlayerProps) => {
  if (!useWebAudioApi) return <MuiHtmlAudioElement {...props} />;
  return <WebAudioElement />;
};

export default MuiAudioPlayer;
