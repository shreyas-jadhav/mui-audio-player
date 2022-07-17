import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Stack from "@mui/material/Stack";
import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";

import {
  Grid,
  LinearProgress,
  Box,
  useTheme,
  Palette,
  SxProps,
  Theme,
  Paper,
} from "@mui/material";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Typography from "@mui/material/Typography";
import PauseIcon from "@mui/icons-material/Pause";
import {
  WaveSurferProps,
  WaveSurferRef,
} from "wavesurfer-react/dist/containers/WaveSurfer";
import Slider from "@mui/material/Slider";

type MuiAudioPlayerProps = {
  src: string;
  size?: "small" | "medium" | "large";
  paperize?: boolean;

  id?: string;
  waveColor?: keyof Palette | string;
  waveHeight?: number;

  playPauseIconButtonProps?: IconButtonProps;

  display?: "waveform" | "timeline";
  inline?: boolean;
  showTimestamps?: boolean;

  containerSx?: SxProps<Theme>;
  containerHeight?: string | number;
  containerWidth?: string | number;
};
const MuiAudioPlayer = ({
  src,
  size = "medium",
  id = "audio-player",
  display = "waveform",
  showTimestamps = true,

  containerWidth = 250,
  containerHeight = "auto",
  paperize = true,
  waveHeight = 48,
  inline = false,
  playPauseIconButtonProps,
  ...props
}: MuiAudioPlayerProps) => {
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [endTime, setEndTime] = useState("");
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const wavesurferRef = React.useRef<WaveSurferRef>();

  const handleMount: WaveSurferProps[`onMount`] = React.useCallback(
    (waveSurfer) => {
      wavesurferRef.current = waveSurfer;
      if (wavesurferRef.current) {
        if (src) {
          wavesurferRef.current.load(src);
        }

        wavesurferRef.current.on("ready", () => {
          setLoading(false);
          if (wavesurferRef?.current?.getDuration()) {
            setEndTime(
              secondsToTimestring(wavesurferRef?.current?.getDuration())
            );
          }
        });

        wavesurferRef.current.on("loading", (n: number) => {
          setProgress(n);
        });

        [`finish`, `error`, `destroy`, `pause`].forEach((e) =>
          wavesurferRef.current?.on(e, () => setPlaying(false))
        );

        wavesurferRef.current.on("error", (e) => console.error(e));

        wavesurferRef.current.on("playing", () => setPlaying(true));

        wavesurferRef.current.on("audioprocess", (e: number) => {
          setCurrentTime(secondsToTimestring(e));
        });
      }
    },
    [src]
  );

  useEffect(() => {
    if (display != "timeline") return;
    audioElement?.pause();
    const audio = new Audio(src);
    audio.addEventListener("playing", () => setPlaying(true));
    ["pause", "ended"].forEach((e) =>
      audio.addEventListener(e, () => setPlaying(false))
    );
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
  }, [src, display]);

  const handlePlay = () => {
    if (display == "timeline") {
      console.log(playing);
      if (!playing) {
        console.info(`playing`);
        audioElement?.play();
      } else audioElement?.pause();
      return;
    }
    if (!wavesurferRef.current) return;
    if (playing) {
      return wavesurferRef.current.pause();
    }
    wavesurferRef.current.play();

    setPlaying(true);
  };

  const theme = useTheme();

  const waveColor = props.waveColor || theme.palette.primary.main;
  const PlayPauseButton = useCallback(
    () =>
      loading && !playing ? null : (
        <IconButton
          onClick={handlePlay}
          color="primary"
          {...playPauseIconButtonProps}
        >
          {playing ? (
            <PauseIcon fontSize={size} />
          ) : (
            <PlayArrowIcon fontSize={size} />
          )}
        </IconButton>
      ),
    [size, playPauseIconButtonProps, playing, loading, handlePlay]
  );

  if (!src) return null;
  return (
    <Stack
      sx={{
        ...(props.containerSx || {}),
        height: containerHeight,
        width: containerWidth,
      }}
      direction={inline ? `row` : `column`}
      component={paperize ? Paper : "div"}
      alignItems="center"
    >
      {loading && (
        <Box width="100%" flexGrow={1}>
          <LinearProgress
            variant="determinate"
            style={{ flexGrow: 1 }}
            value={progress}
          />
        </Box>
      )}
      {inline && !loading && (
        <Box p={1}>
          <PlayPauseButton />
        </Box>
      )}

      <Stack
        component={Box}
        direction="row"
        flexGrow={loading ? 0 : 1}
        height={"100%"}
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
        <Box flexGrow={1} height={"100%"} width="100%" alignItems="center">
          {display == "waveform" && (
            <WaveSurfer onMount={handleMount}>
              <WaveForm
                id={id}
                fillParent
                mediaControls
                waveColor={waveColor}
                height={waveHeight}
                hideScrollbar={true}
              />
            </WaveSurfer>
          )}
          {display == "timeline" && !loading && (
            <Box mx={1} display="flex" alignItems="center" height="100%">
              <Slider
                onChange={(e, v) => {
                  if (audioElement && typeof v == "number")
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
      <Box display="flex" p={1} justifyContent="center" alignItems="center">
        {!inline && (
          <Stack spacing={1} direction="row">
            <PlayPauseButton />
          </Stack>
        )}
      </Box>
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
export default React.memo(MuiAudioPlayer);
