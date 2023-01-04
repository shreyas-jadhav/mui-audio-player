var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "react", "wavesurfer-react", "@mui/material", "@mui/icons-material/PlayArrow", "@mui/icons-material/Pause", "throttle-typescript"], function (require, exports, react_1, wavesurfer_react_1, material_1, PlayArrow_1, Pause_1, throttle_typescript_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    react_1 = __importStar(react_1);
    PlayArrow_1 = __importDefault(PlayArrow_1);
    Pause_1 = __importDefault(Pause_1);
    var plugins = [];
    function AudioPlayer(props) {
        var src = props.src, _a = props.id, id = _a === void 0 ? "waveform" : _a, _b = props.display, display = _b === void 0 ? "waveform" : _b, _c = props.inline, inline = _c === void 0 ? false : _c, _d = props.paperize, paperize = _d === void 0 ? true : _d, waveColor = props.waveColor, _e = props.waveHeight, waveHeight = _e === void 0 ? 48 : _e, _f = props.showTimestamps, showTimestamps = _f === void 0 ? true : _f, playPauseIconButtonProps = props.playPauseIconButtonProps, containerSx = props.containerSx, _g = props.containerHeight, containerHeight = _g === void 0 ? "auto" : _g, _h = props.containerWidth, containerWidth = _h === void 0 ? 250 : _h;
        var _j = (0, react_1.useState)(true), loading = _j[0], setLoading = _j[1];
        var _k = (0, react_1.useState)(0), progress = _k[0], setProgress = _k[1];
        var _l = (0, react_1.useState)(false), playing = _l[0], setPlaying = _l[1];
        var _m = (0, react_1.useState)(0), position = _m[0], setPosition = _m[1];
        var _o = (0, react_1.useState)(0), currentTime = _o[0], setCurrentTime = _o[1];
        var _p = (0, react_1.useState)(0), endTime = _p[0], setEndTime = _p[1];
        var _q = (0, react_1.useState)(null), audioElement = _q[0], setAudioElement = _q[1];
        var waveSurferRef = (0, react_1.useRef)(null);
        (0, react_1.useEffect)(function () {
            if (display !== "timeline")
                return;
            initializeForTimeline({
                src: src,
                audioElement: audioElement,
                setAudioElement: setAudioElement,
                setLoading: setLoading,
                setCurrentTime: setCurrentTime,
                setEndTime: setEndTime,
                setPosition: setPosition,
                setPlaying: setPlaying,
            });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [src, display]);
        (0, react_1.useEffect)(function () { return function () {
            var _a;
            audioElement === null || audioElement === void 0 ? void 0 : audioElement.remove();
            (_a = waveSurferRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
        }; }, []);
        var theme = (0, material_1.useTheme)();
        var _waveColor = waveColor || theme.palette.primary.light;
        var progressColor = theme.palette.primary.main;
        var mergedContainerStyle = __assign({ height: containerHeight, width: containerWidth }, (containerSx || {}));
        return (react_1.default.createElement(material_1.Stack, { sx: mergedContainerStyle, direction: inline ? "row" : "column", component: paperize ? material_1.Paper : "div", alignItems: "center" },
            inline ? (react_1.default.createElement(PlayPauseButton, { disabled: loading, display: display, audioElement: audioElement, playing: playing, waveSurferRef: waveSurferRef, playPauseIconButtonProps: playPauseIconButtonProps })) : null,
            loading ? (react_1.default.createElement(material_1.LinearProgress, { variant: "determinate", value: progress })) : null,
            react_1.default.createElement(material_1.Stack, { component: material_1.Box, direction: "row", flexGrow: loading ? 0 : 1, height: "100%", width: "100%", alignItems: "center", spacing: 1 },
                react_1.default.createElement(TimeStamp, { time: currentTime, loading: loading, show: showTimestamps }),
                react_1.default.createElement(material_1.Box, { flexGrow: 1, height: "100%", width: "100%", alignItems: "center" },
                    display === "waveform" && (react_1.default.createElement(wavesurfer_react_1.WaveSurfer, { onMount: getInitializeWaveSurfer({
                            src: src,
                            waveSurferRef: waveSurferRef,
                            setLoading: setLoading,
                            setCurrentTime: setCurrentTime,
                            setEndTime: setEndTime,
                            setProgress: setProgress,
                            setPlaying: setPlaying,
                        }), plugins: plugins },
                        react_1.default.createElement(wavesurfer_react_1.WaveForm, { id: id, fillParent: true, mediaControls: true, waveColor: _waveColor, progressColor: progressColor, height: waveHeight, hideScrollbar: false }))),
                    display === "timeline" && !loading && (react_1.default.createElement(material_1.Box, { mx: 1, display: "flex", alignItems: "center", height: "100%" },
                        react_1.default.createElement(material_1.Slider, { onChange: changeCurrentTimeForTimeline(audioElement), size: "small", value: position })))),
                react_1.default.createElement(TimeStamp, { time: endTime, loading: loading, show: showTimestamps })),
            !inline ? (react_1.default.createElement(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center" },
                react_1.default.createElement(PlayPauseButton, { disabled: loading, display: display, audioElement: audioElement, playing: playing, waveSurferRef: waveSurferRef, playPauseIconButtonProps: playPauseIconButtonProps }))) : null));
    }
    exports.default = AudioPlayer;
    function changeCurrentTimeForTimeline(audioElement) {
        return function (e, v) {
            if (audioElement && typeof v === "number") {
                var currentPosition = (audioElement.duration / 100) * v;
                if (audioElement.fastSeek instanceof Function) {
                    audioElement.fastSeek(currentPosition);
                }
                else {
                    audioElement.currentTime = currentPosition;
                }
            }
        };
    }
    function toTimeString(time) {
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(time);
        return date.toTimeString().slice(3, 8);
    }
    function TimeStamp(props) {
        var time = props.time, _a = props.loading, loading = _a === void 0 ? false : _a, _b = props.show, show = _b === void 0 ? true : _b;
        var defaultTimeStr = "00:00";
        var invalidTimeStr = "--:--";
        if (!show) {
            return null;
        }
        var timeStr = Number.isNaN(time) ? invalidTimeStr : toTimeString(time);
        return (react_1.default.createElement(material_1.Box, { sx: containerStyle.timestamp },
            react_1.default.createElement(material_1.Typography, null, loading ? defaultTimeStr : timeStr)));
    }
    function getInitializeWaveSurfer(params) {
        var src = params.src, waveSurferRef = params.waveSurferRef, setLoading = params.setLoading, setCurrentTime = params.setCurrentTime, setEndTime = params.setEndTime, setProgress = params.setProgress, setPlaying = params.setPlaying;
        return function initializeWaveSurfer(waveSurfer) {
            if (!waveSurfer) {
                return;
            }
            waveSurferRef.current = waveSurfer;
            if (src) {
                waveSurfer.load(src);
            }
            var makePlaying = function () { return setPlaying(true); };
            var makeNotPlaying = function () { return setPlaying(false); };
            waveSurfer.on("loading", function (n) {
                setProgress(n);
            });
            waveSurfer.on("ready", function () {
                setLoading(false);
                setEndTime(waveSurfer.getDuration());
            });
            waveSurfer.on("play", makePlaying);
            waveSurfer.on("audioprocess", (0, throttle_typescript_1.throttle)(function (n) {
                setCurrentTime(n);
            }, 100));
            waveSurfer.on("seek", function () {
                setCurrentTime(waveSurfer.getCurrentTime());
            });
            ["finish", "destroy", "pause"].forEach(function (e) {
                return waveSurfer.on(e, makeNotPlaying);
            });
            waveSurfer.on("error", function (e) {
                makeNotPlaying();
                console.error(e);
            });
        };
    }
    function initializeForTimeline(args) {
        var src = args.src, audioElement = args.audioElement, setAudioElement = args.setAudioElement, setLoading = args.setLoading, setCurrentTime = args.setCurrentTime, setEndTime = args.setEndTime, setPosition = args.setPosition, setPlaying = args.setPlaying;
        audioElement === null || audioElement === void 0 ? void 0 : audioElement.pause();
        var audio = new Audio(src);
        var makePlaying = function () { return setPlaying(true); };
        var makeNotPlaying = function () { return setPlaying(false); };
        audio.addEventListener("canplaythrough", function () {
            setLoading(false);
            setEndTime(audio.duration);
        });
        audio.addEventListener("playing", makePlaying);
        audio.addEventListener("timeupdate", (0, throttle_typescript_1.throttle)(function () {
            setCurrentTime(audio.currentTime);
            setPosition((audio.currentTime / audio.duration) * 100);
        }, 100));
        audio.addEventListener("pause", makeNotPlaying);
        audio.addEventListener("ended", makeNotPlaying);
        audio.addEventListener("error", function (e) {
            makeNotPlaying();
            console.error(e);
        });
        setAudioElement(audio);
    }
    function PlayPauseButton(props) {
        var _a = props.disabled, disabled = _a === void 0 ? false : _a, display = props.display, audioElement = props.audioElement, playing = props.playing, waveSurferRef = props.waveSurferRef, _b = props.playPauseIconButtonProps, playPauseIconButtonProps = _b === void 0 ? {} : _b;
        var handlePlay = function () {
            if (display === "timeline" && audioElement) {
                playOrPauseForTimeline(playing, audioElement);
                return null;
            }
            playOrPauseForWaveForm(waveSurferRef);
        };
        function playOrPauseForTimeline(playing, audioElement) {
            playing ? audioElement === null || audioElement === void 0 ? void 0 : audioElement.pause() : audioElement === null || audioElement === void 0 ? void 0 : audioElement.play();
        }
        function playOrPauseForWaveForm(waveSurferRef) {
            var currentWaveSurfer = waveSurferRef.current;
            if (!currentWaveSurfer)
                return null;
            if (playing) {
                currentWaveSurfer.pause();
                return null;
            }
            currentWaveSurfer.play();
        }
        var iconButtonSx = playPauseIconButtonProps.sx, restIconButtonProps = __rest(playPauseIconButtonProps, ["sx"]);
        var mergedSx = __assign(__assign({}, containerStyle.playButton), iconButtonSx);
        return (react_1.default.createElement(material_1.IconButton, __assign({ disabled: disabled, color: "primary", onClick: handlePlay, sx: mergedSx }, restIconButtonProps), playing ? react_1.default.createElement(Pause_1.default, null) : react_1.default.createElement(PlayArrow_1.default, null)));
    }
    var containerStyle = {
        timestamp: {
            minWidth: "50px",
        },
        playButton: {
            m: 1,
        },
    };
});
