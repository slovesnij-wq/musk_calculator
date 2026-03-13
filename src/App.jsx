import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MILESTONES, RATE_USD_PER_SECOND } from "./content/milestones.js";
import dollarIcon from "./assets/dollar.svg";

const RATE = RATE_USD_PER_SECOND;
const CARD_WIDTH = 360;
const CARD_HEIGHT = 112;
const CARD_GAP = 8;
const CARD_RISE_SPEED = 60;
const CARD_RISE_BUFFER = 80;

const DIGIT_SVGS = {
  "0": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M166.364 1372.08V1288.94H83.1364V1205.77H0V166.311H83.1364V83.1466H166.364V0.000854492H873.161V83.1466H956.299V166.311H1039.53V1205.77H956.299V1288.94H873.161V1372.08H166.364Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M218.358 1320.11V1236.96H135.13V1153.8H51.9937V218.277H135.13V135.114H218.358V51.9678H821.166V135.114H904.394V218.277H987.53V1153.8H904.394V1236.96H821.166V1320.11H218.358ZM769.443 1268.14V1184.99H852.58V1101.83H935.717V270.245H852.58V187.081H769.443V103.935H270.442V187.081H187.305V270.245H104.169V1101.83H187.305V1184.99H270.442V1268.14H769.443ZM353.669 1101.83V1018.66H270.442V935.519H436.806V852.346H519.942V769.2H603.08V686.036H686.306V602.873H769.443V1018.66H686.306V1101.83H353.669ZM634.131 1049.86V966.688H717.268V738.004H654.893V821.168H571.756V904.313H488.529V987.486H405.393V1049.86H634.131ZM270.442 769.2V353.39H353.669V270.245H686.306V353.39H769.443V436.554H603.08V519.727H519.942V602.873H436.806V686.036H353.669V769.2H270.442ZM384.631 634.069V550.905H467.768V467.76H550.995V384.587H634.131V322.212H405.393V405.358H322.256V634.069H384.631Z" fill="var(--bg)"/>` },
  "1": { viewBox: "0 0 707 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M0 1372.08V997.895H166.309V540.507H0V166.311H83.1634V83.1466H166.309V0.000854492H540.497V997.895H706.833V1372.08H0Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M51.9861 1320.11V1049.86H218.296V488.53H51.9861V218.277H135.15V135.114H218.296V51.9678H488.54V1049.86H654.876V1320.11H51.9861ZM602.665 1268.14V1101.83H436.329V103.935H270.019V187.081H186.873V270.244H103.709V436.563H270.019V1101.83H103.709V1268.14H602.665Z" fill="var(--bg)"/>` },
  "2": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M6.10352e-05 1372.08V665.266H83.1458V582.103H166.31V540.498H6.10352e-05V166.311H83.1458V83.1466H166.31V0.000854492H873.143V83.1466H956.289V166.311H1039.46V706.817H956.289V789.981H873.143V873.144H457.36V956.29H374.188V997.894H1039.46V1372.08H6.10352e-05Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M51.9745 1320.11V717.233H135.12V634.069H218.284V550.906H634.076V467.76H717.24V405.358H634.076V322.212H405.391V405.358H322.218V488.522H51.9745V218.277H135.12V135.114H218.284V51.9683H821.175V135.114H904.32V218.277H987.493V654.84H904.32V738.004H821.175V821.168H405.391V904.313H322.218V1049.86H987.493V1320.11H51.9745ZM935.526 1268.14V1101.83H270.251V852.347H353.424V769.201H769.207V686.037H852.353V602.873H935.526V270.245H852.353V187.081H769.207V103.935H270.251V187.081H187.088V270.245H103.942V436.554H270.251V353.391H353.424V270.245H686.043V353.391H769.207V519.727H686.043V602.873H270.251V686.037H187.088V769.201H103.942V1268.14H935.526Z" fill="var(--bg)"/>` },
  "3": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M166.311 1372.08V1288.93H83.1378V1205.77H0.000854492V831.583H332.62V540.505H0.000854492V166.308H83.1378V83.1444H166.311V-0.00134277H873.144V83.1444H956.29V166.308H1039.44V1205.77H956.29V1288.93H873.144V1372.08H166.311Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M218.289 1320.1V1236.96H135.116V1153.79H51.9792V883.55H322.223V966.696H405.387V1049.86H634.081V966.696H717.245V904.312H634.081V821.175H384.599V550.904H634.081V467.758H717.245V405.356H634.081V322.21H405.387V405.356H322.223V488.528H51.9792V218.276H135.116V135.112H218.289V51.9658H821.179V135.112H904.325V218.276H987.453V654.838H904.325V717.24H987.453V1153.79H904.325V1236.96H821.179V1320.1H218.289ZM769.284 1268.34V1185.2H852.43V1102.03H935.594V769.415H852.43V603.078H935.594V270.45H852.43V187.287H769.284V104.141H270.329V187.287H187.156V270.45H104.01V436.769H270.329V353.596H353.492V270.45H686.111V353.596H769.284V519.933H686.111V603.078H436.638V769.415H686.111V852.552H769.284V1018.87H686.111V1102.03H353.492V1018.87H270.329V935.725H104.01V1102.03H187.156V1185.2H270.329V1268.34H769.284Z" fill="var(--bg)"/>` },
  "4": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M499.002 1372.08V1039.46H0.000732422V498.939H83.2286V415.793H166.365V332.62H249.501V249.456H332.639V166.311H415.866V83.1466H499.002V0.000854492H873.163V665.266H1039.53V1039.46H873.163V1372.08H499.002Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M550.905 1320.11V987.487H51.9946V550.906H135.132V467.76H218.359V384.587H301.495V301.423H384.632V218.277H467.769V135.114H550.905V51.9683H821.258V717.233H987.531V987.487H821.258V1320.11H550.905ZM769.264 1268.14V935.519H935.537V769.201H769.264V103.935H602.9V187.081H519.763V270.245H436.626V353.391H353.49V436.554H270.263V519.727H187.127V602.873H103.989V935.519H602.9V1268.14H769.264ZM270.263 769.201V686.037H353.49V602.873H436.626V519.727H519.763V436.554H602.9V769.201H270.263ZM550.905 717.233V571.695H488.53V654.84H405.394V717.233H550.905Z" fill="var(--bg)"/>` },
  "5": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M166.274 1372.08V1288.94H83.1364V1205.77H0V831.585H374.16V914.722H457.297V997.895H582.047V914.722H665.274V789.98H582.047V706.816H0V0.000610352H1039.44V374.188H873.161V415.793H956.298V498.938H1039.44V1205.77H956.298V1288.94H873.161V1372.08H166.274Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M218.268 1320.11V1236.96H135.131V1153.8H51.9941V883.552H322.165V966.688H405.393V1049.86H634.041V966.688H717.178V738.004H634.041V654.84H51.9941V51.9677H987.44V322.212H322.165V384.587H821.166V467.76H904.304V550.906H987.44V1153.8H904.304V1236.96H821.166V1320.11H218.268ZM769.082 1268.14V1184.99H852.219V1101.83H935.446V602.873H852.219V519.727H769.082V436.554H270.172V270.245H935.446V103.935H103.898V602.873H685.945V686.036H769.082V1018.66H685.945V1101.83H353.308V1018.66H270.172V935.519H103.898V1101.83H187.035V1184.99H270.172V1268.14H769.082Z" fill="var(--bg)"/>` },
  "6": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M166.311 1372.08V1288.94H83.1379V1205.77H0.000976562V166.311H83.1379V83.1466H166.311V0.000854492H873.145V83.1466H956.29V166.311H1039.45V540.498H873.145V582.102H956.29V665.266H1039.45V1205.77H956.29V1288.94H873.145V1372.08H166.311Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M218.285 1320.11V1236.96H135.112V1153.8H51.9753V218.277H135.112V135.114H218.285V51.9678H821.175V135.114H904.321V218.277H987.485V488.521H717.241V405.358H634.077V322.212H405.383V405.358H322.219V550.905H821.175V634.069H904.321V717.233H987.485V1153.8H904.321V1236.96H821.175V1320.11H218.285ZM769.136 1268.14V1184.99H852.281V1101.83H935.445V769.2H852.281V686.036H769.136V602.873H270.18V353.39H353.344V270.245H685.972V353.39H769.136V436.554H935.445V270.245H852.281V187.081H769.136V103.935H270.18V187.081H187.016V270.245H103.871V1101.83H187.016V1184.99H270.18V1268.14H769.136ZM353.344 1101.83V1018.66H270.18V769.2H685.972V852.346H769.136V1018.66H685.972V1101.83H353.344ZM634.077 1049.86V966.688H717.241V904.313H634.077V821.168H322.219V966.688H405.383V1049.86H634.077Z" fill="var(--bg)"/>` },
  "7": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M332.619 1372.08V582.102H415.792V498.939H498.938V415.793H582.102V374.188H0V0.000854492H1039.46V623.671H956.289V706.817H873.144V789.981H789.98V873.144H706.816V1372.08H332.619Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M384.594 1320.11V634.069H467.767V550.905H550.912V467.76H634.076V384.587H717.24V322.212H51.9744V51.9678H987.493V571.694H904.32V654.84H821.174V738.004H738.01V821.168H654.847V1320.11H384.594ZM602.88 1268.14V769.2H686.043V686.036H769.207V602.873H852.353V519.727H935.526V103.935H103.942V270.245H769.207V436.554H686.043V519.727H602.88V602.873H519.734V686.036H436.561V1268.14H602.88Z" fill="var(--bg)"/>` },
  "8": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M166.31 1372.08V1288.94H83.146V1205.77H0.000244141V166.311H83.146V83.1466H166.31V0.000854492H873.153V83.1466H956.29V166.311H1039.43V1205.77H956.29V1288.94H873.153V1372.08H166.31Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M218.288 1320.11V1236.96H135.125V1153.8H51.9786V717.233H135.125V654.84H51.9786V218.277H135.125V135.114H218.288V51.9678H821.188V135.114H904.324V218.277H987.525V654.84H904.324V717.233H987.525V1153.8H904.324V1236.96H821.188V1320.11H218.288ZM769.148 1268.14V1184.99H852.294V1101.83H935.458V769.2H852.294V602.873H935.458V270.245H852.294V187.081H769.148V103.935H270.192V187.081H187.02V270.245H103.874V602.873H187.02V769.2H103.874V1101.83H187.02V1184.99H270.192V1268.14H769.148ZM353.356 1101.83V1018.66H270.192V852.346H353.356V769.2H685.976V852.346H769.148V1018.66H685.976V1101.83H353.356ZM634.08 1049.86V966.688H717.253V904.313H634.08V821.168H405.396V904.313H322.223V966.688H405.396V1049.86H634.08ZM353.356 602.873V519.727H270.192V353.39H353.356V270.245H685.976V353.39H769.148V519.727H685.976V602.873H353.356ZM634.08 550.905V467.76H717.253V405.358H634.08V322.212H405.396V405.358H322.223V467.76H405.396V550.905H634.08Z" fill="var(--bg)"/>` },
  "9": { viewBox: "0 0 1040 1373", inner: `<path fill-rule="evenodd" clip-rule="evenodd" d="M166.273 1372.08V1288.94H83.1364V1205.77H0V831.585H166.273V789.981H83.1364V706.817H0V166.311H83.1364V83.1466H166.273V0.000854492H873.161V83.1466H956.298V166.311H1039.44V1205.77H956.298V1288.94H873.161V1372.08H166.273Z" fill="var(--accent)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M218.267 1320.11V1236.96H135.13V1153.8H51.9939V883.552H322.165V966.688H405.393V1049.86H634.041V966.688H717.268V821.168H218.267V738.004H135.13V654.84H51.9939V218.277H135.13V135.114H218.267V51.9678H821.166V135.114H904.303V218.277H987.44V1153.8H904.303V1236.96H821.166V1320.11H218.267ZM769.172 1268.14V1184.99H852.308V1101.83H935.536V270.245H852.308V187.081H769.172V103.935H270.261V187.081H187.034V270.245H103.898V602.873H187.034V686.036H270.261V769.2H769.172V1018.66H686.035V1101.83H353.398V1018.66H270.261V935.519H103.898V1101.83H187.034V1184.99H270.261V1268.14H769.172ZM353.398 602.873V520.557H270.261V353.39H353.398V270.245H686.035V353.39H769.172V602.873H353.398ZM717.268 550.905V405.358H634.041V322.212H405.393V405.358H322.165V468.59H405.393V550.905H717.268Z" fill="var(--bg)"/>` },
};

