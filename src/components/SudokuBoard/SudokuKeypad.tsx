import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import styles from "./SudokuBoard.module.scss";

export type NumberPadOption = number;

type SudokuKeypadProps = {
  completedNumbers: Set<number>;
  isLandscape?: boolean;
  landscapePlacement: "left" | "middle" | "right";
  portraitIsAbove: boolean;
  sharedYouTubeEmbedUrl?: string | null;
  selectedKeypadNumber: number | null;
  onPlacementChange: (
    placement: number | "left" | "middle" | "right",
    isLandscape: boolean
  ) => void;
  onDragChange: (isDragging: boolean) => void;
  onNumberPadClick: (numberPadOption: NumberPadOption) => void;
};

const numberPadRows = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
] as NumberPadOption[][];
const longPressDelay = 500;
const portraitAboveSnapZoneCount = 6;
const keypadViewportInset = {
  top: 50,
  right: 14,
  rightLandscape: 50,
  bottom: 50,
  left: 14,
};

type KeypadPosition = {
  left: number;
  top: number;
};
type KeypadOrientation = "portrait" | "landscape";
type KeypadDroppedPositions = Record<KeypadOrientation, KeypadPosition | null>;

const getBoardRect = () =>
  document
    .querySelector('[aria-label="Sudoku board"]')
    ?.getBoundingClientRect();

const clampKeypadPosition = (
  position: KeypadPosition,
  keypadRect: Pick<DOMRect, "width" | "height">,
  isLandscape: boolean
): KeypadPosition => {
  const viewport = window.visualViewport;
  const viewportWidth = viewport?.width ?? window.innerWidth;
  const viewportHeight = viewport?.height ?? window.innerHeight;
  const viewportRightInset = isLandscape
    ? keypadViewportInset.rightLandscape
    : keypadViewportInset.right;
  const viewportLeft = (viewport?.offsetLeft ?? 0) + keypadViewportInset.left;
  const viewportTop = (viewport?.offsetTop ?? 0) + keypadViewportInset.top;
  const maxLeft =
    viewportLeft +
    Math.max(
      0,
      viewportWidth -
        keypadRect.width -
        keypadViewportInset.left -
        viewportRightInset
    );
  const maxTop =
    viewportTop +
    Math.max(
      0,
      viewportHeight -
        keypadRect.height -
        keypadViewportInset.top -
        keypadViewportInset.bottom
    );

  return {
    left: Math.min(Math.max(position.left, viewportLeft), maxLeft),
    top: Math.min(Math.max(position.top, viewportTop), maxTop),
  };
};

const isPointInsideRect = (
  clientX: number,
  clientY: number,
  rect: DOMRect
) =>
  clientX >= rect.left &&
  clientX <= rect.right &&
  clientY >= rect.top &&
  clientY <= rect.bottom;

const isDropOverBoard = (event: PointerEvent<HTMLDivElement>) => {
  const boardRect = getBoardRect();

  return boardRect
    ? isPointInsideRect(event.clientX, event.clientY, boardRect)
    : false;
};

const getPortraitDropPlacement = (
  event: PointerEvent<HTMLDivElement>,
  portraitIsAbove: boolean
) => {
  const boardRect = getBoardRect();

  if (!boardRect) {
    return event.clientY < window.innerHeight / 2
      ? portraitAboveSnapZoneCount - 1
      : portraitAboveSnapZoneCount;
  }

  if (isPointInsideRect(event.clientX, event.clientY, boardRect)) {
    return portraitIsAbove
      ? portraitAboveSnapZoneCount
      : portraitAboveSnapZoneCount - 1;
  }

  if (event.clientY < boardRect.top) {
    return portraitAboveSnapZoneCount - 1;
  }

  if (event.clientY > boardRect.bottom) {
    return portraitAboveSnapZoneCount;
  }

  return event.clientY < boardRect.top + boardRect.height / 2
    ? portraitAboveSnapZoneCount - 1
    : portraitAboveSnapZoneCount;
};

