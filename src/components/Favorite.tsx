import createEnturClient from "@entur/sdk";
import { useState, useCallback, useEffect } from "react";
import { Quay } from "./Quay";
import { IQuay } from "./QueryTypes";

const service = createEnturClient({
  clientName: "experis-academy-test",
});
const getArrivalsAtStop = (id: string) => {
  return service.queryJourneyPlanner(
    `{
              quay(id: "${id}") {
                  id
                  name
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
            `,
    { id }
  );
};

const useQuay = (id: string | undefined) => {
  const [quay, setQuay] = useState<IQuay>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);

  const getQuay = useCallback(() => {
    if (id) {
      setError(undefined);
      setLoading(true);
      getArrivalsAtStop(id)
        .then((json: any) => setQuay(json.quay as IQuay))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    getQuay();
    const intervall = setInterval(() => {
      getQuay();
    }, 1000 * 60);
    return () => clearInterval(intervall);
  }, [getQuay]);
  return {
    quay,
    error,
    loading,
    getQuay,
  };
};

type FavoriteProps = {
  quayId: string;
  lineId: string;
};

export const Favorite = ({ quayId, lineId }: FavoriteProps) => {
  const { quay, getQuay } = useQuay(quayId);
  return (
    <>
      {quay && (
        <Quay
          quay={quay}
          lineId={lineId}
          openDefault
          hideHeader
          onUpdate={getQuay}
        />
      )}
    </>
  );
};
