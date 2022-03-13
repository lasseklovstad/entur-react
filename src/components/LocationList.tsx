import createEnturClient from "@entur/sdk";
import {
  Alert,
  AlertTitle,
  AppBar,
  Button,
  CircularProgress,
  Container,
  List,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { Favorite } from "./Favorite";
import { LocationItem } from "./LocationItem";
import { FavoriteType } from "./QueryTypes";

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

const searchStops = async (text: string) => {
  const featureCollection = await service.geocoder.autocomplete({
    text,
    layers: ["venue"],
    size: 10,
    boundary: {
      circle: {
        radius: 2,
      },
    },
  });
  return featureCollection.features;
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

const useNearbyLocations = (text: string | undefined) => {
  const { geoLocationError, geoLocation } = useGetGeoLocation();
  const [locations, setLocations] = useState<ILocation[]>();
  const [locationsError, setLocationsError] = useState<Error>();
  const [locationsLoading, setLocationsLoading] = useState<boolean>(false);

  const getLocations = useCallback(
    (text?: string) => {
      if (text) {
        setLocationsError(undefined);
        setLocations(undefined);
        setLocationsLoading(true);
        searchStops(text)
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
      } else if (geoLocation) {
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
    },
    [geoLocation]
  );

  useEffect(() => {
    getLocations(text);
  }, [getLocations, text]);
  return {
    locations,
    geoLocationError,
    locationsError,
    getLocations,
    locationsLoading,
  };
};

export const LocationList = () => {
  const [searchText, setSearchText] = useState("");
  const [debounce, setDebounce] = useState("");
  const [hideError, setHideError] = useState(false);

  useEffect(() => {
    const ref = setTimeout(() => {
      setDebounce(searchText);
    }, 500);
    return () => {
      clearTimeout(ref);
    };
  }, [searchText]);

  const {
    locations,
    geoLocationError,
    locationsError,
    getLocations,
    locationsLoading,
  } = useNearbyLocations(debounce);
  const localStorageString = localStorage.getItem("favorite");
  const [favorite, setFavorite] = useState<FavoriteType[]>(
    localStorageString ? JSON.parse(localStorageString) : []
  );

  const resetFavorites = () => {
    localStorage.setItem("favorite", "[]");
    setFavorite([]);
  };
  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Button
              onClick={() => getLocations()}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Refresh
            </Button>
            <Button
              onClick={resetFavorites}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Reset favoritter
            </Button>
            <TextField
              sx={{ color: "common.white" }}
              value={searchText}
              label="Søk"
              placeholder="Oslo"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Toolbar>
        </Container>
      </AppBar>

      {geoLocationError && !hideError && (
        <Alert severity="error">
          <AlertTitle>Det oppstod en feil ved henting av posisjon</AlertTitle>
          {geoLocationError.message}
          <Button onClick={() => setHideError(true)}>Skjul feilmelding</Button>
        </Alert>
      )}
      {locationsError && (
        <Alert severity="error">
          <AlertTitle>Det oppstod en feil ved henting av lokasjoner</AlertTitle>
          {locationsError.message}
        </Alert>
      )}
      {locationsLoading && <CircularProgress />}
      {!!favorite.length && (
        <>
          <Typography variant="h5" sx={{ ml: 1, mt: 1 }}>
            Favoritter
          </Typography>
          <List>
            {favorite?.map(({ quayId, lineId }) => {
              return (
                <Favorite
                  key={quayId + lineId}
                  quayId={quayId}
                  lineId={lineId}
                />
              );
            })}
          </List>
        </>
      )}
      <Typography variant="h5" sx={{ ml: 1, mt: 1 }}>
        {debounce ? "Søk" : "I Nærheten"}
      </Typography>
      <List>
        {locations?.map(({ name, id }) => {
          return <LocationItem key={id} id={id} name={name} />;
        })}
      </List>
    </>
  );
};