const getDropPlacement = (
  event: PointerEvent<HTMLDivElement>,
  isLandscape: boolean,
  landscapePlacement: "left" | "middle" | "right",
  portraitIsAbove: boolean
) => {
  if (isLandscape) {
    const boardRect = getBoardRect();

    if (
      boardRect &&
      isPointInsideRect(event.clientX, event.clientY, boardRect)
    ) {
      return landscapePlacement === "left" ? "right" : "left";
    }

    const horizontalDropRatio = event.clientX / window.innerWidth;

    if (horizontalDropRatio < 1 / 3) {
      return "left";
    }

    return horizontalDropRatio < 2 / 3 ? "middle" : "right";
  }

  return getPortraitDropPlacement(event, portraitIsAbove);
};

const SudokuKeypad = ({
  completedNumbers,
  isLandscape = false,
  landscapePlacement,
  portraitIsAbove,
  sharedYouTubeEmbedUrl = null,
  selectedKeypadNumber,
  onPlacementChange,
  onDragChange,
  onNumberPadClick,
}: SudokuKeypadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPosition, setDragPreviewPosition] =
    useState<KeypadPosition | null>(null);
  const [droppedPositions, setDroppedPositions] =
    useState<KeypadDroppedPositions>({
      landscape: null,
      portrait: null,
    });
  const [showMoveHint, setShowMoveHint] = useState(true);
  const keypadDragLayerRef = useRef<HTMLDivElement | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const dragStart = useRef<{
    pointerId: number;
    grabX: number;
    grabY: number;
  } | null>(null);
  const shouldSuppressClick = useRef(false);
  const keypadOrientation: KeypadOrientation = isLandscape
    ? "landscape"
    : "portrait";
  const droppedPosition = droppedPositions[keypadOrientation];

  useEffect(() => {
    const hintTimer = window.setTimeout(() => {
      setShowMoveHint(false);
    }, 5000);

    return () => window.clearTimeout(hintTimer);
  }, []);

  useEffect(() => {
    return () => {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!droppedPosition) {
      return;
    }

    const clampDroppedPosition = () => {
      const keypadRect = keypadDragLayerRef.current?.getBoundingClientRect();

      if (!keypadRect) {
        return;
      }

      setDroppedPositions((currentPositions) => {
        const currentPosition = currentPositions[keypadOrientation];

        return {
          ...currentPositions,
          [keypadOrientation]: currentPosition
            ? clampKeypadPosition(currentPosition, keypadRect, isLandscape)
            : currentPosition,
        };
      });
    };

    window.addEventListener("resize", clampDroppedPosition);
    window.visualViewport?.addEventListener("resize", clampDroppedPosition);
    window.visualViewport?.addEventListener("scroll", clampDroppedPosition);

    return () => {
      window.removeEventListener("resize", clampDroppedPosition);
      window.visualViewport?.removeEventListener(
        "resize",
        clampDroppedPosition
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        clampDroppedPosition
      );
    };
  }, [droppedPosition, isLandscape, keypadOrientation]);

  const startLongPressTimer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
    }

    const pointerId = event.pointerId;

    longPressTimer.current = window.setTimeout(() => {
      const keypadRect = keypadDragLayerRef.current?.getBoundingClientRect();

      if (!keypadRect) {
        return;
      }

      dragStart.current = {
        pointerId,
        grabX: event.clientX - keypadRect.left,
        grabY: event.clientY - keypadRect.top,
      };
      setDragPreviewPosition(
        clampKeypadPosition(
          {
            left: keypadRect.left,
            top: keypadRect.top,
          },
          keypadRect,
          isLandscape
        )
      );
      keypadDragLayerRef.current?.setPointerCapture(pointerId);
      setShowMoveHint(false);
      setIsDragging(true);
      onDragChange(true);
      shouldSuppressClick.current = true;
      longPressTimer.current = null;
    }, longPressDelay);
  };

  const stopLongPressTimer = () => {
    if (longPressTimer.current === null) {
      return;
    }

    window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };

  const handleKeypadPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStart.current?.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const keypadRect = keypadDragLayerRef.current?.getBoundingClientRect();

    if (!keypadRect) {
      return;
    }

    setDragPreviewPosition(
      clampKeypadPosition(
        {
          left: event.clientX - dragStart.current.grabX,
          top: event.clientY - dragStart.current.grabY,
        },
        keypadRect,
        isLandscape
      )
    );
  };

  const finishKeypadDrag = (event: PointerEvent<HTMLDivElement>) => {
    stopLongPressTimer();

    if (dragStart.current?.pointerId === event.pointerId) {
      if (isDropOverBoard(event)) {
        onPlacementChange(
          getDropPlacement(
            event,
            isLandscape,
            landscapePlacement,
            portraitIsAbove
          ),
          isLandscape
        );
        setDroppedPositions((currentPositions) => ({
          ...currentPositions,
          [keypadOrientation]: null,
        }));
      } else if (dragPreviewPosition) {
        setDroppedPositions((currentPositions) => ({
          ...currentPositions,
          [keypadOrientation]: dragPreviewPosition,
        }));
      }

      keypadDragLayerRef.current?.releasePointerCapture(event.pointerId);
      dragStart.current = null;
      setDragPreviewPosition(null);
      setIsDragging(false);
      onDragChange(false);
      shouldSuppressClick.current = true;
    }
  };

  const handleKeypadClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!shouldSuppressClick.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    shouldSuppressClick.current = false;
  };

  return (
    <div className={`${styles.keypadStack} ${styles.debugBlue}`}>
      {isLandscape && sharedYouTubeEmbedUrl && (
        <section className={styles.sharedVideoPanel} aria-label="Shared video">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            src={sharedYouTubeEmbedUrl}
            title="Shared YouTube video"
          />
        </section>
      )}
      <div className={`${styles.keypadWrap} ${styles.debugGreen}`}>
        <div
          className={`${styles.keypadDragLayer} ${styles.debugYellow} ${
            isDragging ? styles.keypadDragging : ""
          }`}
          ref={keypadDragLayerRef}
          onClickCapture={handleKeypadClickCapture}
          onContextMenu={(event) => event.preventDefault()}
          onPointerCancel={finishKeypadDrag}
          onPointerDown={startLongPressTimer}
          onPointerLeave={() => {
            if (!isDragging) {
              stopLongPressTimer();
            }
          }}
          onPointerMove={handleKeypadPointerMove}
          onPointerUp={finishKeypadDrag}
          style={
            isDragging && dragPreviewPosition
              ? {
                  left: dragPreviewPosition.left,
                  position: "fixed",
                  top: dragPreviewPosition.top,
                }
              : droppedPosition
              ? {
                  left: droppedPosition.left,
                  position: "fixed",
                  top: droppedPosition.top,
                }
              : undefined
          }
        >
          <div
            className={`${styles.numberPad} ${styles.debugRed}`}
            aria-label="Sudoku number pad"
          >
            {numberPadRows.map((row) => (
              <div className={styles.numberPadRow} key={row.join("-")}>
                {row.map((numberPadOption) => {
                  const isCompletedNumber =
                    completedNumbers.has(numberPadOption);
                  const isSelectedKeypadNumber =
                    numberPadOption === selectedKeypadNumber;

                  return (
                    <button
                      aria-label={
                        isCompletedNumber
                          ? `${numberPadOption} completed`
                          : isSelectedKeypadNumber
                          ? `${numberPadOption} selected`
                          : `Enter ${numberPadOption}`
                      }
                      aria-pressed={isSelectedKeypadNumber}
                      className={`${styles.numberButton} ${
                        isCompletedNumber ? styles.completedNumberButton : ""
                      } ${
                        isSelectedKeypadNumber
                          ? styles.selectedNumberButton
                          : ""
                      }`}
                      disabled={isCompletedNumber}
                      key={numberPadOption}
                      onClick={() => onNumberPadClick(numberPadOption)}
                      type="button"
                    >
                      {isCompletedNumber ? "\u2713" : numberPadOption}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {showMoveHint && (
            <div className={styles.keypadMoveHint} aria-hidden="true">
              <i className="bi bi-arrows-move" />
              <span>Long press to move</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SudokuKeypad;
