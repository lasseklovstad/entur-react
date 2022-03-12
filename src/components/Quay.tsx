import {
  Input,
  Output,
  Refresh,
  SwitchLeft,
  SwitchRight,
} from "@mui/icons-material";
import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useState } from "react";
import { IEstimatedCall, ILine, IQuay } from "./QueryTypes";
import { Time } from "./Time";
import { TransportIcon } from "./TransportIcon";

type QuayProps = {
  quay: IQuay;
};

type LineType = { estimatedCalls: IEstimatedCall[] } & ILine;

export const Quay = ({ quay }: QuayProps) => {
  const [open, setOpen] = useState(false);
  const lines = quay.estimatedCalls.reduce(
    (currentLines: LineType[], estimatedCall: IEstimatedCall) => {
      const currentLine = estimatedCall.serviceJourney.journeyPattern.line;
      if (currentLines.find((line) => line.id === currentLine.id)) {
        return currentLines.map((line) => {
          return line.id === currentLine.id
            ? {
                ...line,
                estimatedCalls: [...line.estimatedCalls, estimatedCall],
              }
            : line;
        });
      }
      return [
        ...currentLines,
        {
          ...currentLine,
          estimatedCalls: [estimatedCall],
        },
      ];
    },
    []
  );

  const transportModes = Array.from(new Set(lines.map((l) => l.transportMode)));

  return (
    <>
      <ListItemButton
        divider
        onClick={() => setOpen(!open)}
        sx={{ typography: "body1", fontWeight: 400 }}
      >
        <ListItemText
          primary={quay.publicCode ? `Platform ${quay.publicCode}` : quay.name}
          secondary={quay.description && ` ${quay.description}`}
        />
        {transportModes.map((mode) => (
          <TransportIcon type={mode} />
        ))}
      </ListItemButton>
      {open &&
        lines.map((line, index) => {
          return (
            <Fragment key={line.id}>
              <ListItem
                sx={{
                  backgroundColor: index % 2 ? "grey.200" : "common.white",
                }}
              >
                <Box
                  sx={{
                    color: `#${line.presentation?.textColour}`,
                    backgroundColor: `#${line.presentation?.colour}`,
                    border: "solid 1px black",
                    pt: 0.5,
                    pb: 0.5,
                    pr: 1,
                    pl: 1,
                  }}
                >
                  {line.publicCode}
                </Box>
                <Box
                  sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: line.estimatedCalls[0].realtime
                      ? "green"
                      : "red",
                    ml: 1,
                  }}
                />
                <ListItemText sx={{ ml: 1 }}>
                  {line.estimatedCalls[0].destinationDisplay.frontText}
                </ListItemText>
                <TransportIcon type={line.transportMode} />
              </ListItem>
              <ListItem
                sx={{
                  backgroundColor: index % 2 ? "grey.200" : "common.white",
                }}
              >
                {line.estimatedCalls.slice(0, 5).map((call, index, calls) => {
                  const now = new Date();
                  const arrival = new Date(
                    call.expectedArrivalTime ||
                      call.actualArrivalTime ||
                      call.aimedArrivalTime
                  );
                  const diff = arrival.valueOf() - now.valueOf();
                  const diffDate = new Date(diff);
                  if (diff < 0) {
                    return null;
                  }
                  return (
                    <Fragment key={index}>
                      <Time timeDiff={diffDate} arrivalDate={arrival} />
                      {index !== calls.length - 1 && ", "}
                    </Fragment>
                  );
                })}
              </ListItem>
            </Fragment>
          );
        })}
    </>
  );
};
