import Styles from "../css/style.css";
import Rhythm from "./rhythm.es6";
import "./prism.js";

let settings = {
    "property": "height-down",
    "dynamic": true
};

let irhythm = new Rhythm(settings);

let loading = irhythm.find(".loading")[0];
let navigation = irhythm.find(".sidebar__navigation")[0];


if (navigation && navigation.addEventListener) {
    navigation.addEventListener("touchstart", () => {
        if(irhythm.class(navigation).match(/expanded/i)){
            irhythm.removeClass(navigation, "expanded");
            irhythm.addClass(navigation, "hide");
        } else {
            if(irhythm.class(navigation).match(/hide/i)) {
                irhythm.removeClass(navigation, "hide");
            }
            irhythm.addClass(navigation, "expanded");
        }
    });
}

let fix = () => {
    // Fix images vertical rhythm
    irhythm.rhythm(".content img");
    /*
     // Delayed download youtube content. It's slow down page rendering and svg animation.
    let loadYoutube = () => {
        let iframeBlocks = irhythm.find(".block-iframe");
        iframeBlocks[0].innerHTML = "<iframe src=\"https://www.youtube.com/embed/jbYBGKSxyac?rel=0&amp;showinfo=0\"" +
            " width=\"640\" height=\"360\" class=\"block-center\" allowfullscreen></iframe>";
        iframeBlocks[1].innerHTML = "<iframe src=\"https://www.youtube.com/embed/EgYt0BluEKM?rel=0&amp;showinfo=0\"" +
            " width=\"640\" height=\"360\" class=\"block-center\" allowfullscreen></iframe>";
        // Fix iframes vertical rhythm
        irhythm.rhythm(".content iframe");
    };

    window.setTimeout(loadYoutube, 3000);
   */
};

irhythm.load(() => {
    let hideLoading = () => {
        irhythm.css(loading, "display", "none");
        fix();
    };
    irhythm.addClass(loading, "animation__fadeOut");
    window.setTimeout(hideLoading, 1000);
});
