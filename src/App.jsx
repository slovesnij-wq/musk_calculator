import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MILESTONES, RATE_USD_PER_SECOND } from "./content/milestones.js";
import dollarIcon from "./assets/dollar.svg";
import hiaiLogo from "./assets/hiai-logo.svg";
import howWeCountedMarkdown from "./content/how-we-counted.md?raw";

const Motion = motion;

const RATE = RATE_USD_PER_SECOND;
const CARD_WIDTH = 280;
const CARD_HEIGHT = 136;
const CARD_GAP = 8;
const CARD_RISE_SPEED = 180;
const CARD_RISE_BUFFER = 80;
const CARD_MIN_DURATION_FACTOR = 1.7;
const CARD_GAP_HOLD_SECONDS = 0.6;
const COUNTER_UPDATE_FPS = 30;
const COUNTER_UPDATE_FPS_MOBILE = 20;
const DIGIT_WHEEL_DURATION_MS = 104;
const DIGIT_WHEEL_FAST_DURATION_MS = 48;
const DIGIT_WHEEL_EASING = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const DIGIT_WHEEL_FAST_EASING = "linear";
const CARD_COLORS = [
  "#FFDD31",
  "#FF9DD8",
  "#F37E4C",
  "#0EC1E3",
  "#94FF95",
  "#B98BFF",
  "#EBFF95",
  "#6BFFF0",
  "#A7BFFF",
];

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
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;800&display=swap");

:root {
  --bg: #000000;
  --accent: #FFDD31;
  --text: #FFFFFF;
  --muted: rgba(255,255,255,0.4);
  --card-bg: #FFFFFF;
  --card-text: #101010;
  --card-muted: rgba(0,0,0,0.55);
  --card-w: ${CARD_WIDTH}px;
  --card-h: ${CARD_HEIGHT}px;
  --card-gap: ${CARD_GAP}px;
  --digit-w: 8vw;
  --digit-h: 11vw;
  --symbol-w: var(--digit-w);
  --comma-w: 3vw;
  --counter-top: 34%;
  --hero-gap: calc(var(--digit-h) * 0.28);
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
  font-family: "IBM Plex Sans", sans-serif;
  overflow: hidden;
}

.app {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

.hero-block {
  position: absolute;
  top: var(--counter-top);
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 96vw;
  padding: 0 2vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--hero-gap);
  z-index: 3;
  pointer-events: none;
}

.top-text {
  width: 100%;
  text-align: center;
  color: var(--text);
  letter-spacing: 0.01em;
  font-size: min(calc(var(--digit-h) * 0.52), 6vw);
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}

.bottom-text {
  width: 100%;
  text-align: center;
  color: var(--text);
  letter-spacing: 0;
  font-size: min(calc(var(--digit-h) * 0.26), 3vw);
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}

.counter-wrap {
  position: relative;
  z-index: 1;
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

.digit-wheel-tape {
  display: flex;
  flex-direction: column;
  will-change: transform;
  backface-visibility: hidden;
}

.digit-wheel-slot {
  width: 100%;
  height: var(--digit-h);
  flex: 0 0 var(--digit-h);
}

.digit-svg-static {
  width: 100%;
  height: 100%;
  display: block;
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

.symbol-space {
  width: var(--comma-w);
  height: var(--digit-h);
  flex: 0 0 var(--comma-w);
  display: block;
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
  overflow: visible;
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
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.milestone-card-flight {
  animation-name: milestone-card-float;
  animation-duration: var(--flight-duration, 4s);
  animation-timing-function: linear;
  animation-delay: var(--flight-delay, 0s);
  animation-fill-mode: both;
}

@keyframes milestone-card-float {
  0% {
    transform: translate3d(var(--card-offset-x, 0px), var(--card-start-y, 0px), 0);
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--card-offset-x, 0px), calc(-1 * var(--card-travel-y, 400px)), 0);
    opacity: 1;
  }
}

.milestone-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--card-text);
  letter-spacing: 0.01em;
  text-align: center;
}

