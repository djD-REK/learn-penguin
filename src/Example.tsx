import * as React from "react";
import { useEffect, useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  AnimatePresence,
  useTransform
} from "framer-motion";
import { findIndex, Position } from "./find-index";
import move from "array-move";
import { add, remove } from "./array-utils";
// END IMPORT

// Spring configs
const onTop = { zIndex: 1 };
const flat = {
  zIndex: 0,
  transition: { delay: 0.3 }
};

// Globals
const initialColors = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF"];
const heights = {
  "#FF008C": 60,
  "#D309E1": 80,
  "#9C1AFF": 40,
  "#7700FF": 100
};
const texts = {
  "#FF008C": "Pingüinos",
  "#D309E1": "Bellos",
  "#9C1AFF": "Son",
  "#7700FF": "Malos"
};
const initialSpeeches = [
  "Yes, we say <br /> <b>Pingüinos son bellos</b> <br /> in penguin!"
];

const CorrectWord = ({ color }) => {
  const x = useMotionValue(0);
  const xInput = [-50, 1, 50];
  const background = useTransform(x, xInput, [
    //"linear-gradient(180deg, #00000 0%, #ff008c 100%)",
    "linear-gradient(180deg,  rgb(211, 9, 225) 0%, #ff008c 100%)",
    //    "linear-gradient(180deg, #7700ff 0%, {rgb(68, 0, 255)} 0%)",
    "linear-gradient(180deg, " + color + " 0%, " + color + " 100%)",
    "linear-gradient(180deg, rgb(230, 255, 0) 0%, rgb(3, 209, 0) 100%)"
  ]);

  return (
    <motion.li
      // y-axis drag: Drag & Drop List Words in Vertical List
      // (Words, with unique background Colors)
      ref={ref}
      // If we're dragging, we want to set the zIndex of that word to be on top of the other words.
      style={{ background: "green", height: heights[color] }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 1.12 }}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={() => {
        console.log(x.current);
        if (x.current > 25) {
          console.log("Re-Check " + color + "!");
        }
        if (x.current < -25) {
          console.log("Re-Close " + color + "!");
        }
      }}
    >
      {texts[color]}
    </motion.li>
  );
};

