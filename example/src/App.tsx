import React, { useState } from "react";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MuiAudioPlayer from "mui-audio-player-plus";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Card from "@mui/material/Card";
import CodeIcon from "@mui/icons-material/Code";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

const mp3Src = require("./test.mp3");
function App() {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const toogleMode = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useTheme();
  const variants = [
    {
      name: "Inline Regular",
      content: (
        <MuiAudioPlayer
          id="inline-timeline"
          display="timeline"
          containerWidth={300}
          inline
          src={mp3Src}
        />
      ),
      code: `<MuiAudioPlayer
          id="inline-timeline"
          display="timeline"
          containerWidth={300}
          inline
          src={mp3Src}
        />`,
    },
    {
      name: "Inline Waveform",
      content: (
        <MuiAudioPlayer id="inline" containerWidth={350} inline src={mp3Src} />
      ),
      code: `<MuiAudioPlayer id="inline" inline src={mp3Src} />,`,
    },
    {
      name: "Without Timestamps",
      content: (
        <MuiAudioPlayer
          id="without-timestamp"
          showTimestamps={false}
          containerWidth={350}
          inline
          src={mp3Src}
        />
      ),
      code: `
      <MuiAudioPlayer
          id="without-timestamp"
          showTimestamps={false}
          containerWidth={350}
          inline
          src={mp3Src}
        />
      `,
    },
    {
      name: "Inline false, Paperize false",
      content: (
        <MuiAudioPlayer
          id="regular"
          containerWidth={300}
          paperize={false}
          src={mp3Src}
        />
      ),
      code: `
      <MuiAudioPlayer
          id="regular"
          containerWidth={300}
          paperize={false}
          src={mp3Src}
        />
      `,
    },
    {
      name: "Customization",
      content: (
        <MuiAudioPlayer
          id="custom"
          src={mp3Src}
          inline
          display="waveform"
          waveColor="green"
          containerWidth={400}
          playPauseIconButtonProps={{
            sx: {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          }}
        />
      ),
      code: `
      
        <MuiAudioPlayer
          id="custom"
          src={mp3Src}
          inline
          display="waveform"
          waveColor="green"
          containerWidth={400}
          playPauseIconButtonProps={{
            sx: {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          }}
        />
      
      `,
    },
  ];
  return (
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode,
        },
      })}
    >
      <CssBaseline />

      <Container
        component="main"
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid
            item
            spacing={2}
            justifyContent="center"
            alignItems="center"
            container
          >
            <Grid item>
              <Typography textAlign="center" gutterBottom variant="h4">
                MUI Audio Player Demo
              </Typography>
            </Grid>
            <Grid item justifyContent="center" alignItems="center">
              <IconButton onClick={toogleMode}>
                {mode === "light" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Grid>
          </Grid>
          {variants.map((v) => (
            <Grid item key={v.name}>
              <Card variant="elevation" elevation={0} sx={{ p: 2 }}>
                <Accordion variant="elevation" elevation={0}>
                  <AccordionSummary expandIcon={<CodeIcon />}>
                    <Box mx={2}>
                      <Box>
                        <Typography
                          gutterBottom
                          variant="h6"
                          textAlign="center"
                        >
                          {v.name}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ width: 300 }}>
                    <code>{v.code}</code>
                  </AccordionDetails>
                </Accordion>
                <Box>{v.content}</Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