const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap");

:root {
  --bg: #000000;
  --accent: #FFDD31;
  --text: #FFFFFF;
  --muted: rgba(255,255,255,0.4);
  --card-bg: #FFFFFF;
  --card-text: #000000;
  --card-muted: rgba(0,0,0,0.4);
  --card-w: ${CARD_WIDTH}px;
  --card-h: ${CARD_HEIGHT}px;
  --card-gap: ${CARD_GAP}px;
  --digit-w: 8vw;
  --digit-h: 11vw;
  --symbol-w: var(--digit-w);
  --comma-w: 3vw;
}

* {
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: "IBM Plex Mono", monospace;
  overflow: hidden;
}

.app {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

.top-text {
  position: absolute;
  top: 10%;
  width: 100%;
  text-align: center;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.75rem;
  line-height: 1.6;
}

.counter-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.counter {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.5vw;
  white-space: nowrap;
}

.digit-cell {
  width: var(--digit-w);
  height: var(--digit-h);
  overflow: hidden;
  display: block;
  flex: 0 0 var(--digit-w);
  position: relative;
}

.digit-svg {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  inset: 0;
}

.symbol-svg {
  height: var(--digit-h);
  display: block;
  overflow: hidden;
}

.symbol-svg.dollar {
  width: var(--symbol-w);
  flex: 0 0 var(--symbol-w);
  object-fit: cover;
  transform: scale(1.60);
  transform-origin: center;
}

.symbol-svg.comma {
  width: var(--comma-w);
  flex: 0 0 var(--comma-w);
}

.symbol-text {
  font-family: "Cormorant Garamond", serif;
  font-size: 60px;
  fill: var(--muted);
}

.milestones {
  position: fixed;
  left: 50%;
  bottom: 32px;
  right: auto;
  transform: translateX(-50%);
  z-index: 1;
}

.milestone-stack {
  position: relative;
  width: var(--card-w);
  height: calc((var(--card-h) * 3) + (var(--card-gap) * 2));
}

.milestone-card {
  position: absolute;
  left: 0;
  bottom: 0;
  width: var(--card-w);
  min-height: var(--card-h);
  background: var(--card-bg);
  color: var(--card-text);
  border-radius: 0;
  border: none;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.milestone-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  line-height: 1.35;
  color: var(--card-muted);
}

.milestone-line::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--card-muted);
  flex: 0 0 auto;
}

