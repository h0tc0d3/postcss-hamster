import Styles from "../css/style.css";
import Rhythm from "./rhythm.es6";
import "./prism.js";

let settings = {
    "property": "height-down",
    "dynamic": true
};

let irhythm = new Rhythm(settings);

let header = irhythm.find(".header")[0];
let loading = irhythm.find(".loading")[0];
let wrapper = irhythm.find(".wrapper")[0];
let navigation = irhythm.find(".sidebar__navigation")[0];
let footer = irhythm.find(".footer")[0];

if (navigation.addEventListener) {
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
    // Delayed download youtube content. It's slow down page rendering and svg animation.
    /*
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

let show = () => {
    let hideIntro = () => {
        irhythm.css(header, "display", "none");
    };
    irhythm.css(wrapper, "display", "block");
    irhythm.css(footer, "display", "block");
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
            irhythm.css(footer, "display", "block");
            window.setTimeout(fix, 500);
        }
        irhythm.addClass(loading, "animation__fadeOut");
        window.setTimeout(hideLoading, 1000);
    };

    window.setTimeout(iloading, 1000);
});
