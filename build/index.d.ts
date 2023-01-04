/// <reference types="react" />
import { Palette, Theme, IconButtonProps, SxProps } from "@mui/material";
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
}
export default function AudioPlayer(props: AudioPlayerProps): JSX.Element;
export {};
