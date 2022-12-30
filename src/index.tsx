import React, { useEffect, useState, useRef, memo } from "react";
import { WaveSurfer, WaveForm, useWavesurfer } from "wavesurfer-react";
import {
  Stack,
  LinearProgress,
  Box,
  useTheme,
  Palette,
  SxProps,
  Theme,
  Paper,
  Slider,
  IconButton,
  IconButtonProps,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { WaveSurferProps } from "wavesurfer-react/dist/containers/WaveSurfer";
import { PluginType } from "wavesurfer-react/dist/types";

const plugins: PluginType[] = [
];

type WaveSurferRef = ReturnType<typeof useWavesurfer>;
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
  const wavesurferRef = useRef<WaveSurferRef>();

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

  const theme = useTheme();
  const _waveColor = waveColor || theme.palette.primary.light;
  const progressColor = theme.palette.primary.main;
  const mergedContainerStyle = {
    height: containerHeight,
    width: containerWidth,
    ...(containerSx || {}),
  };

  return (
      <Stack
          sx={mergedContainerStyle}
          direction={inline ? "row" : "column"}
          component={paperize ? Paper : "div"}
          alignItems="center"
      >
        {loading && (
            <LinearProgress
                variant="determinate"
                style={{ flexGrow: 1 }}
                value={progress}
            />
        )}
        {inline && !loading && (
            <Box p={1}>
              <PlayPauseButton
                  display={display}
                  audioElement={audioElement}
                  playing={playing}
                  setPlaying={setPlaying}
                  wavesurferRef={wavesurferRef}
                  playPauseIconButtonProps={playPauseIconButtonProps}
              />
            </Box>
        )}

        <Stack
            component={Box}
            direction="row"
            flexGrow={loading ? 0 : 1}
            height="100%"
            width="100%"
            alignItems="center"
            spacing={1}
        >
          {showTimestamps && !loading && (
              <Box pl={1}>
                <small
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      alignContent: "center",
                      height: "100%",
                    }}
                >
                  {currentTime}
                </small>
              </Box>
          )}
          <Box flexGrow={1} height="100%" width="100%" alignItems="center">
            {display === "waveform" && (
                <WaveSurfer
                    onMount={handleMount({
                      src,
                      wavesurferRef,
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
                <Box mx={1} display="flex" alignItems="center" height="100%">
                  <Slider
                      onChange={(e, v) => {
                        if (audioElement && typeof v === "number")
                          audioElement.fastSeek((audioElement.duration / 100) * v);
                      }}
                      size="small"
                      value={position}
                  />
                </Box>
            )}
          </Box>

          {showTimestamps && !loading && (
              <Box pr={1}>
                <small
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      alignContent: "center",
                      height: "100%",
                    }}
                >
                  {endTime}
                </small>
              </Box>
          )}
        </Stack>

        {!inline ? (
            <Box display="flex" p={1} justifyContent="center" alignItems="center">
              <PlayPauseButton
                  display={display}
                  audioElement={audioElement}
                  playing={playing}
                  setPlaying={setPlaying}
                  wavesurferRef={wavesurferRef}
                  playPauseIconButtonProps={playPauseIconButtonProps}
              />
            </Box>
        ) : null}
      </Stack>
  );
};

const secondsToTimestring = (seconds: number) => {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(seconds);
  return date.toTimeString().slice(3, 8);
};

interface HandleMountArg {
  src: string;
  wavesurferRef: React.MutableRefObject<WaveSurferRef>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentTime: React.Dispatch<React.SetStateAction<string>>;
  setEndTime: React.Dispatch<React.SetStateAction<string>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}
function handleMount({
                       src,
                       wavesurferRef,
                       setLoading,
                       setCurrentTime,
                       setEndTime,
                       setProgress,
                       setPlaying,
                     }: HandleMountArg): WaveSurferProps["onMount"] {
  return function onMount(waveSurfer) {
    console.log("[AudioPlayer] on mount", waveSurfer);

    wavesurferRef.current = waveSurfer;

    if (wavesurferRef.current) {
      if (src) {
        console.log("[AudioPlayer] load audio", src);
        wavesurferRef.current.load(src);
      }

      wavesurferRef.current.on("ready", () => {
        console.log("[AudioPlayer] ready event");

        setLoading(false);
        if (wavesurferRef?.current?.getDuration()) {
          setEndTime(
              secondsToTimestring(wavesurferRef?.current?.getDuration())
          );
        }
      });

      wavesurferRef.current.on("loading", (n: number) => {
        console.log("[AudioPlayer] loading audio...", n);
        setProgress(n);
      });

      ["finish", "error", "destroy", "pause"].forEach((e) =>
          wavesurferRef.current?.on(e, () => setPlaying(false))
      );

      wavesurferRef.current.on("error", (e) => console.error(e));
      wavesurferRef.current.on("playing", () => setPlaying(true));
      wavesurferRef.current.on("audioprocess", (e: number) => {
        setCurrentTime(secondsToTimestring(e));
      });
    }
  };
}

interface InitializeForTimelineArgs {
  src: string;
  audioElement: HTMLAudioElement | null;
  setAudioElement: React.Dispatch<
      React.SetStateAction<HTMLAudioElement | null>
      >;
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
    extends Pick<MuiAudioPlayerProps, "display" | "playPauseIconButtonProps"> {
  audioElement: HTMLAudioElement | null;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  wavesurferRef: WaveSurferRef;
}
function PlayPauseButton(props: PlayPauseButtonProps) {
  const {
    display,
    audioElement,
    playing,
    setPlaying,
    wavesurferRef,
    playPauseIconButtonProps,
  } = props;

  const handlePlay = () => {
    if (display === "timeline") {
      playing ? audioElement?.pause() : audioElement?.play();

      return null;
    }

    if (!wavesurferRef.current) return null;

    if (playing) {
      return wavesurferRef.current.pause();
    }

    wavesurferRef.current.play();

    setPlaying(true);
  };

  return (
      <IconButton
          onClick={handlePlay}
          color="primary"
          {...playPauseIconButtonProps}
      >
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
  );
}

export default memo(AudioPlayer);
