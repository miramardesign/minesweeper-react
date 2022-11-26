import React, { useEffect, useRef, useState } from "react";
import DigitalDisplay from "../DigitalDisplay/DigitalDisplay";
import styles from "./DigitalDisplay.module.scss";

//https://codepen.io/HunorMarton/pen/EqmyMN?editors=0010
type DigitalDisplayProps = {
  id: string;
  timeoutCount: (msg: string) => void;
  gameOver: boolean;
};

const DigitalDisplayCountup = ({ id, timeoutCount, gameOver }: DigitalDisplayProps) => {
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

  //kill anim on timeout max
  useEffect(() => {
     if (countUp >= maxCount || gameOver) {
      console.log("stop count!!!!!!!!!!!!!!!!", countUp);
      cancelAnimationFrame(requestRef.current);
      timeoutCount("msg countup was" + countUp);
    }
  }, [countUp]);

  //start animation. 
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); 

  return (
    <div>
      <DigitalDisplay id={"time-counter"} displayNum={countUp}></DigitalDisplay>
    </div>
  );
};

export default DigitalDisplayCountup;
