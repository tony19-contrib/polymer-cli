/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
"use strict";
const cssSlam = require("css-slam");
const html_minifier_1 = require("html-minifier");
const logging = require("plylog");
const stream_1 = require("stream");
const uglify_js_1 = require("uglify-js");
let logger = logging.getLogger('cli.build.optimize-streams');
/**
 * GenericOptimizeStream is a generic optimization stream. It can be extended
 * to create a new kind of specific file-type optimizer, or it can be used
 * directly to create an ad-hoc optimization stream for different libraries.
 * If the transform library throws an exception when run, the file will pass
 * through unaffected.
 */
class GenericOptimizeStream extends stream_1.Transform {
    constructor(optimizerName, optimizer, optimizerOptions) {
        super({ objectMode: true });
        this.optimizer = optimizer;
        this.optimizerName = optimizerName;
        this.optimizerOptions = optimizerOptions || {};
    }
    _transform(file, _encoding, callback) {
        if (file.contents) {
            try {
                let contents = file.contents.toString();
                contents = this.optimizer(contents, this.optimizerOptions);
                file.contents = new Buffer(contents);
            }
            catch (error) {
                logger.warn(`${this.optimizerName}: Unable to optimize ${file.path}`, { err: error.message || error });
            }
        }
        callback(null, file);
    }
}
exports.GenericOptimizeStream = GenericOptimizeStream;
/**
 * JSOptimizeStream optimizes JS files that pass through it (via uglify).
 */
class JSOptimizeStream extends GenericOptimizeStream {
    constructor(options) {
        // uglify is special, in that it returns an object with a code property
        // instead of just a code string. We create a compliant optimizer here
        // that returns a string instead.
        let uglifyOptimizer = (contents, options) => {
            return uglify_js_1.minify(contents, options).code;
        };
        // We automatically add the fromString option because it is required.
        let uglifyOptions = Object.assign({ fromString: true }, options);
        super('uglify-js', uglifyOptimizer, uglifyOptions);
    }
}
exports.JSOptimizeStream = JSOptimizeStream;
/**
 * CSSOptimizeStream optimizes CSS that pass through it (via css-slam).
 */
class CSSOptimizeStream extends GenericOptimizeStream {
    constructor(options) {
        super('css-slam', cssSlam.css, options);
    }
    _transform(file, encoding, callback) {
        // css-slam will only be run if the `stripWhitespace` option is true.
        // Because css-slam itself doesn't accept any options, we handle the
        // option here before transforming.
        if (this.optimizerOptions.stripWhitespace) {
            super._transform(file, encoding, callback);
        }
    }
}
exports.CSSOptimizeStream = CSSOptimizeStream;
/**
 * InlineCSSOptimizeStream optimizes inlined CSS (found in HTML files) that
 * passes through it (via css-slam).
 */
class InlineCSSOptimizeStream extends GenericOptimizeStream {
    constructor(options) {
        super('css-slam', cssSlam.html, options);
    }
    _transform(file, encoding, callback) {
        // css-slam will only be run if the `stripWhitespace` option is true.
        // Because css-slam itself doesn't accept any options, we handle the
        // option here before transforming.
        if (this.optimizerOptions.stripWhitespace) {
            super._transform(file, encoding, callback);
        }
    }
}
exports.InlineCSSOptimizeStream = InlineCSSOptimizeStream;
/**
 * HTMLOptimizeStream optimizes HTML files that pass through it
 * (via html-minifier).
 */
class HTMLOptimizeStream extends GenericOptimizeStream {
    constructor(options) {
        super('html-minify', html_minifier_1.minify, options);
    }
}
exports.HTMLOptimizeStream = HTMLOptimizeStream;