const Word = ({
  color,
  colors,
  setColors,
  setPosition,
  correctWords,
  setCorrectWords,
  moveWord,
  i
}) => {
  const [isDragging, setDragging] = useState(false);

  // We'll use a `ref` to access the DOM element that the `motion.li` produces.
  // This will allow us to measure its height and position, which will be useful to
  // decide when a dragging element should switch places with its siblings.
  const ref = useRef(null);

  // By manually creating a reference to `dragOriginY` we can manipulate this value
  // if the user is dragging this DOM element while the drag gesture is active to
  // compensate for any movement as the words are re-positioned.
  const dragOriginY = useMotionValue(0);

  // Update the measured position of the word so we can calculate when we should rearrange.
  useEffect(() => {
    setPosition(i, {
      height: ref.current.offsetHeight,
      top: ref.current.offsetTop
    });
  });

  // END OLD ITEM

  // START PROGRESS SWIPES
  const x = useMotionValue(0);
  const xInput = [-50, 1, 50];
  const background = useTransform(x, xInput, [
    //"linear-gradient(180deg, #00000 0%, #ff008c 100%)",
    "linear-gradient(180deg,  rgb(211, 9, 225) 0%, #ff008c 100%)",
    //    "linear-gradient(180deg, #7700ff 0%, {rgb(68, 0, 255)} 0%)",
    "linear-gradient(180deg, " + color + " 0%, " + color + " 100%)",
    "linear-gradient(180deg, rgb(230, 255, 0) 0%, rgb(3, 209, 0) 100%)"
  ]);
  const transparency = useTransform(x, xInput, [
    "linear-gradient(180deg, #ff008c 0%, rgb(211, 9, 225) 100%)",
    "linear-gradient(180deg, #7700ff 0%, rgb(68, 0, 255) 100%)",
    "linear-gradient(180deg, rgb(230, 255, 0) 0%, rgb(3, 209, 0) 100%)"
  ]);
  const progressBackground = useTransform(x, xInput, [
    "linear-gradient(180deg, #ffffff 0%, #ffffff 100%)",
    "linear-gradient(180deg, " + color + " 0%, " + color + " 100%)",
    "linear-gradient(180deg, #ffffff 0%, #ffffff 100%)"
  ]);
  const progressColor = useTransform(x, xInput, [
    //"rgb(211, 9, 225)",
    //        "rgb(68, 0, 255)",
    //  { defaultColor },
    "#ff008c",
    color,
    "rgb(3, 209, 0)"
  ]);
  const opacity = useTransform(x, xInput, [0.0, 0.0, 0.0]);

  const tickPath = useTransform(x, [1, 25], [0, 1]);
  const crossPathA = useTransform(x, [-1, -12], [0, 1]);
  const crossPathB = useTransform(x, [-13, -25], [0, 1]);

  const constraintsRef = useRef(null);
  const rotateY = useTransform(x, [-200, 0, 200], [-45, 0, 45], {
    clamp: false
  });

  // END PROGRESS SWIPES

  return (
    <motion.li
      // y-axis drag: Drag & Drop List Words in Vertical List
      // (Words, with unique background Colors)
      ref={ref}
      initial={false}
      // If we're dragging, we want to set the zIndex of that word to be on top of the other words.
      animate={isDragging ? onTop : flat}
      style={{ background: background, height: heights[color] }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 1.12 }}
      drag="y"
      dragOriginY={dragOriginY}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={1}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => {
        setDragging(false);
      }}
      onDrag={(e, { point }) => moveWord(i, point.y)}
      positionTransition={({ delta }) => {
        if (isDragging) {
          // If we're dragging, we want to "undo" the words movement within the list
          // by manipulating its dragOriginY. This will keep the word under the cursor,
          // even though it's jumping around the DOM.
          dragOriginY.set(dragOriginY.get() + delta.y);
        }

        // If `positionTransition` is a function and returns `false`, it's telling
        // Motion not to animate from its old position into its new one. If we're
        // dragging, we don't want any animation to occur.
        return !isDragging;
      }}
    >
      <motion.span
        className="progress-icon left-close"
        style={{ background: progressBackground }}
      >
        <svg viewBox="0 0 50 50">
          <motion.path
            fill="none"
            strokeWidth="3"
            stroke={progressColor}
            d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
            style={{ translateX: 5, translateY: 5 }}
          />
          <motion.path
            fill="none"
            strokeWidth="3"
            stroke={progressColor}
            d="M17,17 L33,33"
            strokeDasharray="0 1"
            style={{ pathLength: crossPathA }}
          />
          <motion.path
            fill="none"
            strokeWidth="3"
            stroke={progressColor}
            d="M33,17 L17,33"
            strokeDasharray="0 1"
            style={{ pathLength: crossPathB }}
          />
          <motion.path
            fill="none"
            strokeWidth="3"
            stroke={progressColor}
            d="M14,26 L 22,33 L 35,16"
            strokeDasharray="0 1"
            style={{ pathLength: tickPath }}
          />
        </svg>
      </motion.span>

      <motion.div
        className="box"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={() => {
          setDragging(false);
          console.log(x.current);
          if (x.current > 25) {
            console.log("Check " + color + "!");
            if (texts[color] != "Malos") {
              //setCorrectWords(add(correctWords, color));
              setColors(remove(colors, color));
            }
          }
          if (x.current < -25) {
            console.log("Close " + color + "!");
            if (texts[color] == "Malos") setColors(remove(colors, color));
          }
        }}
      >
        {texts[color]}
      </motion.div>
    </motion.li>
  );
};

