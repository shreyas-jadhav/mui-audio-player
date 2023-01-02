import React, {useEffect, useState, useRef} from "react";
import {WaveSurfer, WaveForm, useWavesurfer} from "wavesurfer-react";
import * as MUI from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import {WaveSurferProps} from "wavesurfer-react/dist/containers/WaveSurfer";
import {PluginType} from "wavesurfer-react/dist/types";
import {throttle} from "throttle-typescript";
import {SliderUnstyledTypeMap} from "@mui/base/SliderUnstyled/SliderUnstyled.types";

const plugins: PluginType[] = [];

type WaveSurferRef = ReturnType<typeof useWavesurfer>;

interface AudioPlayerProps {
    src: string;
    id?: string;
    display?: "waveform" | "timeline";
    inline?: boolean;
    paperize?: boolean;
    waveColor?: keyof MUI.Palette | string;
    waveHeight?: number;
    showTimestamps?: boolean;
    playPauseIconButtonProps?: MUI.IconButtonProps;
    containerSx?: MUI.SxProps<MUI.Theme>;
    containerHeight?: string | number;
    containerWidth?: string | number;
}

export default function AudioPlayer(props: AudioPlayerProps) {
    const {
        src,
        id = "waveform",
        display = "waveform",
        inline = false,
        paperize = true,
        waveColor,
        waveHeight = 48,
        showTimestamps = true,
        playPauseIconButtonProps,
        containerSx,
        containerHeight = "auto",
        containerWidth = 250,
    } = props;

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
        null
    );
    const waveSurferRef = useRef<WaveSurferRef>(null);

    useEffect(() => {
        if (display !== "timeline") return;

        initializeForTimeline({
            src,
            audioElement,
            setAudioElement,
            setLoading,
            setCurrentTime,
            setEndTime,
            setPosition,
            setPlaying,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, display]);

    const theme = MUI.useTheme();
    const _waveColor = waveColor || theme.palette.primary.light;
    const progressColor = theme.palette.primary.main;
    const mergedContainerStyle = {
        height: containerHeight,
        width: containerWidth,
        ...(containerSx || {}),
    };

    return (
        <MUI.Stack
            sx={mergedContainerStyle}
            direction={inline ? "row" : "column"}
            component={paperize ? MUI.Paper : "div"}
            alignItems="center"
        >
            {inline ? (
                <PlayPauseButton
                    disabled={loading}
                    display={display}
                    audioElement={audioElement}
                    playing={playing}
                    waveSurferRef={waveSurferRef}
                    playPauseIconButtonProps={playPauseIconButtonProps}
                />
            ) : null}
            {loading ? (
                <MUI.LinearProgress variant="determinate" value={progress}/>
            ) : null}

            <MUI.Stack
                component={MUI.Box}
                direction="row"
                flexGrow={loading ? 0 : 1}
                height="100%"
                width="100%"
                alignItems="center"
                spacing={1}
            >
                <TimeStamp time={currentTime} loading={loading} show={showTimestamps}/>
                <MUI.Box flexGrow={1} height="100%" width="100%" alignItems="center">
                    {display === "waveform" && (
                        <WaveSurfer
                            onMount={getInitializeWaveSurfer({
                                src,
                                waveSurferRef,
                                setLoading,
                                setCurrentTime,
                                setEndTime,
                                setProgress,
                                setPlaying,
                            })}
                            plugins={plugins}
                        >
                            <WaveForm
                                id={id}
                                fillParent
                                mediaControls
                                waveColor={_waveColor}
                                progressColor={progressColor}
                                height={waveHeight}
                                hideScrollbar={false}
                            />
                        </WaveSurfer>
                    )}
                    {display === "timeline" && !loading && (
                        <MUI.Box mx={1} display="flex" alignItems="center" height="100%">
                            <MUI.Slider
                                onChange={changeCurrentTimeForTimeline(audioElement)}
                                size="small"
                                value={position}
                            />
                        </MUI.Box>
                    )}
                </MUI.Box>
                <TimeStamp time={endTime} loading={loading} show={showTimestamps}/>
            </MUI.Stack>

            {!inline ? (
                <MUI.Box display="flex" justifyContent="center" alignItems="center">
                    <PlayPauseButton
                        disabled={loading}
                        display={display}
                        audioElement={audioElement}
                        playing={playing}
                        waveSurferRef={waveSurferRef}
                        playPauseIconButtonProps={playPauseIconButtonProps}
                    />
                </MUI.Box>
            ) : null}
        </MUI.Stack>
    );
}

function changeCurrentTimeForTimeline(
    audioElement: HTMLAudioElement | null
): SliderUnstyledTypeMap["props"]["onChange"] {
    return (e, v) => {
        if (audioElement && typeof v === "number") {
            const currentPosition = (audioElement.duration / 100) * v;

            if (audioElement.fastSeek instanceof Function) {
                audioElement.fastSeek(currentPosition);
            } else {
                audioElement.currentTime = currentPosition;
            }
        }
    };
}

function toTimeString(time: number) {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(time);
    return date.toTimeString().slice(3, 8);
}

function TimeStamp(props: { time: number; loading?: boolean; show?: boolean }) {
    const {time, loading = false, show = true} = props;

    const defaultTimeStr = "00:00";
    const invalidTimeStr = "--:--";

    if (!show) {
        return null;
    }

    const timeStr = Number.isNaN(time) ? invalidTimeStr : toTimeString(time);

    return (
        <MUI.Box sx={containerStyle.timestamp}>
            <MUI.Typography>{loading ? defaultTimeStr : timeStr}</MUI.Typography>
        </MUI.Box>
    );
}

interface GetInitializeWaveSurferParams {
    src: string;
    waveSurferRef: React.MutableRefObject<WaveSurferRef>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
    setEndTime: React.Dispatch<React.SetStateAction<number>>;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

function getInitializeWaveSurfer(
    params: GetInitializeWaveSurferParams
): WaveSurferProps["onMount"] {
    const {
        src,
        waveSurferRef,
        setLoading,
        setCurrentTime,
        setEndTime,
        setProgress,
        setPlaying,
    } = params;

    return function initializeWaveSurfer(waveSurfer) {
        if (!waveSurfer) {
            return;
        }

        waveSurferRef.current = waveSurfer;

        if (src) {
            waveSurfer.load(src);
        }

        const makePlaying = () => setPlaying(true);
        const makeNotPlaying = () => setPlaying(false);

        waveSurfer.on("loading", (n: number) => {
            setProgress(n);
        });
        waveSurfer.on("ready", () => {
            setLoading(false);
            setEndTime(waveSurfer.getDuration());
        });
        waveSurfer.on("play", makePlaying);
        waveSurfer.on(
            "audioprocess",
            throttle((n: number) => {
                setCurrentTime(n);
            }, 100)
        );
        waveSurfer.on("seek", () => {
            setCurrentTime(waveSurfer.getCurrentTime());
        });
        ["finish", "destroy", "pause"].forEach((e) =>
            waveSurfer.on(e, makeNotPlaying)
        );
        waveSurfer.on("error", (e) => {
            makeNotPlaying();
            console.error(e);
        });
    };
}

interface InitializeForTimelineArgs {
    src: string;
    audioElement: HTMLAudioElement | null;
    setAudioElement: React.Dispatch<React.SetStateAction<HTMLAudioElement | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
    setEndTime: React.Dispatch<React.SetStateAction<number>>;
    setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    setPosition: React.Dispatch<React.SetStateAction<number>>;
}

function initializeForTimeline(args: InitializeForTimelineArgs) {
    const {
        src,
        audioElement,
        setAudioElement,
        setLoading,
        setCurrentTime,
        setEndTime,
        setPosition,
        setPlaying,
    } = args;

    audioElement?.pause();

    const audio = new Audio(src);

    const makePlaying = () => setPlaying(true);
    const makeNotPlaying = () => setPlaying(false);

    audio.addEventListener("canplaythrough", () => {
        setLoading(false);
        setEndTime(audio.duration);
    });
    audio.addEventListener("playing", makePlaying);
    audio.addEventListener(
        "timeupdate",
        throttle(() => {
            setCurrentTime(audio.currentTime);
            setPosition((audio.currentTime / audio.duration) * 100);
        }, 100)
    );
    audio.addEventListener("pause", makeNotPlaying);
    audio.addEventListener("ended", makeNotPlaying);
    audio.addEventListener("error", (e) => {
        makeNotPlaying();
        console.error(e);
    });

    setAudioElement(audio);
}

interface PlayPauseButtonProps
    extends Pick<AudioPlayerProps, "display" | "playPauseIconButtonProps"> {
    disabled?: boolean;
    audioElement: HTMLAudioElement | null;
    playing: boolean;
    waveSurferRef: React.MutableRefObject<WaveSurferRef>;
}

function PlayPauseButton(props: PlayPauseButtonProps) {
    const {
        disabled = false,
        display,
        audioElement,
        playing,
        waveSurferRef,
        playPauseIconButtonProps,
    } = props;

    const handlePlay = () => {
        if (display === "timeline" && audioElement) {
            playOrPauseForTimeline(playing, audioElement);

            return null;
        }

        playOrPauseForWaveForm(waveSurferRef);
    };

    function playOrPauseForTimeline(
        playing: PlayPauseButtonProps["playing"],
        audioElement: PlayPauseButtonProps["audioElement"]
    ) {
        playing ? audioElement?.pause() : audioElement?.play();
    }

    function playOrPauseForWaveForm(
        waveSurferRef: PlayPauseButtonProps["waveSurferRef"]
    ) {
        const currentWaveSurfer = waveSurferRef.current;

        if (!currentWaveSurfer) return null;

        if (playing) {
            currentWaveSurfer.pause();
            return null;
        }

        currentWaveSurfer.play();
    }

    return (
        <MUI.IconButton
            disabled={disabled}
            color="primary"
            onClick={handlePlay}
            sx={containerStyle.playButton}
            {...playPauseIconButtonProps}
        >
            {playing ? <PauseIcon/> : <PlayArrowIcon/>}
        </MUI.IconButton>
    );
}

const containerStyle = {
    timestamp: {
        minWidth: "50px",
    },
    playButton: {
        m: 1,
    },
};
