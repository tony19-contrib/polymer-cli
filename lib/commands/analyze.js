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
const logging = require("plylog");
const logger = logging.getLogger('cli.command.analyze');
class AnalyzeCommand {
    constructor() {
        this.name = 'analyze';
        this.description = 'Writes analysis metadata in JSON format to standard out';
        this.args = [{
                name: 'input',
                description: 'The files to analyze',
                defaultOption: true,
                multiple: true,
            }];
    }
    run(options, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const analyze = require('../analyze/analyze').analyze;
            const root = config.root;
            const inputs = options['input'];
            if (!options || !options['input']) {
                logger.debug('no inputs given');
                return;
            }
            const metadata = yield analyze(root, inputs);
            process.stdout.write(JSON.stringify(metadata, null, 2));
        });
    }
}
exports.AnalyzeCommand = AnalyzeCommand;
