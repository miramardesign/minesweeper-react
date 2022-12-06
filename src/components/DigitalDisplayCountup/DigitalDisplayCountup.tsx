import React, { useEffect, useRef, useState } from "react";
import DigitalDisplay from "../DigitalDisplay/DigitalDisplay";
import styles from "./DigitalDisplay.module.scss";

//https://codepen.io/HunorMarton/pen/EqmyMN?editors=0010
type DigitalDisplayProps = {
  id: string;
  timeoutCount: (msg: string) => void;
  startCount: boolean;
  gameOver: boolean;
};

const DigitalDisplayCountup = ({
  id,
  timeoutCount,
  startCount,
  gameOver,
}: DigitalDisplayProps) => {
  let start = new Date().getTime();

  const interval = 1000;
  const [countUp, setCountUp] = useState(0);
  const maxCount = 999;

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

  //start when told
  useEffect(() => {
    if (startCount) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setCountUp(0);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [startCount]);

  //kill anim on timeout max
  useEffect(() => {
    if (countUp >= maxCount) {
      console.log("stop count!!!!!!!!!!!!!!!!", countUp);
      cancelAnimationFrame(requestRef.current);
      timeoutCount("msg countup was" + countUp);
    }
    if (gameOver) {
      cancelAnimationFrame(requestRef.current);
    }
  }, [countUp]);

  return (
    <div>
      <DigitalDisplay id={"time-counter"} displayNum={countUp} />
    </div>
  );
};

export default DigitalDisplayCountup;
