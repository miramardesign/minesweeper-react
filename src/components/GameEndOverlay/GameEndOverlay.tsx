import { useEffect } from "react";
import { playCelebrationSound } from "../../utils/soundEffects";
import styles from "./GameEndOverlay.module.scss";

type GameEndOverlayProps = {
  result: "win" | "lose";
  title: string;
  message: string;
  onPlayAgain: () => void;
  onRedo?: () => void;
};

const sparks = Array.from({ length: 12 }, (_, index) => index);
const fireworks = Array.from({ length: 6 }, (_, index) => index);

const GameEndOverlay = ({
  result,
  title,
  message,
  onPlayAgain,
  onRedo,
}: GameEndOverlayProps) => {
  useEffect(() => {
    if (result === "win") {
      playCelebrationSound();
    }
  }, [result]);

  return (
    <section className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.panel}>
        <div className={styles.animation} aria-hidden="true">
          {result === "lose" ? (
            <div className={styles.explosion}>
              {sparks.map((spark) => (
                <span key={spark}></span>
              ))}
            </div>
          ) : (
            <div className={styles.fireworks}>
              {fireworks.map((firework) => (
                <span key={firework}></span>
              ))}
            </div>
          )}
        </div>

        <h2>{title}</h2>
        <p>{message}</p>
        <div className={styles.actions}>
          <button className="basic" onClick={onPlayAgain} type="button">
            Play again
          </button>
          {result === "lose" && onRedo && (
            <>
              <span>|</span>
              <button className="basic" onClick={onRedo} type="button">
                Redo
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GameEndOverlay;
