/**
 * @module SvgAnimation
 * 
 * @description Website SVG Animation.
 *
 * @version 1.0
 * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
 * @copyright Copyright (c) 2017, Grigory Vasilyev
 * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0 
 * 
 */
let SvgAnimation = (elements, duration = 3000, easing, callback) => {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

    let lastTime = 0;
    // Polyfills for requestAnimationFrame and cancelAnimationFrame
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);

            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }

    
    var safeUint32Array = typeof Uint32Array !== "undefined" ? Uint32Array : Array;
    // Set initial styles
    let elSize = elements.length - 1;
    let length = new safeUint32Array(elSize);
    let i = elSize; 
    while (i >= 0) {
        let len = elements[i].getTotalLength();
        length[i] = len;
        elements[i].style.strokeDasharray = len + " " + len;
        elements[i].style.strokeDashoffset = len;
        i--;
    }

    let animate = (progress) => {
        let j = elSize;
        while(j >= 0) {
            let strokeOpacity = 1 - progress;
            let value = Math.ceil(length[j] * (strokeOpacity));
            let strokeDashoffset = value <= 0 ? 0 : value;
            elements[j].style.fillOpacity = progress;
            elements[j].style.strokeDashoffset = strokeDashoffset;
            elements[j].style.strokeOpacity = strokeOpacity;
            j--;
        }
    };

    let progress = 0;
    let animationStart = 0;
    let animationStarted = false;

    let update = function () {
        if (!animationStarted) {
            animationStart = Date.now();
            animationStarted = true;
        }
        progress = easing((Date.now() - animationStart) / duration);
        animate(progress);
        if (progress < 1) {
            window.requestAnimationFrame(update);
        } else {
            callback();
        }
    };

    update();
    //window.requestAnimationFrame(update);
};

export default SvgAnimation;