import React, {useEffect, useState, useRef, memo} from "react";
import {WaveSurfer, WaveForm, useWavesurfer} from "wavesurfer-react";
import * as MUI from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import {WaveSurferProps} from "wavesurfer-react/dist/containers/WaveSurfer";
import {PluginType} from "wavesurfer-react/dist/types";

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

const AudioPlayer = (props: AudioPlayerProps) => {
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
    const [currentTime, setCurrentTime] = useState("00:00");
    const [endTime, setEndTime] = useState("");
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
                    setPlaying={setPlaying}
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
                            onMount={handleMount({
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
                                onChange={(e, v) => {
                                    if (audioElement && typeof v === "number")
                                        audioElement.fastSeek((audioElement.duration / 100) * v);
                                }}
                                size="small"
                                value={position}
                            />
                        </MUI.Box>
                    )}
                </MUI.Box>
                <TimeStamp
                    place="right"
                    time={endTime}
                    loading={loading}
                    show={showTimestamps}
                />
            </MUI.Stack>

            {!inline ? (
                <MUI.Box display="flex" justifyContent="center" alignItems="center">
                    <PlayPauseButton
                        disabled={loading}
                        display={display}
                        audioElement={audioElement}
                        playing={playing}
                        setPlaying={setPlaying}
                        waveSurferRef={waveSurferRef}
                        playPauseIconButtonProps={playPauseIconButtonProps}
                    />
                </MUI.Box>
            ) : null}
        </MUI.Stack>
    );
};

const secondsToTimestring = (seconds: number) => {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(seconds);
    return date.toTimeString().slice(3, 8);
};

function TimeStamp(props: {
    time: string;
    loading?: boolean;
    show?: boolean;
    place?: "left" | "right";
}) {
    const {time, loading = false, place = "left", show = true} = props;

    if (!show) {
        return null;
    }

    return (
        <MUI.Box
            pr={place === "left" ? 1 : 0}
            pl={place === "right" ? 1 : 0}
            sx={containerStyle.timestamp}
        >
            <MUI.Typography>{loading ? "--:--" : time}</MUI.Typography>
        </MUI.Box>
    );
}

interface HandleMountArg {
    src: string;
    waveSurferRef: React.MutableRefObject<WaveSurferRef>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentTime: React.Dispatch<React.SetStateAction<string>>;
    setEndTime: React.Dispatch<React.SetStateAction<string>>;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

function handleMount({
                         src,
                         waveSurferRef,
                         setLoading,
                         setCurrentTime,
                         setEndTime,
                         setProgress,
                         setPlaying,
                     }: HandleMountArg): WaveSurferProps["onMount"] {
    return function onMount(waveSurfer) {
        console.log("[AudioPlayer] on mount", waveSurfer);

        if (!waveSurfer) {
            return;
        }

        waveSurferRef.current = waveSurfer;

        if (src) {
            console.log("[AudioPlayer] load audio", src);
            waveSurferRef.current.load(src);
        }

        waveSurferRef.current.on("ready", () => {
            console.log("[AudioPlayer] ready event");
            setLoading(false);

            const duration = waveSurferRef.current.getDuration();
            if (duration) {
                setEndTime(secondsToTimestring(duration));
            }
        });

        waveSurferRef.current.on("loading", (n: number) => {
            console.log("[AudioPlayer] loading audio...", n);
            setProgress(n);
        });

        ["finish", "error", "destroy", "pause"].forEach((e) =>
            waveSurferRef.current.on(e, () => setPlaying(false))
        );

        waveSurferRef.current.on("error", (e) => console.error(e));
        waveSurferRef.current.on("playing", () => setPlaying(true));
        waveSurferRef.current.on("audioprocess", (e: number) => {
            setCurrentTime(secondsToTimestring(e));
        });
    };
}

interface InitializeForTimelineArgs {
    src: string;
    audioElement: HTMLAudioElement | null;
    setAudioElement: React.Dispatch<React.SetStateAction<HTMLAudioElement | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentTime: React.Dispatch<React.SetStateAction<string>>;
    setEndTime: React.Dispatch<React.SetStateAction<string>>;
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

    audio.addEventListener("playing", makePlaying);
    audio.addEventListener("pause", makeNotPlaying);
    audio.addEventListener("ended", makeNotPlaying);
    audio.addEventListener("canplaythrough", () => {
        setLoading(false);
        setEndTime(secondsToTimestring(audio.duration));
    });
    audio.addEventListener("timeupdate", () => {
        setCurrentTime(secondsToTimestring(audio.currentTime));
        setPosition((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener("error", (e) => console.error(e));

    setAudioElement(audio);
}

interface PlayPauseButtonProps
    extends Pick<AudioPlayerProps, "display" | "playPauseIconButtonProps"> {
    disabled?: boolean;
    audioElement: HTMLAudioElement | null;
    playing: boolean;
    setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    waveSurferRef: React.MutableRefObject<WaveSurferRef>;
}

function PlayPauseButton(props: PlayPauseButtonProps) {
    const {
        disabled = false,
        display,
        audioElement,
        playing,
        setPlaying,
        waveSurferRef,
        playPauseIconButtonProps,
    } = props;

    const playOrPauseForTimeline = (
        playing: PlayPauseButtonProps["playing"],
        audioElement: PlayPauseButtonProps["audioElement"]
    ) => {
        playing ? audioElement?.pause() : audioElement?.play();
    };

    const playOrPauseForWaveForm = (
        waveSurferRef: PlayPauseButtonProps["waveSurferRef"],
        setPlaying: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        const currentWaveSurfer = waveSurferRef.current;

        if (!currentWaveSurfer) return null;

        if (playing) {
            currentWaveSurfer.pause();
            return null;
        }

        currentWaveSurfer.play();

        setPlaying(true);
    };

    const handlePlay = () => {
        if (display === "timeline" && audioElement) {
            playOrPauseForTimeline(playing, audioElement);

            return null;
        }

        playOrPauseForWaveForm(waveSurferRef, setPlaying);
    };

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

export default memo(AudioPlayer);

const containerStyle = {
    timestamp: {
        minWidth: "fit-content",
    },
    playButton: {
        m: 1,
    },
};
