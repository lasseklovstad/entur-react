import createEnturClient from "@entur/sdk";
import { ListItemButton, ListItemText } from "@mui/material";
import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { TransportModeTypes } from "./QueryTypes";
import { TransportIcon } from "./TransportIcon";

const service = createEnturClient({
  clientName: "experis-academy-test",
});

const getArrivalsAtStop = (id: string) => {
  return service.queryJourneyPlanner(
    `{
        stopPlace(id: "${id}") {
          id
          transportMode
          
        }
      }
    `,
    { id }
  );
};

const useStopPlace = (id: string | undefined) => {
  const [transportModes, setTransportModes] = useState<
    TransportModeTypes | TransportModeTypes[]
  >();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);

  const getLocations = useCallback(() => {
    if (id) {
      setError(undefined);
      setLoading(true);
      getArrivalsAtStop(id)
        .then((json: any) =>
          setTransportModes(
            json.stopPlace.transportMode as TransportModeTypes[]
          )
        )
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    getLocations();
  }, [getLocations]);
  return {
    transportModes,
    error,
    loading,
    getLocations,
  };
};

type LocationItemProps = {
  id: string;
  name: string;
};

export const LocationItem = ({ name, id }: LocationItemProps) => {
  const { transportModes } = useStopPlace(id);
  const getTransportModes = () => {
    if (typeof transportModes === "string") {
      return <TransportIcon type={transportModes} />;
    }
    return (
      <>
        {transportModes?.map((modes) => (
          <TransportIcon type={modes} />
        ))}
      </>
    );
  };
  return (
    <ListItemButton component={Link} to={`location/${id}`}>
      <ListItemText>{name}</ListItemText>
      {getTransportModes()}
    </ListItemButton>
  );
};
