  /*
   * JUP.js 
   * 
   * Copyright (c) 2010 hij1nx
   * Dual licensed under the MIT (MIT-LICENSE.txt)
   * and GPL (GPL-LICENSE.txt) licenses.
   * http://github.com/hij1nx/JUP
   * 
   */

;(function() {
    var namespace = typeof exports !== "undefined" ? exports : window;
    var JUP = namespace.JUP = (function() {
        var Util = {
            rmustache: /\{\{([^\{\}]*)\}\}/g,
            selfClosingTags: {
                "area": true,
                "base": true,
                "basefont": true,
                "br": true,
                "hr": true,
                "input": true,
                "img": true,
                "link": true,
                "meta": true
            },
            replace: function(target, data) {
                if (typeof target === 'undefined') {
                    target = '';
                }
                return target.replace(this.rmustache, function(str, r) {
                    try { return data[r]; } catch(ex) { }
                });
            },
            translate: function(tree, data) {

                var toString = Object.prototype.toString, c = [], atts = [],
                        selfClosing = false;

                for (var i = 0, l = tree.length; i < l; i++) {

                    if (typeof tree[i] === "object") {
                        if (toString.call(tree[i]) !== "[object Array]") {
                            for (var attribute in tree[i]) {
                                if (tree[i].hasOwnProperty(attribute)) {
                                    atts.push([" ", this.replace(attribute, data), "=\"", this.replace(tree[i][attribute], data), "\""].join(""));
                                }
                            }
                            c[i] = "";
                            c[0] = [c[0], atts.join("")].join("");
                        } else {
                            c[i] = this.translate(tree[i], data);
                        }
                    } else {
                        c[i] = this.replace(tree[i], data);
                    }

                    if (typeof c[0] === "string") {
                        selfClosing = false;
                        if (c[0].toLowerCase() in this.selfClosingTags) {
                            selfClosing = true;
                        }
                        c[0] = ["<", tree[0], atts.join(""), (selfClosing ? "/>" : ">")].join("");
                        if (selfClosing === false) { 
                            c.push("</" + tree[0] + ">"); 
                        }
                    }

                }

                return [c.join("")];

            }
        };

        return {
            version: "0.2",
            data: function(str) {
                return ["{{", str, "}}"].join("");
            },
            html: function() {

                var args = Array.prototype.slice.call(arguments),
                        toString = Object.prototype.toString,
                        structure = [], data = {};

                if (!args[0]) {
                    return '';
                }

                if (args.length === 2) {
                    structure = args[1];
                    data = args[0];
                } else {
                    if (toString.call(args[0]) === "[object Array]") {
                        structure = args[0];
                    } else {
                        if (typeof args[0] === 'undefined') {
                            return '';
                        }
                        data = args[0].data || null;
                        structure = args[0].structure;
                    }
                }

                if (toString.call(data) === "[object Array]") {
                    var copystack = [];
                    for (var c = 0, l = data.length; c < l; c++) {
                        copystack.push(Util.translate(structure, data[c])[0]);
                    }
                    return copystack.join("");
                } else if (data) {
                    for (var d = 0, l = data.length; d < l; d++) {    
                        return Util.translate(args[2] ? structure : Util.translate(structure)[0], data[d]);
                    }
                }
                
                return Util.translate(structure)[0];
            },

            parse: function(items, ARR) {
                if (typeof ARR === 'undefined') {
                    var ARR = [];
                }
                
                if (typeof items === 'string') {
                    var div = window.document.createElement('div');
                    div.innerHTML = items;
                    var elements = div.childNodes;
                } else {
                    var elements = items;
                }
                
                for (var i = 0, l = elements.length; i < l; i++) {
                    var e = elements[i];
                    var children = e.childNodes;
                    if (children.length && children[0].nodeName !== '#text') {
                        JUP.parse(e, ARR);
                    } else {
                        var arr = [];
                        if (e.nodeName !== '#text') {
                            arr.push(e.tagName);
                            if (e.attributes.length) {
                                for (var x = 0, al = e.attributes.length; x < al; x++) {
                                    var attr = {};
                                    attr[e.attributes[x].name] = e.attributes[x].value; 
                                    arr.push(attr);
                                }
                            }
                            if ($(e).html().length) {
                                arr.push($(e).html());
                            }
                            ARR.push(arr);
                        }
                    }
                }
                return ARR;
            }
        };
    })();
})();
