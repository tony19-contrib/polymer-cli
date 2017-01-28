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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const polymer_analyzer_1 = require("polymer-analyzer");
const generate_elements_1 = require("polymer-analyzer/lib/generate-elements");
const fs_url_loader_1 = require("polymer-analyzer/lib/url-loader/fs-url-loader");
const package_url_resolver_1 = require("polymer-analyzer/lib/url-loader/package-url-resolver");
function analyze(root, inputs) {
    return __awaiter(this, void 0, void 0, function* () {
        const analyzer = new polymer_analyzer_1.Analyzer({
            urlLoader: new fs_url_loader_1.FSUrlLoader(root),
            urlResolver: new package_url_resolver_1.PackageUrlResolver(),
        });
        const elements = new Set();
        const isInDependency = /(\b|\/|\\)(bower_components|node_modules)(\/|\\)/;
        for (const input of inputs) {
            const document = yield analyzer.analyze(input);
            const docElements = Array.from(document.getByKind('element'))
                .filter((e) => !isInDependency.test(e.sourceRange.file));
            docElements.forEach((e) => elements.add(e));
        }
        return generate_elements_1.generateElementMetadata(Array.from(elements), '');
    });
}
exports.analyze = analyze;
