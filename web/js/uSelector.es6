/**
 * Based on uSelector https://github.com/fabiomcosta/micro-selector
 * author:  Fabio Miranda Costa
 * github:  fabiomcosta
 * twitter: @fabiomiranda
 * license: MIT-style license
 */

/**
 * @module uSelector
 * 
 * @description Small and fast selector engine.
 *
 * @version 1.0
 * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
 * @copyright Copyright (c) 2017, Grigory Vasilyev
 * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0 
 * 
 */
class uSelector {

    constructor() {
        this.pseudos = {
            empty: function (node) {
                let child = node.firstChild;
                return !(child && child.nodeType == 1) && !(node.innerText || node.textContent || "").length;
            },
            "first-child": function (node) {
                while ((node = node.previousSibling))
                    if (node.nodeType == 1) return false;
                return true;
            },
            "last-child": function (node) {
                while ((node = node.nextSibling))
                    if (node.nodeType == 1) return false;
                return true;
            },
            "only-child": function (node) {
                return this.pseudos["first-child"](node) && this.pseudos["last-child"](node);
            },
            "first-of-type": function (node) {
                let nodeName = node.nodeName;
                while ((node = node.previousSibling))
                    if (node.nodeName == nodeName) return false;
                return true;
            },
            "last-of-type": function (node) {
                let nodeName = node.nodeName;
                while ((node = node.nextSibling))
                    if (node.nodeName == nodeName) return false;
                return true;
            },
            "only-of-type": function (node) {
                return this.pseudos["first-of-type"](node) && this.pseudos["last-of-type"](node);
            },
            disabled: function (node) {
                return node.disabled;
            },
            checked: function (node) {
                return node.checked || node.selected;
            },
            selected: function (node) {
                return node.selected;
            }
        };

        this.reTrim = /^\s+|\s+$/g;

        this.supports_querySelectorAll = !!document.querySelectorAll;

        try {
            Array.prototype.slice.call(document.documentElement.childNodes, 0);
        } catch (e) {
            this.arrayFrom = this.arrayMerge;
        }
    }

    select(selector, context = document, append) {

        this.elements = append || [];
        this.context = context;

        if (this.supports_querySelectorAll) {
            try {
                this.arrayFrom(context.querySelectorAll(selector));
                return this.elements;
            } catch (e) {}
        }

        this.currentDocument = context.ownerDocument || context;
        this.parse(selector.replace(this.eTrim, ""));
        this.find();
        return this.elements;
    }


    matchSelector(node) {
        if (this.parsed.tag) {
            let nodeName = node.nodeName.toUpperCase();
            if (this.parsed.tag == "*") {
                if (nodeName < "@") return false; // Fix for comment nodes and closed nodes
            } else {
                if (nodeName != this.parsed.tag) return false;
            }
        }

        if (this.parsed.id && node.getAttribute("id") != this.parsed.id) {
            return false;
        }

        if ((this.parsedClasses = this.parsed.classes)) {
            let className = (" " + node.className + " ");
            for (let i = this.parsedClasses.length; i--;) {
                if (className.indexOf(" " + this.parsedClasses[i] + " ") < 0) return false;
            }
        }

        if ((this.parsedPseudos = this.parsed.pseudos)) {
            for (let i = this.parsedPseudos.length; i--;) {
                let pseudoClass = this.pseudos[this.parsedPseudos[i]];
                if (!(pseudoClass && pseudoClass.call(this, node))) return false;
            }
        }

        return true;
    }

    find() {


        this.merge = ((this.parsedId && this.parsed.tag || this.parsed.classes || this.parsed.pseudos) ||
            (!this.parsedId && (this.parsed.classes || this.parsed.pseudos))) ? this.arrayFilterAndMerge : this.arrayMerge;

        if (this.parsedId) {

            let el = this.currentDocument.getElementById(this.parsedId);
            if (el && (this.currentDocument === context || this.contains(el))) {
                this.merge([el]);
            }

        } else {

            this.merge(context.getthis.elementsByTagName(this.parsed.tag || "*"));

        }

    }

    parse(selector) {
        this.parsed = {};
        while ((selector = selector.replace(/([#.:])?([^#.:]*)/, this.parser))) {};
    }

    parser(all, simbol, name) {
        if (!simbol) {
            this.parsed.tag = name.toUpperCase();
        } else if (simbol == "#") {
            this.parsed.id = name;
        } else if (simbol == ".") {
            if (this.parsed.classes) {
                this.parsed.classes.push(name);
            } else {
                this.parsed.classes = [name];
            }
        } else if (simbol == ":") {
            if (this.parsed.pseudos) {
                this.parsed.pseudos.push(name);
            } else {
                this.parsed.pseudos = [name];
            }
        }
        return "";
    }

    arrayFrom(collection) {
        this.elements = Array.prototype.slice.call(collection, 0);
    }

    arrayMerge(collection) {
        for (let i = 0, node;
            (node = collection[i++]);) {
            this.elements.push(node);
        }
    }

    arrayFilterAndMerge(found) {
        for (let i = 0, node;
            (node = found[i++]);) {
            if (this.matchSelector(node)) this.this.elements.push(node);
        }
    }

    contains(node) {
        do {
            if (node === context) return true;
        } while ((node = node.parentNode));
        return false;
    }
}

export default uSelector;