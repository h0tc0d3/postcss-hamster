import Styles from "../css/style.css";
import Rhythm from "./rhythm.es6";
import "./prism.js";

import SvgAnimation from "./svganimation.es6";

let rhytmSettings = {
    "property": "height-down",
    "base": 16,
    "lineHeight": 1.5,
    "resize": true,
    "resizeWidth": true
};

let irhythm = new Rhythm(rhytmSettings);

// Document ready callback
irhythm.ready(() => {

    let completeCallback = () => {
        let svg = irhythm.find("#hamsterLogo")[0];
        irhythm.addClass(svg, "finished");
        // Delayed download youtube content. It's slow down page rendering and svg animation.
        let iframeBlocks = irhythm.find(".block-iframe");
        iframeBlocks[0].innerHTML = "<iframe src=\"https://www.youtube.com/embed/jbYBGKSxyac?rel=0&amp;showinfo=0\" width=\"640\" height=\"360\" class=\"block-center\" allowfullscreen></iframe>";
        iframeBlocks[1].innerHTML = "<iframe src=\"https://www.youtube.com/embed/EgYt0BluEKM?rel=0&amp;showinfo=0\" width=\"640\" height=\"360\" class=\"block-center\" allowfullscreen></iframe>";
    };

    let animation = () => {
        SvgAnimation(irhythm.find("#hamsterLogo path"), 3000, (t) => {
            return Math.sin(t) * t * t;
        }, completeCallback);
    };

    window.setTimeout(animation, 0);

    let fix = () => {
        //Fix relative rounding bugs.
        irhythm.fixRelative("h1, h2, h3, h4, h5, h6, p, ul, .block-code, .block-info, .button-blue, .button-gray, .button-green");
        // Fix Vertical Rhythm
        irhythm.fixRhythm("#content img, #content iframe");
    };
    // Need to wait before browser calculate styles and can return getComputeredStyle.
    window.setTimeout(fix, 1000);
});