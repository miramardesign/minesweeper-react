import React from "react";
import styles from "./DigitalDisplay.module.scss";

type DigitalDisplayProps = {
  id: string;
  displayNum: number;
};

//somewhat from: https://codepen.io/rafa-rodrigues/pen/LYErBpb
const DigitalDisplay = ({ displayNum, id }: DigitalDisplayProps) => {
 

  if(isNaN(displayNum)){
    throw "not a number! expected nu7mbers in digittal display, letters not defined"
  }

  const displayString = displayNum.toString();

  // loop thrue digits and display with the triangles in css by classname
  return (
    <section>
      <div id={id} className={styles["digital"]}>
        {displayString.split("").map((char: string, index:number) => (      
          <div key={index}           
           className={`
           ${styles[`digit`]}           
           ${styles[`num-${char}`]}         
            `}
           >
            <div className={styles["unit"]}></div>
            <div className={styles["unit"]}></div>
            <div className={styles["unit"]}></div>
            <div className={styles["unit"]}></div>
            <div className={styles["unit"]}></div>
            <div className={styles["unit"]}></div>
            <div className={styles["unit"]}></div>
          </div>
        ))}
     
      </div>
    </section>
  );
};

export default DigitalDisplay;
