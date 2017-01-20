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
const del = require("del");
const path = require("path");
const logging = require("plylog");
const vinyl_fs_1 = require("vinyl-fs");
const mergeStream = require("merge-stream");
const polymer_build_1 = require("polymer-build");
const optimize_streams_1 = require("./optimize-streams");
const prefetch_1 = require("./prefetch");
const streams_1 = require("./streams");
const load_config_1 = require("./load-config");
const logger = logging.getLogger('cli.build.build');
const buildDirectory = 'build/';
;
function build(options, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const optimizeOptions = { css: options.css, js: options.js, html: options.html };
        const polymerProject = new polymer_build_1.PolymerProject(config);
        logger.info(`Deleting build/ directory...`);
        yield del([buildDirectory]);
        logger.debug(`Reading source files...`);
        const sourcesStream = streams_1.pipeStreams([
            polymerProject.sources(),
            polymerProject.splitHtml(),
            optimize_streams_1.getOptimizeStreams(optimizeOptions),
            polymerProject.rejoinHtml()
        ]);
        logger.debug(`Reading dependencies...`);
        const depsStream = streams_1.pipeStreams([
            polymerProject.dependencies(),
            polymerProject.splitHtml(),
            optimize_streams_1.getOptimizeStreams(optimizeOptions),
            polymerProject.rejoinHtml()
        ]);
        let buildStream = mergeStream(sourcesStream, depsStream);
        buildStream.once('data', () => {
            logger.debug('Analyzing build dependencies...');
        });
        if (options.bundle) {
            buildStream = buildStream.pipe(polymerProject.bundler);
        }
        if (options.insertPrefetchLinks) {
            buildStream = buildStream.pipe(new prefetch_1.PrefetchTransform(polymerProject));
        }
        buildStream.once('data', () => {
            logger.info('Generating build/ directory...');
        });
        // Finish the build stream by piping it into the final build directory.
        buildStream = buildStream.pipe(vinyl_fs_1.dest(buildDirectory));
        // If a service worker was requested, parse the service worker config file
        // while the build is in progress. Loading the config file during the build
        // saves the user ~300ms vs. loading it afterwards.
        const swPrecacheConfigPath = path.resolve(config.root, options.swPrecacheConfig || 'sw-precache-config.js');
        let swConfig = null;
        if (options.addServiceWorker) {
            swConfig = yield load_config_1.loadServiceWorkerConfig(swPrecacheConfigPath);
        }
        // There is nothing left to do, so wait for the build stream to complete.
        yield streams_1.waitFor(buildStream);
        // addServiceWorker() reads from the file system, so we need to wait for
        // the build stream to finish writing to disk before calling it.
        if (options.addServiceWorker) {
            logger.info(`Generating service worker...`);
            if (swConfig) {
                logger.debug(`Service worker config found`, swConfig);
            }
            else {
                logger.debug(`No service worker configuration found at ` +
                    `${swPrecacheConfigPath}, continuing with defaults`);
            }
            yield polymer_build_1.addServiceWorker({
                buildRoot: buildDirectory,
                project: polymerProject,
                swPrecacheConfig: swConfig || undefined,
                bundled: options.bundle,
            });
        }
        logger.info('Build complete!');
    });
}
exports.build = build;
