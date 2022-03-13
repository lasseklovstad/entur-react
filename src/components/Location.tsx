import createEnturClient from "@entur/sdk";
import { ArrowBack } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  AppBar,
  Button,
  CircularProgress,
  Container,
  IconButton,
  List,
  Toolbar,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Quay } from "./Quay";
import { IQuery } from "./QueryTypes";

const getArrivalsAtStop = (id: string) => {
  return service.queryJourneyPlanner(
    `{
            stopPlace(id: "${id}") {
                id
                name
                quays {
                  id
                  name
                  description
                  lines {id}
                  publicCode
                  estimatedCalls(timeRange: 72100, numberOfDepartures: 10) {     
                  realtime
                  aimedArrivalTime
                  expectedArrivalTime
                  actualArrivalTime
                  date
                  cancellation
                  destinationDisplay {
                    frontText
                  }
                  serviceJourney {
                    journeyPattern {
                      directionType
                      line {
                        id
                        name
                        transportMode
                        publicCode
                        presentation {colour textColour}
                      }
                    }
                  }
                }
                }
            }
          }
          `,
    { id }
  );
};

const useStopPlace = (id: string | undefined) => {
  const [stopPlace, setStopPlace] = useState<IQuery>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);

  const getLocations = useCallback(() => {
    if (id) {
      setError(undefined);
      setLoading(true);
      getArrivalsAtStop(id)
        .then((json: any) => setStopPlace(json.stopPlace as IQuery))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    getLocations();
    const intervall = setInterval(() => {
      getLocations();
    }, 1000 * 60);
    return () => clearInterval(intervall);
  }, [getLocations]);
  return {
    stopPlace,
    error,
    loading,
    getLocations,
  };
};

const service = createEnturClient({
  clientName: "experis-academy-test",
});

export const Location = () => {
  const { locationId } = useParams();

  const { stopPlace, loading, error, getLocations } = useStopPlace(locationId);

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box
              display="flex"
              justifyContent={"space-between"}
              width="100%"
              alignItems={"center"}
            >
              <Box display="flex" alignItems={"center"}>
                <IconButton component={Link} to="/">
                  <ArrowBack sx={{ color: "common.white" }} />
                </IconButton>
                <Typography variant="h6" component="h1">
                  {stopPlace?.name || "-"}
                </Typography>
              </Box>
              <Box display="flex" alignItems={"center"}>
                {loading && <CircularProgress color="inherit" />}
                <Button
                  onClick={() => getLocations()}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {error && (
        <Alert severity="error">
          <AlertTitle>Det oppstod en feil ved henting av stop</AlertTitle>
          {error.message}
        </Alert>
      )}

      <List>
        {stopPlace?.quays
          .filter((q) => q.estimatedCalls.length > 0)
          .sort((q1, q2) => {
            const sort1 = q1.publicCode;
            const sort2 = q2.publicCode;
            if (sort1 > sort2) {
              return 1;
            }
            if (sort1 < sort2) {
              return -1;
            }
            return 0;
          })
          .map((quay, index, quays) => {
            return (
              <Quay quay={quay} key={quay.id} openDefault={quays.length < 3} />
            );
          })}
      </List>
    </>
  );
};
