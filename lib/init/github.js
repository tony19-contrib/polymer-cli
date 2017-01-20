/*
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
const yeoman_generator_1 = require("yeoman-generator");
const github_1 = require("../github/github");
const logger = logging.getLogger('cli.init');
function createGithubGenerator(githubOptions) {
    let requestApi = githubOptions.requestApi;
    let githubApi = githubOptions.githubApi;
    let githubToken = githubOptions.githubToken;
    let owner = githubOptions.owner;
    let repo = githubOptions.repo;
    return class GithubGenerator extends yeoman_generator_1.Base {
        constructor(args, options) {
            super(args, options);
            this._github =
                new github_1.Github({ owner, repo, githubToken, githubApi, requestApi });
        }
        rootGeneratorName() {
            return 'GithubGenerator';
        }
        writing() {
            return __awaiter(this, void 0, void 0, function* () {
                const done = this.async();
                logger.info(`Downloading latest release of ${owner}/${repo}`);
                try {
                    yield this._github.extractLatestRelease(this.destinationRoot());
                    done();
                }
                catch (error) {
                    logger.error(`Could not download release from ${owner}/${repo}`);
                    done(error);
                }
            });
        }
        install() {
            this.installDependencies({
                npm: false,
            });
        }
    };
}
exports.createGithubGenerator = createGithubGenerator;
