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
    var JUP = (typeof exports !== "undefined" ? exports : window).JUP = (function() {
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
            collectAttributes: function(object) {
                var attributes = [], p;
                for (p in object) {
                    if (object.hasOwnProperty(p)) {
                        attributes.push(" " + p + "=\"" + object[p] + "\"");
                    }
                }
                return attributes.join("");
            },
            translate: function(tree, data) {

                var toString = Object.prototype.toString, node = tree[0],
                attributes = tree[1], attrs = "", selfClosing = false,
                firstChildIndex = 1, start = "", end = "", children = [];

                if (toString.call(node) === "[object Array]") {
                    if (node.length) {
                        return this.translate(node) + this.translate(tree.slice(1));
                    } else {
                        return this.translate(tree.slice(1));
                    }
                } else if (typeof node === "string") {
                    if (typeof attributes === "object") {
                        if (toString.call(attributes) !== "[object Array]") {
                            attrs = this.collectAttributes(attributes);
                            firstChildIndex = 2;
                        }
                    }
                    if (node.toLowerCase() in this.selfClosingTags) {
                        start = "<" + node + attrs + "/>";
                    } else {
                        start = "<" + node + attrs + ">";
                        end = "</" + node + ">";
                        for (var i = firstChildIndex, l = tree.length; i < l; i++) {
                            if (toString.call(tree[i]) === "[object Array]") {
                                children.push(this.translate(tree[i]));
                            } else if (typeof tree[i] === "string") {
                                children.push(tree[i]);
                            }
                        }
                    }
                    return start + children.join("") + end;
                } else {
                    return '';
                }

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
                structure = [], data = {}, converted = "";

                if (!args[0]) {
                    return '';
                }

                if (args.length === 2) {
                    structure = args[1];
                    data = args[0];
                } else {
                    if (Object.prototype.toString.call(args[0]) == "[object Array]") {
                        structure = args[0];
                    } else {
                        if (typeof args[0] == 'undefined') {
                            return '';
                        }
                        data = args[0].data || null;
                        structure = args[0].structure;
                    }
                }
                if (Object.prototype.toString.call(data) == "[object Array]") {
                    var copystack = [];
                    for (var c = 0, l = data.length; c < l; c++) {
                        copystack.push(Util.replace(Util.translate(structure), data[c]));
                    }
                    converted = copystack.join("");
                } else if (data) {
                    converted = Util.replace(Util.translate(structure), data);
                }
                
                return converted;
            },

            parse: function(items, ARR) {
                if (typeof ARR == 'undefined') {
                    var ARR = [];
                }
                
                if (typeof items == 'string') {
                    var div = window.document.createElement('div');
                    div.innerHTML = items;
                    var elements = div.childNodes;
                } else {
                    var elements = items;
                }
                
                for (var i = 0; i < elements.length; i++) {
                    var e = elements[i];
                    var children = e.childNodes;
                    if (children.length && children[0].nodeName != '#text') {
                        JUP.parse(e, ARR);  
                    } else {
                        var arr = [];
                        if (e.nodeName == '#text') {
                            //debug.log('ignore this');
                        } else {
                            arr.push(e.tagName);
                            if (e.attributes.length) {
                                for (var x = 0; x < e.attributes.length; x++) {
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
