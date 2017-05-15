import Styles from "../css/style.css";
import Rhythm from "./rhythm.es6";
import "./prism.js";

let settings = {
    "property": "height-down",
    "dynamic": true
    // "brakePoints": [
    //     {min: 0, max: 480, base: 14, line: 1.25},
    //     {min: 480, max: 600, base: 15, line: 1.3},
    //     {min: 600, max: 800, base: 16, line: 1.35},
    //     {min: 800, max: 1280, base: 18, line: 1.4},
    //     {min: 1280, max: 1600, base: 19, line: 1.5},
    //     {min: 1600, max: 1920, base: 20, line: 1.55},
    //     {min: 1920, max: 9999, base: 21, line: 1.6}
    // ]
};

let irhythm = new Rhythm(settings);

let header = irhythm.find(".header")[0];
let loading = irhythm.find(".loading")[0];
let wrapper = irhythm.find(".wrapper")[0];

let fix = () => {
    // Fix images vertical rhythm
    irhythm.rhythm(".content img");
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
};

let show = () => {
    let hideIntro = () => {
        irhythm.css(header, "display", "none");
    };
    irhythm.css(wrapper, "display", "block");
    irhythm.addClass(header, "animation__fadeOut");
    window.setTimeout(hideIntro, 1000);
    // Need to wait before browser calculate styles and can return getComputeredStyle.
    window.setTimeout(fix, 500);
};

let gButton = irhythm.find("a.button-blue")[0];

if (gButton.addEventListener) {
    gButton.addEventListener("click", () => {
        show();
    });
} else if (gButton.attachEvent) {
    gButton.attachEvent("onclick", () => {
        show();
    });
}

if(window.location.href.indexOf("#") === -1){
    irhythm.css(header, "display", "block");
}

irhythm.load(() => {

    let iloading = () => {

        let hideLoading = () => {
            irhythm.css(loading, "display", "none");
        };
        if(window.location.href.indexOf("#") !== -1){
            irhythm.css(wrapper, "display", "block");
            window.setTimeout(fix, 500);
        }
        irhythm.addClass(loading, "animation__fadeOut");
        window.setTimeout(hideLoading, 1000);
    };

    window.setTimeout(iloading, 1000);
});
