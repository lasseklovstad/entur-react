import { useEffect, useState } from "react";

type TimeProps = {
  timeDiff: Date;
  arrivalDate: Date;
  seperator: boolean;
};

export const Time = ({
  timeDiff: startTime,
  arrivalDate,
  seperator,
}: TimeProps) => {
  const [time, setTime] = useState(startTime);
  useEffect(() => {
    const intervall = setInterval(() => {
      setTime((time) => {
        return new Date(time.valueOf() - 1000);
      });
    }, 1000);
    return () => clearInterval(intervall);
  }, []);

  if (time.valueOf() < 0) {
    return null;
  }
  const hours = time.getHours() - 1;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  if (hours) {
    <>
      {arrivalDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })}{" "}
      {seperator && ","}
    </>;
  }
  if (minutes) {
    return (
      <>
        {minutes}m {seperator && ","}
      </>
    );
  }

  return (
    <>
      {seconds}s {seperator && ","}
    </>
  );
};
