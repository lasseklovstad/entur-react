import { ListItemButton, ListItemText, ListItem } from "@mui/material";
import { Fragment, useState } from "react";
import { Line } from "./Line";
import { IEstimatedCall, IQuay, LineGroupType } from "./QueryTypes";
import { Time } from "./Time";
import { TransportIcon } from "./TransportIcon";

type QuayProps = {
  quay: IQuay;
  lineId?: string;
  openDefault?: boolean;
  hideHeader?: boolean;
  onUpdate?: () => Promise<void>;
};

export const Quay = ({
  quay,
  lineId,
  openDefault = false,
  hideHeader = false,
  onUpdate,
}: QuayProps) => {
  const lines = quay.estimatedCalls.reduce(
    (currentLines: LineGroupType[], estimatedCall: IEstimatedCall) => {
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
  const [open, setOpen] = useState(openDefault);

  const transportModes = Array.from(new Set(lines.map((l) => l.transportMode)));

  return (
    <>
      {!hideHeader && (
        <ListItemButton
          divider
          onClick={() => setOpen(!open)}
          sx={{ typography: "body1", fontWeight: 400 }}
        >
          <ListItemText
            primary={
              quay.publicCode ? `Platform ${quay.publicCode}` : quay.name
            }
            secondary={quay.description && ` ${quay.description}`}
          />
          {transportModes.map((mode) => (
            <TransportIcon key={mode} type={mode} />
          ))}
        </ListItemButton>
      )}
      {open &&
        lines
          .filter((l) => {
            if (lineId !== undefined) {
              return l.id === lineId;
            } else {
              return true;
            }
          })
          .map((line, index, linesArray) => {
            return (
              <Fragment key={line.id + quay.id}>
                <Line
                  line={line}
                  index={index}
                  quayId={quay.id}
                  quayName={hideHeader ? quay.name : undefined}
                  onUpdate={onUpdate}
                />
                <ListItem
                  sx={{
                    backgroundColor: index % 2 ? "grey.200" : "grey.100",
                  }}
                  divider={index === linesArray.length - 1}
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
                      <Time
                        key={arrival.valueOf()}
                        timeDiff={diffDate}
                        arrivalDate={arrival}
                        seperator={index !== calls.length - 1}
                      />
                    );
                  })}
                </ListItem>
              </Fragment>
            );
          })}
    </>
  );
};
