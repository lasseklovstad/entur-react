import { FavoriteBorder, Refresh } from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {
  ListItem,
  Box,
  ListItemText,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { FavoriteType, LineGroupType } from "./QueryTypes";
import { TransportIcon } from "./TransportIcon";

type LineProps = {
  line: LineGroupType;
  index: number;
  quayId: string;
  quayName?: string;
  onUpdate?: () => Promise<void>;
};

export const Line = ({
  line,
  index,
  quayId,
  quayName,
  onUpdate,
}: LineProps) => {
  const localStorageString = localStorage.getItem("favorite");
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState<FavoriteType[]>(
    localStorageString ? JSON.parse(localStorageString) : []
  );

  const isFavorite = !!favorite.find(
    (f) => f.lineId === line.id && f.quayId === quayId
  );

  const handleClickFavorite = () => {
    const localStorageString = localStorage.getItem("favorite");
    if (!localStorageString) {
      setFavorite([]);
      localStorage.setItem("favorite", JSON.stringify([]));
      return;
    }
    if (isFavorite) {
      const newFavorite = (
        JSON.parse(localStorageString) as FavoriteType[]
      ).filter((f) => f.lineId !== line.id);
      setFavorite(newFavorite);
      localStorage.setItem("favorite", JSON.stringify(newFavorite));
      return;
    } else {
      const newFavorite = [
        ...(JSON.parse(localStorageString) as FavoriteType[]),
        { lineId: line.id, quayId },
      ];
      setFavorite(newFavorite);
      localStorage.setItem("favorite", JSON.stringify(newFavorite));
      return;
    }
  };

  return (
    <ListItem
      sx={{
        backgroundColor: index % 2 ? "grey.200" : "grey.100",
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
          backgroundColor: line.estimatedCalls[0].realtime ? "green" : "red",
          ml: 1,
        }}
      />
      <ListItemText
        sx={{ ml: 1 }}
        primary={line.estimatedCalls[0].destinationDisplay.frontText}
        secondary={quayName && `${quayName}`}
      />

      {onUpdate && (
        <IconButton
          onClick={async () => {
            setLoading(true);
            await onUpdate();
            setLoading(false);
          }}
        >
          {loading ? <CircularProgress size={22} /> : <Refresh />}
        </IconButton>
      )}
      <IconButton onClick={handleClickFavorite} sx={{ color: "#ff6f6f" }}>
        {isFavorite ? <FavoriteIcon /> : <FavoriteBorder />}
      </IconButton>
      <TransportIcon type={line.transportMode} />
    </ListItem>
  );
};
