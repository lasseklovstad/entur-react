import { DirectionsBus, Subway, Train, Tram } from "@mui/icons-material";
import { TransportModeTypes } from "./QueryTypes";

type TransportIconProps = {
  type: TransportModeTypes;
};

export const TransportIcon = ({ type }: TransportIconProps) => {
  switch (type) {
    case "bus":
      return <DirectionsBus />;
    case "tram":
      return <Tram />;
    case "rail":
      return <Train />;
    case "metro":
      return <Subway />;
    default:
      return null;
  }
};