.milestone-amount {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.1;
  color: var(--card-text);
}

.milestone-amount-sub {
  font-size: 0.72rem;
  font-style: italic;
  color: var(--card-muted);
}

.source {
  position: fixed;
  right: 32px;
  bottom: 32px;
  color: var(--muted);
  font-size: 0.6rem;
  font-family: "IBM Plex Mono", monospace;
}

@media (max-width: 640px) {
  :root {
    --digit-w: 12vw;
    --digit-h: 16vw;
    --symbol-w: var(--digit-w);
    --comma-w: 4vw;
    --card-w: 90vw;
  }

  .milestones {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    bottom: 24px;
  }

  }
`;

const SvgDigit = ({ digit, enterDuration, exitDuration, enterFrom }) => {
  const data = DIGIT_SVGS[digit] || DIGIT_SVGS["0"];
  const resolvedEnter = enterDuration ?? 0.22;
  const resolvedExit = exitDuration ?? resolvedEnter;
  const resolvedEnterFrom = enterFrom ?? 0;

  return (
    <div className="digit-cell" aria-hidden="true">
      <AnimatePresence initial={false} mode="sync">
        <motion.svg
          key={digit}
          className="digit-svg"
          viewBox={data.viewBox}
          preserveAspectRatio="xMidYMid meet"
          initial={{ opacity: resolvedEnterFrom }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: resolvedExit, ease: "linear" } }}
          transition={{ duration: resolvedEnter, ease: "easeOut" }}
        >
          <g dangerouslySetInnerHTML={{ __html: data.inner }} />
        </motion.svg>
      </AnimatePresence>
    </div>
  );
};

const SvgSymbol = ({ char, type }) => {
  if (char === "$") {
    return (
      <img
        className={"symbol-svg " + type}
        src={dollarIcon}
        alt=""
        aria-hidden="true"
      />
    );
  }

  return (
    <svg className={"symbol-svg " + type} viewBox="0 0 60 80" aria-hidden="true">
      <text className="symbol-text" x="30" y="65" textAnchor="middle">
        {char}
      </text>
    </svg>
  );
};

const getFadeProfile = (placeFromRight) => {
  const fast = placeFromRight <= 2;

  const enterMin = 0.05;
  const enterStep = 0.03;
  const enterMax = 0.22;
  const enterBase = Math.min(enterMax, enterMin + placeFromRight * enterStep);

  const exitMin = 0.01;
  const exitStep = 0.02;
  const exitMax = 0.18;
  const exitBase = Math.min(exitMax, exitMin + placeFromRight * exitStep);

  const enter = fast ? 0.02 : enterBase;
  const exit = fast ? Math.min(exitBase, 0.02) : exitBase;
  const enterFrom = fast ? 1 : 0;

  return { enter, exit, enterFrom };
};

const Counter = ({ value }) => {
  const display = `$${value.toLocaleString("en-US")}`;
  const chars = display.split("");
  const digitCount = display.replace(/\D/g, "").length;
  let digitIndex = 0;

  return (
    <div className="counter" aria-label={display}>
      {chars.map((char, index) => {
        if (/\d/.test(char)) {
          const placeFromRight = digitCount - 1 - digitIndex;
          const { enter, exit, enterFrom } = getFadeProfile(placeFromRight);
          digitIndex += 1;
          return (
            <SvgDigit
              key={`digit-${index}`}
              digit={char}
              enterDuration={enter}
              exitDuration={exit}
              enterFrom={enterFrom}
            />
          );
        }

        if (char === "$") {
          return <SvgSymbol key={`symbol-${index}`} char="$" type="dollar" />;
        }

        return <SvgSymbol key={`symbol-${index}`} char="," type="comma" />;
      })}
    </div>
  );
};

const MilestoneCard = ({ card }) => {
  const offsetX = card.offsetX ?? 0;
  const startY = card.startY ?? 0;
  const travelY = card.travelY ?? CARD_HEIGHT * 4;
  const duration = card.duration ?? 12;

  return (
    <motion.div
      className="milestone-card"
      initial={{ y: startY, opacity: 0, x: offsetX }}
      animate={{ y: -travelY, opacity: 1, x: offsetX }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{
        y: { duration, ease: "linear" },
        opacity: { duration: 0.4, ease: "easeOut" },
      }}
    >
      <div className="milestone-line">
        <span>
          {card.secondsLabel} сек. · {card.label}
        </span>
      </div>
      <div className="milestone-amount">{`$${card.usd}`}</div>
      <div className="milestone-amount-sub">≈ {card.rub} ₽</div>
    </motion.div>
  );
};

const MilestoneStack = ({ cards }) => (
  <div className="milestone-stack">
    <AnimatePresence>
      {cards.map((card) => (
        <MilestoneCard key={card.id} card={card} />
      ))}
    </AnimatePresence>
  </div>
);

const isMilestoneDue = (milestone, amount, elapsedSeconds) => {
  if (Number.isFinite(milestone.usdValue)) {
    return amount >= milestone.usdValue;
  }
  return elapsedSeconds >= milestone.seconds;
};

const App = () => {
  const [dollars, setDollars] = useState(0);
  const [visibleCards, setVisibleCards] = useState([]);
  const nextMilestoneRef = useRef(0);
  const pendingRef = useRef([]);
  const lastCardAtRef = useRef(0);
  const lastCardRef = useRef(null);

  const getCardOffset = () => {
    if (typeof window === "undefined") {
      return 0;
    }

    const viewportWidth = window.innerWidth || CARD_WIDTH;
    const isNarrow = viewportWidth <= 640;
    const cardWidth = isNarrow ? viewportWidth * 0.9 : CARD_WIDTH;
    const safeMargin = Math.max(0, (viewportWidth - cardWidth) / 2);
    const maxOffset = Math.max(0, Math.min(140, safeMargin * 0.75));
    const jitter = (Math.random() * 2 - 1) * maxOffset;

    return Math.round(jitter);
  };

  const getStartYOffset = (now) => {
    const last = lastCardRef.current;
    if (!last) {
      return 0;
    }

    const elapsed = (now - last.bornAt) / 1000;
    if (elapsed >= last.duration) {
      return 0;
    }

    const yLast = last.startY - CARD_RISE_SPEED * elapsed;
    const minGap = CARD_HEIGHT + CARD_GAP;
    const needed = minGap + yLast;

    return Math.max(0, Math.round(needed));
  };

  const getCardFlight = (startY = 0) => {
    if (typeof window === "undefined") {
      const travelY = CARD_HEIGHT * 4;
      return { travelY, duration: (travelY + startY) / CARD_RISE_SPEED };
    }

    const travelY = window.innerHeight + CARD_HEIGHT + CARD_RISE_BUFFER;
    const duration = (travelY + startY) / CARD_RISE_SPEED;

    return { travelY, duration };
  };

  useEffect(() => {
    let rafId;
    const start = performance.now();

    const tick = (now) => {
      const elapsedMs = now - start;
      const elapsedSeconds = elapsedMs / 1000;
      const amount = Math.floor(elapsedSeconds * RATE);

      setDollars(amount);

      let nextIndex = nextMilestoneRef.current;
      while (
        nextIndex < MILESTONES.length &&
        isMilestoneDue(MILESTONES[nextIndex], amount, elapsedSeconds)
      ) {
        pendingRef.current.push(MILESTONES[nextIndex]);
        nextIndex += 1;
      }

      if (nextIndex !== nextMilestoneRef.current) {
        nextMilestoneRef.current = nextIndex;
      }

      if (pendingRef.current.length > 0 && now - lastCardAtRef.current >= 320) {
        const nextCard = pendingRef.current.shift();
        const startY = getStartYOffset(now);
        const { travelY, duration } = getCardFlight(startY);
        const withOffset = {
          ...nextCard,
          offsetX: getCardOffset(),
          startY,
          travelY,
          duration,
          bornAt: now,
        };
        lastCardAtRef.current = now;
        lastCardRef.current = { bornAt: now, startY, duration };

        setVisibleCards((prev) => [withOffset, ...prev]);
      }

      setVisibleCards((prev) => {
        const next = prev.filter((card) => now - card.bornAt < card.duration * 1000);
        return next.length === prev.length ? prev : next;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="app">
      <style>{STYLES}</style>
      <div className="top-text">
        <div>ИЛОН МАСК ЗАРАБОТАЛ</div>
        <div>С МОМЕНТА КАК ВЫ ОТКРЫЛИ ЭТУ СТРАНИЦУ</div>
      </div>
      <div className="counter-wrap">
        <Counter value={dollars} />
      </div>
      <div className="milestones">
        <MilestoneStack cards={visibleCards} />
      </div>
      <div className="source">Источник: рост состояния $187 млрд в 2025 г. Forbes, 2026</div>
    </div>
  );
};

export default App;














