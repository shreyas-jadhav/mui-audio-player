/// <reference types="react" />
import type { Palette, Theme, SxProps } from "@mui/material";
import type { IconButtonProps } from "@mui/material/IconButton";
import type { SliderUnstyledTypeMap } from "@mui/base/SliderUnstyled/SliderUnstyled.types";
interface AudioPlayerProps {
    src: string;
    id?: string;
    display?: "waveform" | "timeline";
    inline?: boolean;
    paperize?: boolean;
    waveColor?: keyof Palette | string;
    waveHeight?: number;
    showTimestamps?: boolean;
    playPauseIconButtonProps?: IconButtonProps;
    containerSx?: SxProps<Theme>;
    containerHeight?: string | number;
    containerWidth?: string | number;
    inlineSliderProps?: SliderUnstyledTypeMap["props"];
    size?: "small" | "medium" | "large";
}
export default function AudioPlayer(props: AudioPlayerProps): JSX.Element;
export {};