const Speech = ({ speech, speeches, setSpeeches, i, text }) => {
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-200, 0, 200], [-45, 0, 45], {
    clamp: false
  });

  return (
    <motion.div
      className="speechContainer"
      ref={constraintsRef}
      style={{
        rotateY
      }}
    >
      <motion.div
        className="speechDragArea"
        drag="x"
        dragConstraints={constraintsRef}
        style={{
          x
        }}
        onDragEnd={() => {
          console.log(x.current);
          if (x.current > 25 || x.current < -25) {
            console.log("Close Penguin!");
            setSpeeches(remove(speeches, i));
          }
        }}
      >
        Yes, we say <br /> <b>Pingüinos son bellos</b> <br /> in penguin!
        <motion.div
          className="speechBubble"
          aria-label="speechBubble"
          role="img"
          animate={{
            scale: [0.6, 0.7, 0.6, 0.7, 0.6]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
            loop: Infinity,
            repeatDelay: 0
          }}
        >
          <span role="img" aria-label="speechBubble">
            💬
          </span>
        </motion.div>
        <motion.div
          className="penguin"
          aria-label="penguin"
          role="img"
          animate={{
            scale: [1, 1.5, 2, 2.5, 2]
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 2.5 }}
          whileTap={{ rotate: [5, -5, 5, 0] }}
        >
          <span role="img" aria-label="Penguin">
            🐧
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const Example = () => {
  const [colors, setColors] = useState(initialColors);
  const [correctWords, setCorrectWords] = useState([]);
  //  const [texts, setTexts] = useState(initialTexts);
  const [speeches, setSpeeches] = useState(initialSpeeches);

  // We need to collect an array of height and position data for all of this component's
  // `Word` children, so we can later us that in calculations to decide when a dragging
  // `Word` should swap places with its siblings.
  const positions = useRef<Position[]>([]).current;
  const setPosition = (i: number, offset: Position) => (positions[i] = offset);

  // Find the ideal index for a dragging word based on its position in the array, and its
  // current drag offset. If it's different to its current index, we swap this word with that
  // sibling.
  const moveWord = (i: number, dragOffset: number) => {
    const targetIndex = findIndex(i, dragOffset, positions);
    if (targetIndex !== i) setColors(move(colors, i, targetIndex));
  };

  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-200, 0, 200], [-45, 0, 45], {
    clamp: false
  });

  return (
    <div>
      <ul>
        <h1>Penguins are Beautiful</h1>
        {correctWords.map((color, i) => (
          <CorrectWord
            color={color}
            correctWords={correctWords}
            setCorrectWords={setCorrectWords}
          />
        ))}
      </ul>

      <ul>
        <hr />
        {colors.map((color, i) => (
          <Word
            key={color}
            i={i}
            color={color}
            colors={colors}
            setPosition={setPosition}
            setColors={setColors}
            moveWord={moveWord}
          />
        ))}
      </ul>

      {speeches.map((speech, i) => (
        <Speech
          key={speech}
          i={i}
          speech={speech}
          speeches={speeches}
          setSpeeches={setSpeeches}
          text={speeches[i]}
        />
      ))}

      <motion.button
        className="homeToAntarctica"
        whileHover={{
          scale: 2,
          rotate: [5, -5, 5, 0, 5, -5, 5, 0, -2.5, 0]
          //background: "#265fb5"
          //background: "white"
        }}
        whileTap={{
          scale: 16,
          rotate: 0,
          x: 400,
          y: -400

          //background: "transparent",
          //background: "#265fb5"
        }}
        animate={{
          scale: [0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.93, 0.92, 0.91, 0.9],
          rotate: 0
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25],
          //loop: Infinity,
          repeatDelay: 0
        }}
        drag="y"
        onDragEnd={() => {
          //setColors.setState(initialColors);
          //setTexts = useState(initialTexts);
          //setSpeeches = useState(initialSpeeches);
          window.location.reload();
        }}
      >
        <span role="img" aria-label="Home to Antarctica">
          🇦🇶
        </span>
      </motion.button>
    </div>
  );
};
