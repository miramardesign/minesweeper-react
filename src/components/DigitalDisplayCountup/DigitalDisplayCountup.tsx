import React, { useEffect, useRef, useState } from "react";
import DigitalDisplay from "../DigitalDisplay/DigitalDisplay";
import styles from "./DigitalDisplay.module.scss";

type DigitalDisplayProps = {
  id: string;
  displayNum: number;
};

const DigitalDisplayCountup = ({ displayNum, id }: DigitalDisplayProps) => {
  let start = new Date().getTime();

  const interval = 1000;
  const [countUp, setCountUp] = useState(0);
  const maxCount = 999;

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef(0);

  const stopParentGame = () => {
    console.log('stop game here!!!');
  }

  const animate = () => {
    if (new Date().getTime() - start >= interval) {
      console.log("animate, count", countUp);
      if (countUp > maxCount) {
        console.log("stop count!!!!!!!!!!!!!!!!", countUp);
        return cancelAnimationFrame(requestRef.current);
      }

      start = new Date().getTime();
      console.log("animate, count", countUp);

      setCountUp((countUp) => {
        if (countUp === maxCount) {
          console.log("stop count!!!!!!!!!!!!!!!!", countUp);
          cancelAnimationFrame(requestRef.current);
          stopParentGame();
          return maxCount;
        }

        return countUp + 1;
      });
 
     }
    requestRef.current = requestAnimationFrame(animate);
  };

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
