export interface IQuay {
  id: string;
  name: string;
  publicCode: string;
  description: string | null;
  estimatedCalls: IEstimatedCall[];
}

export type TransportModeTypes =
  | "air"
  | "bus"
  | "cableway"
  | "water"
  | "funicular"
  | "lift"
  | "rail"
  | "metro"
  | "tram"
  | "trolleybus"
  | "monorail"
  | "coach"
  | "unknown";

export interface ILine {
  id: string;
  name: string;
  transportMode: TransportModeTypes;
  publicCode: string;
  presentation: {
    colour: string;
    textColour: string;
  } | null;
}

export interface IEstimatedCall {
  realtime: boolean;
  aimedArrivalTime: string;
  expectedArrivalTime: string | null;
  actualArrivalTime: string | null;
  date: string;
  cancellation: boolean;
  destinationDisplay: {
    frontText: string | null;
  };
  serviceJourney: {
    journeyPattern: {
      directionType: string;
      line: ILine;
    };
  };
}

export interface IQuery {
  id: string;
  name: string;
  quays: IQuay[];
}
