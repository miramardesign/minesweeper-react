import React, { useEffect, useRef, useState } from "react";
import DigitalDisplay from "../DigitalDisplay/DigitalDisplay";
import styles from "./DigitalDisplay.module.scss";

type DigitalDisplayProps = {
  id: string;
  timeoutCount: (msg: string) => void;
};

const DigitalDisplayCountup = ({ id, timeoutCount }: DigitalDisplayProps) => {
  let start = new Date().getTime();

  const interval = 1000;
  const [countUp, setCountUp] = useState(0);
  const maxCount = 3;

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef(0);

  const animate = () => {
    if (new Date().getTime() - start >= interval) {
      start = new Date().getTime();

      setCountUp((countUp) => {
        return countUp + 1;
      });
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    console.log("countup==================", countUp);
    if (countUp === maxCount) {
      console.log("stop count!!!!!!!!!!!!!!!!", countUp);
      cancelAnimationFrame(requestRef.current);
      timeoutCount("msg countup was" + countUp);
    }
  }, [countUp]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once

  return (
    <div>
      <DigitalDisplay id={"time-counter"} displayNum={countUp}></DigitalDisplay>
    </div>
  );
};

export default DigitalDisplayCountup;