.milestone-amounts {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.milestone-time,
.milestone-usd {
  font: inherit;
  color: inherit;
  text-align: center;
}

.milestone-usd {
  font-weight: 700;
}

.milestone-rub {
  font-size: 0.72rem;
  font-style: italic;
  color: var(--card-muted);
  text-align: center;
}

.milestone-label {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 1.1rem;
  font-weight: 400;
  line-height: 1.4;
  color: var(--card-text);
  text-align: center;
  margin-top: 6px;
}

.methodology-anchor {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.source-toggle {
  border: 1px solid rgba(255, 221, 49, 0.6);
  background: rgba(0, 0, 0, 0.78);
  color: #FFDD31;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1;
  padding: 9px 12px;
  width: 236px;
  text-align: center;
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.source-toggle:hover {
  background: rgba(255, 221, 49, 0.16);
  border-color: rgba(255, 221, 49, 0.9);
}

.credits-link {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #FFDD31;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.15;
  text-decoration: none;
  width: 236px;
  text-align: center;
  border: 1px solid rgba(255, 221, 49, 0.6);
  background: rgba(0, 0, 0, 0.78);
  border-radius: 16px;
  padding: 7px 10px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.credits-link:hover {
  color: #FFE86A;
  background: rgba(255, 221, 49, 0.16);
  border-color: rgba(255, 221, 49, 0.9);
}

.credits-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
}

.credits-text {
  display: inline-block;
  white-space: normal;
  justify-self: center;
}

.methodology-panel {
  width: min(560px, calc(100vw - 32px));
  max-height: min(68vh, 560px);
  overflow: auto;
  background: rgba(8, 8, 8, 0.96);
  border: 1px solid rgba(255, 221, 49, 0.48);
  border-radius: 14px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
  padding: 14px 14px 12px;
}

.methodology-close {
  margin-left: auto;
  margin-bottom: 8px;
  display: block;
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}

.methodology-close:hover {
  color: #FFFFFF;
}

.memo-content {
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.82rem;
  line-height: 1.5;
}

.memo-content h1 {
  margin: 0 0 8px;
  color: #FFDD31;
  font-size: 1rem;
  line-height: 1.3;
}

.memo-content h2 {
  margin: 14px 0 8px;
  color: #FFDD31;
  font-size: 0.9rem;
  line-height: 1.3;
}

.memo-content p {
  margin: 0 0 8px;
}

.memo-content blockquote {
  margin: 10px 0;
  padding: 8px 10px;
  border-left: 2px solid rgba(255, 221, 49, 0.75);
  background: rgba(255, 255, 255, 0.05);
}

.memo-content hr {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.18);
  margin: 12px 0;
}

.memo-content table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

.memo-content th,
.memo-content td {
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  padding: 6px 6px 6px 0;
}

.memo-content th {
  color: #FFDD31;
  font-size: 0.74rem;
  font-weight: 600;
}

.memo-content td {
  font-size: 0.74rem;
}

.memo-content a {
  color: #9AD6FF;
}

.source {
  display: none;
}

@media (max-width: 640px) {
  :root {
    --digit-w: 12vw;
    --digit-h: 16vw;
    --symbol-w: var(--digit-w);
    --comma-w: 4vw;
    --card-w: 82vw;
    --counter-top: 35%;
    --hero-gap: calc(var(--digit-h) * 0.24);
  }

  .milestones {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    bottom: 24px;
  }

  .top-text {
    font-size: min(calc(var(--digit-h) * 0.5), 7.2vw);
  }

  .bottom-text {
    font-size: min(calc(var(--digit-h) * 0.2), 3.6vw);
  }

  .methodology-anchor {
    right: 12px;
    bottom: 12px;
  }

  .source-toggle {
    font-size: 0.74rem;
    padding: 8px 10px;
    width: min(236px, calc(100vw - 24px));
  }

  .credits-link {
    width: min(236px, calc(100vw - 24px));
    font-size: 0.66rem;
    padding: 7px 9px;
    gap: 8px;
  }

  .credits-icon {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
  }

  .methodology-panel {
    width: min(560px, calc(100vw - 24px));
    max-height: min(62vh, 500px);
    padding: 12px 12px 10px;
  }
}
`;

const DIGIT_SEQUENCE = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DIGIT_WHEEL_SEQUENCE = [...DIGIT_SEQUENCE, ...DIGIT_SEQUENCE];

const normalizeDigitChar = (digit) => {
  const parsed = Number.parseInt(String(digit), 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(9, Math.max(0, parsed));
};

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleChange();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

const SvgDigitStatic = React.memo(({ digit }) => {
  const data = DIGIT_SVGS[digit] || DIGIT_SVGS["0"];
  const preserveAspectRatio = digit === "2" ? "xMidYMin meet" : "xMidYMid meet";

  return (
    <svg className="digit-svg-static" viewBox={data.viewBox} preserveAspectRatio={preserveAspectRatio} aria-hidden="true">
      <g dangerouslySetInnerHTML={{ __html: data.inner }} />
    </svg>
  );
});

const DigitWheel = React.memo(({ targetDigit, placeFromRight, prefersReducedMotion }) => {
  const normalizedTarget = normalizeDigitChar(targetDigit);
  const isFastPlace = placeFromRight <= 2;
  const [currentIndex, setCurrentIndex] = useState(normalizedTarget);
  const [isTransitionEnabled, dispatchTransitionEnabled] = useReducer((_, nextValue) => nextValue, !prefersReducedMotion);
  const currentIndexRef = useRef(normalizedTarget);
  const wrapPendingRef = useRef(false);
  const queuedTargetRef = useRef(null);
  const rafRef = useRef(null);
  const wrapTimeoutRef = useRef(null);
  const completeWrapRef = useRef(() => {});
  const transitionMs = isFastPlace ? DIGIT_WHEEL_FAST_DURATION_MS : DIGIT_WHEEL_DURATION_MS;
  const transitionEasing = isFastPlace ? DIGIT_WHEEL_FAST_EASING : DIGIT_WHEEL_EASING;

  const clearWrapTimeout = useCallback(() => {
    if (wrapTimeoutRef.current !== null) {
      clearTimeout(wrapTimeoutRef.current);
      wrapTimeoutRef.current = null;
    }
  }, []);

  const setIndex = useCallback((nextIndex) => {
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
  }, []);

  const scheduleWrapTimeout = useCallback(() => {
    clearWrapTimeout();
    wrapTimeoutRef.current = setTimeout(() => {
      completeWrapRef.current();
    }, transitionMs + (isFastPlace ? 120 : 160));
  }, [clearWrapTimeout, isFastPlace, transitionMs]);

  const moveToTarget = useCallback((nextTarget) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const normalizedNextTarget = normalizeDigitChar(nextTarget);
    const visibleDigit = currentIndexRef.current % 10;
    const forwardDelta = (normalizedNextTarget - visibleDigit + 10) % 10;
    if (forwardDelta === 0) return false;

    const baseIndex = currentIndexRef.current;
    const willOverflowTape = baseIndex + forwardDelta >= DIGIT_WHEEL_SEQUENCE.length;

    if (willOverflowTape) {
      wrapPendingRef.current = true;
      dispatchTransitionEnabled(false);
      setIndex(baseIndex - 10);
      rafRef.current = requestAnimationFrame(() => {
        dispatchTransitionEnabled(true);

        const rebasedIndex = currentIndexRef.current;
        const nextIndex = rebasedIndex + forwardDelta;
        wrapPendingRef.current = true;
        setIndex(nextIndex);
        scheduleWrapTimeout();

        rafRef.current = null;
      });
      return true;
    }

    dispatchTransitionEnabled(true);
    const nextIndex = baseIndex + forwardDelta;
    wrapPendingRef.current = true;
    setIndex(nextIndex);
    scheduleWrapTimeout();
    return true;
  }, [scheduleWrapTimeout, setIndex]);

  const completeWrap = useCallback(() => {
    if (!wrapPendingRef.current) return;

    wrapPendingRef.current = false;
    clearWrapTimeout();

    const queuedTarget = queuedTargetRef.current;
    queuedTargetRef.current = null;
    if (queuedTarget !== null && queuedTarget !== undefined) {
      moveToTarget(queuedTarget);
    }
  }, [clearWrapTimeout, moveToTarget]);

  useEffect(() => {
    completeWrapRef.current = completeWrap;
  }, [completeWrap]);

  useEffect(() => () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    clearWrapTimeout();
  }, [clearWrapTimeout]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!prefersReducedMotion) return;

    wrapPendingRef.current = false;
    queuedTargetRef.current = null;
    clearWrapTimeout();
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    dispatchTransitionEnabled(false);
    setIndex(normalizedTarget);
  }, [normalizedTarget, prefersReducedMotion, setIndex]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (wrapPendingRef.current) {
      queuedTargetRef.current = normalizedTarget;
      return;
    }

    queuedTargetRef.current = null;
    const didMove = moveToTarget(normalizedTarget);
    if (!didMove) {
      clearWrapTimeout();
    }
  }, [clearWrapTimeout, moveToTarget, normalizedTarget, prefersReducedMotion]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleTransitionEnd = useCallback((event) => {
    if (event.propertyName !== "transform") return;
    if (!wrapPendingRef.current) return;
    completeWrap();
  }, [completeWrap]);

  return (
    <div className="digit-cell" aria-hidden="true">
      <div
        className="digit-wheel-tape"
        style={{
          transform: `translate3d(0, calc(${currentIndex} * -1 * var(--digit-h)), 0)`,
          transition: !prefersReducedMotion && isTransitionEnabled
            ? `transform ${transitionMs}ms ${transitionEasing}`
            : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {DIGIT_WHEEL_SEQUENCE.map((digit, sequenceIndex) => (
          <div className="digit-wheel-slot" key={`digit-slot-${placeFromRight}-${sequenceIndex}`}>
            <SvgDigitStatic digit={digit} />
          </div>
        ))}
      </div>
    </div>
  );
});

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

  if (char === " ") {
    return <span className="symbol-space" aria-hidden="true" />;
  }

  return (
    <svg className={"symbol-svg " + type} viewBox="0 0 60 80" aria-hidden="true">
      <text className="symbol-text" x="30" y="65" textAnchor="middle">
        {char}
      </text>
    </svg>
  );
};

const CARD_SECONDS_FORMATTER = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const COUNTER_FORMATTER = new Intl.NumberFormat("ru-RU");

const WORD_MINUTES = "\u043c\u0438\u043d.";
const WORD_SECONDS = "\u0441\u0435\u043a.";

const formatMilestoneTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "";
  const totalSeconds = Math.max(0, seconds);

  if (totalSeconds < 60) {
    return `${CARD_SECONDS_FORMATTER.format(totalSeconds)} ${WORD_SECONDS}`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${minutes} ${WORD_MINUTES} ${String(secs).padStart(2, "0")} ${WORD_SECONDS}`;
};

const INLINE_TOKEN_RE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

const parseInlineMarkdown = (text, keyPrefix = "inline") =>
  text.split(INLINE_TOKEN_RE).map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const splitIndex = part.indexOf("](");
      const label = part.slice(1, splitIndex);
      const href = part.slice(splitIndex + 2, -1);

      return (
        <a key={key} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      );
    }

    return <React.Fragment key={key}>{part}</React.Fragment>;
  });

const parseTableRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const isMarkdownTableDivider = (line) => {
  const cells = parseTableRow(line);
  return (
    cells.length > 0 &&
    cells.every((cell) => cell.length > 0 && /^:?-{3,}:?$/.test(cell))
  );
};

const parseMemoBlocks = (markdown) => {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed === "---" || /^_{3,}$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2).trim());
        i += 1;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }

      const header = parseTableRow(tableLines[0] || "");
      const bodyStart = tableLines[1] && isMarkdownTableDivider(tableLines[1]) ? 2 : 1;
      const rows = tableLines.slice(bodyStart).map(parseTableRow);

      blocks.push({ type: "table", header, rows });
      continue;
    }

    const paragraph = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = lines[i];
      const nextTrimmed = next.trim();
      if (
        !nextTrimmed ||
        next.startsWith("# ") ||
        next.startsWith("## ") ||
        next.startsWith("> ") ||
        nextTrimmed === "---" ||
        /^_{3,}$/.test(nextTrimmed) ||
        next.trim().startsWith("|")
      ) {
        break;
      }
      paragraph.push(nextTrimmed);
      i += 1;
    }

    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  return blocks;
};

const METHODOLOGY_BLOCKS = parseMemoBlocks(howWeCountedMarkdown);

const MethodologyMemo = () => (
  <div className="memo-content">
    {METHODOLOGY_BLOCKS.map((block, blockIndex) => {
      if (block.type === "h1") {
        return <h1 key={`h1-${blockIndex}`}>{parseInlineMarkdown(block.text, `h1-${blockIndex}`)}</h1>;
      }
      if (block.type === "h2") {
        return <h2 key={`h2-${blockIndex}`}>{parseInlineMarkdown(block.text, `h2-${blockIndex}`)}</h2>;
      }
      if (block.type === "blockquote") {
        return (
          <blockquote key={`q-${blockIndex}`}>
            {parseInlineMarkdown(block.text, `q-${blockIndex}`)}
          </blockquote>
        );
      }
      if (block.type === "hr") {
        return <hr key={`hr-${blockIndex}`} />;
      }
      if (block.type === "table") {
        return (
          <table key={`table-${blockIndex}`}>
            <thead>
              <tr>
                {block.header.map((cell, cellIndex) => (
                  <th key={`th-${blockIndex}-${cellIndex}`}>
                    {parseInlineMarkdown(cell, `th-${blockIndex}-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`row-${blockIndex}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`td-${blockIndex}-${rowIndex}-${cellIndex}`}>
                      {parseInlineMarkdown(cell, `td-${blockIndex}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      return <p key={`p-${blockIndex}`}>{parseInlineMarkdown(block.text, `p-${blockIndex}`)}</p>;
    })}
  </div>
);

const Counter = ({ value }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const formatted = COUNTER_FORMATTER.format(value).replace(/\u00A0/g, " ");
  const display = `$${formatted}`;
  const chars = display.split("");
  const digitCount = display.replace(/\D/g, "").length;
  const digitOrderByCharIndex = new Map();
  chars.forEach((char, index) => {
    if (/\d/.test(char)) {
      digitOrderByCharIndex.set(index, digitOrderByCharIndex.size);
    }
  });

  return (
    <div className="counter" aria-label={display}>
      {chars.map((char, index) => {
        if (/\d/.test(char)) {
          const currentDigitIndex = digitOrderByCharIndex.get(index) ?? 0;
          const placeFromRight = digitCount - 1 - currentDigitIndex;
          return (
            <DigitWheel
              key={`digit-${placeFromRight}`}
              targetDigit={char}
              placeFromRight={placeFromRight}
              prefersReducedMotion={prefersReducedMotion}
            />
          );
        }

        if (char === "$") {
          return <SvgSymbol key={`symbol-${index}`} char="$" type="dollar" />;
        }

        if (char === " ") {
          return <SvgSymbol key={`symbol-${index}`} char=" " type="space" />;
        }

        return <SvgSymbol key={`symbol-${index}`} char={char} type="comma" />;
      })}
    </div>
  );
};

const CounterTicker = React.memo(() => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const fps =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px), (pointer: coarse)").matches
        ? COUNTER_UPDATE_FPS_MOBILE
        : COUNTER_UPDATE_FPS;
    const intervalMs = 1000 / fps;

    const timer = setInterval(() => {
      const elapsedSeconds = (performance.now() - start) / 1000;
      const nextValue = Math.floor(elapsedSeconds * RATE);
      setValue(nextValue);
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  return <Counter value={value} />;
});

const MilestoneCard = React.memo(({ card }) => {
  const offsetX = card.offsetX ?? 0;
  const startY = card.startY ?? 0;
  const travelY = card.travelY ?? CARD_HEIGHT * 4;
  const duration = card.duration ?? 4;
  const timeValue = Number.isFinite(card.triggerAtSeconds)
    ? card.triggerAtSeconds
    : card.seconds;
  const timeLabel = formatMilestoneTime(timeValue) || `0,00 ${WORD_SECONDS}`;
  const zIndex = Number.isFinite(card.layerOrder) ? card.layerOrder : 1;

  return (
    <div
      className="milestone-card milestone-card-flight"
      style={{
        "--card-bg": card.color,
        "--card-offset-x": `${offsetX}px`,
        "--card-start-y": `${startY}px`,
        "--card-travel-y": `${travelY}px`,
        "--flight-duration": `${duration}s`,
        "--flight-delay": `${card.delaySeconds ?? 0}s`,
        zIndex,
      }}
    >
      <div className="milestone-top">
        <span className="milestone-time">{timeLabel}</span>
        <span className="milestone-amounts">
          <span className="milestone-usd">{`$${card.usd}`}</span>
          <span className="milestone-rub">≈ {card.rub} ₽</span>
        </span>
      </div>
      <div className="milestone-label">{card.label}</div>
    </div>
  );
});

const MilestoneStack = React.memo(({ cards }) => (
  <div className="milestone-stack">
    {cards.map((card) => (
      <MilestoneCard key={card.instanceKey} card={card} />
    ))}
  </div>
));

const getMilestoneTriggerSeconds = (milestone) => {
  if (Number.isFinite(milestone?.triggerAtSeconds)) return milestone.triggerAtSeconds;
  if (Number.isFinite(milestone?.seconds)) return milestone.seconds;
  return null;
};

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

const getCardColor = () => {
  const index = Math.floor(Math.random() * CARD_COLORS.length);
  return CARD_COLORS[index] || CARD_COLORS[0];
};

const getCardFlight = (milestoneIndex, startY = 0) => {
  if (typeof window === "undefined") {
    const travelY = CARD_HEIGHT * 4;
    const baseDuration = (travelY + startY) / CARD_RISE_SPEED;
    return { travelY, duration: baseDuration * CARD_MIN_DURATION_FACTOR };
  }

  const travelY = window.innerHeight + CARD_HEIGHT + CARD_RISE_BUFFER;
  const baseDuration = (travelY + startY) / CARD_RISE_SPEED;
  const minDuration = baseDuration * CARD_MIN_DURATION_FACTOR;

  const current = MILESTONES[milestoneIndex];
  const next = MILESTONES[milestoneIndex + 1];
  const currentTrigger = getMilestoneTriggerSeconds(current);
  const nextTrigger = getMilestoneTriggerSeconds(next);
  const gapDuration =
    Number.isFinite(currentTrigger) && Number.isFinite(nextTrigger)
      ? Math.max(0, nextTrigger - currentTrigger) + CARD_GAP_HOLD_SECONDS
      : null;

  let duration = minDuration;
  if (Number.isFinite(gapDuration)) {
    duration = Math.max(minDuration, gapDuration);
  } else if (!next) {
    duration = minDuration * 1.2;
  }

  return { travelY, duration };
};

const App = () => {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const preparedCards = useMemo(() => {
    const scheduledMilestones = MILESTONES.map((milestone, index) => {
      const delaySeconds = getMilestoneTriggerSeconds(milestone);
      return Number.isFinite(delaySeconds)
        ? { milestone, index, delaySeconds }
        : null;
    }).filter(Boolean);

    return scheduledMilestones.map(({ milestone, index, delaySeconds }, orderIndex) => {
      const { travelY, duration } = getCardFlight(index, 0);
      const layerOrder = orderIndex + 1;
      return {
        ...milestone,
        instanceKey: `${milestone.eventId ?? milestone.id}:${layerOrder}`,
        layerOrder,
        offsetX: getCardOffset(),
        color: getCardColor(),
        startY: 0,
        travelY,
        duration,
        delaySeconds,
      };
    }).filter(Boolean);
  }, []);

  useEffect(() => {
    if (!isMethodologyOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMethodologyOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMethodologyOpen]);

  return (
    <div className="app">
      <style>{STYLES}</style>
      <div className="hero-block">
        <div className="top-text">Илон Маск заработал:</div>
        <div className="counter-wrap">
          <CounterTicker />
        </div>
        <div className="bottom-text">...с того момента, как вы открыли эту страницу</div>
      </div>
      <div className="milestones">
        <MilestoneStack cards={preparedCards} />
      </div>
      <div className="methodology-anchor">
        <AnimatePresence>
          {isMethodologyOpen && (
            <Motion.div
              className="methodology-panel"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <button
                type="button"
                className="methodology-close"
                aria-label="Close note"
                onClick={() => setIsMethodologyOpen(false)}
              >
                x
              </button>
              <MethodologyMemo />
            </Motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          className="source-toggle"
          onClick={() => setIsMethodologyOpen((prev) => !prev)}
          aria-expanded={isMethodologyOpen}
        >
          Как мы считали?
        </button>
        <a
          className="credits-link"
          href="https://t.me/+2Dxhqn5YRvE0NzFi"
          target="_blank"
          rel="noreferrer"
        >
          <img className="credits-icon" src={hiaiLogo} alt="" aria-hidden="true" />
          <span className="credits-text">
            Подготовлено каналом Hi, AI!
            <br />
            Подпишитесь!
          </span>
        </a>
      </div>
      <div className="source">Источник: рост состояния $187 млрд в 2025 г. Forbes, 2026</div>
    </div>
  );
};

export default App;


