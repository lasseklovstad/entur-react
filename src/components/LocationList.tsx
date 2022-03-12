import createEnturClient from "@entur/sdk";
import {
  Alert,
  AlertTitle,
  AppBar,
  Button,
  CircularProgress,
  Container,
  List,
  ListItemButton,
  Toolbar,
} from "@mui/material";
import { features } from "process";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const service = createEnturClient({
  clientName: "experis-academy-test",
});

const useGetGeoLocation = () => {
  const [geoLocation, setGeoLocation] = useState<GeolocationPosition>();
  const [geoLocationError, setGeoLocationError] =
    useState<GeolocationPositionError>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (l) => setGeoLocation(l),
      (e) => setGeoLocationError(e)
    );
  }, []);

  return { geoLocation, geoLocationError };
};

const getNearbeyStops = async (location: GeolocationCoordinates) => {
  const featureCollection = await service.geocoder.reverse({
    point: {
      lat: location.latitude,
      lon: location.longitude,
    },
    boundary: {
      circle: {
        radius: 2,
      },
    },
    layers: ["venue"],
  });

  return featureCollection.features;
};

interface ILocation {
  name: string;
  id: string;
}

const useNearbyLocations = () => {
  const { geoLocationError, geoLocation } = useGetGeoLocation();
  const [locations, setLocations] = useState<ILocation[]>();
  const [locationsError, setLocationsError] = useState<Error>();
  const [locationsLoading, setLocationsLoading] = useState<boolean>(false);

  const getLocations = useCallback(() => {
    if (geoLocation) {
      setLocationsError(undefined);
      setLocations(undefined);
      setLocationsLoading(true);
      getNearbeyStops(geoLocation.coords)
        .then((f) =>
          setLocations(
            f.map((f) => ({
              name: f.properties.name,
              id: f.properties.id,
            }))
          )
        )
        .catch((e) => setLocationsError(e))
        .finally(() => setLocationsLoading(false));
    }
  }, [geoLocation]);

  useEffect(() => {
    getLocations();
  }, [getLocations]);
  return {
    locations,
    geoLocationError,
    locationsError,
    getLocations,
    locationsLoading,
  };
};

export const LocationList = () => {
  const {
    locations,
    geoLocationError,
    locationsError,
    getLocations,
    locationsLoading,
  } = useNearbyLocations();
  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Button
              onClick={getLocations}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Refresh
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {geoLocationError && (
        <Alert severity="error">
          <AlertTitle>Det oppstod en feil ved henting av posisjon</AlertTitle>
          {geoLocationError.message}
        </Alert>
      )}
      {locationsError && (
        <Alert severity="error">
          <AlertTitle>Det oppstod en feil ved henting av lokasjoner</AlertTitle>
          {locationsError.message}
        </Alert>
      )}
      {locationsLoading && <CircularProgress />}
      <List>
        {locations?.map(({ name, id }) => {
          return (
            <ListItemButton key={id} component={Link} to={`location/${id}`}>
              {name}
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
};
