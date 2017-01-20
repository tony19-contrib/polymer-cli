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
const chalk = require("chalk");
const child_process_1 = require("child_process");
const fs = require("fs");
const logging = require("plylog");
const findup = require("findup-sync");
const application_1 = require("../init/application/application");
const element_1 = require("../init/element/element");
const YeomanEnvironment = require("yeoman-environment");
const inquirer_1 = require("inquirer");
const github_1 = require("../init/github");
// import {Base} from 'yeoman-generator';
const logger = logging.getLogger('init');
const templateDescriptions = {
    'element': 'A blank element template',
    'application': 'A blank application template',
    'starter-kit': 'A starter application template, with navigation and "PRPL pattern" loading',
    'shop': 'The "Shop" Progressive Web App demo',
};
let shopGenerator = github_1.createGithubGenerator({
    owner: 'Polymer',
    repo: 'shop',
});
let pskGenerator = github_1.createGithubGenerator({
    owner: 'PolymerElements',
    repo: 'polymer-starter-kit',
});
/**
 * Check if the current shell environment is MinGW. MinGW can't handle some
 * yeoman features, so we can use this check to downgrade gracefully.
 */
function checkIsMinGW() {
    let isWindows = /^win/.test(process.platform);
    if (!isWindows) {
        return false;
    }
    // uname might not exist if using cmd or powershell,
    // which would throw an exception
    try {
        let uname = child_process_1.execSync('uname -s').toString();
        return !!/^mingw/i.test(uname);
    }
    catch (error) {
        logger.debug('`uname -s` failed to execute correctly', { err: error.message });
        return false;
    }
}
/**
 * Get a description for the given generator. If this is an external generator,
 * read the description from its package.json.
 */
function getGeneratorDescription(generator, generatorName) {
    const name = getDisplayName(generatorName);
    let description = '';
    if (templateDescriptions.hasOwnProperty(name)) {
        description = templateDescriptions[name];
    }
    else if (generator.resolved && generator.resolved !== 'unknown') {
        try {
            const metapath = findup('package.json', { cwd: generator.resolved });
            const meta = JSON.parse(fs.readFileSync(metapath, 'utf8'));
            description = meta.description;
        }
        catch (error) {
            if (error.message === 'not found') {
                logger.debug('no package.json found for generator');
            }
            else {
                logger.debug('unable to read/parse package.json for generator', {
                    generator: generatorName,
                    err: error.message,
                });
            }
        }
    }
    // If a description exists, format it properly for the command-line
    if (description.length > 0) {
        description = chalk.dim(` - ${description}`);
    }
    return {
        name: `${name}${description}`,
        value: generatorName,
        // inquirer is broken and doesn't print descriptions :(
        // keeping this so things work when it does
        short: name,
    };
}
/**
 * Extract the meaningful name from the full yeoman generator name
 */
function getDisplayName(generatorName) {
    let nameEnd = generatorName.indexOf(':');
    if (nameEnd === -1) {
        nameEnd = generatorName.length;
    }
    return generatorName.substring('polymer-init-'.length, nameEnd);
}
/**
 * Create & populate a Yeoman environment.
 */
function createYeomanEnvironment() {
    return new Promise((resolve, reject) => {
        const env = new YeomanEnvironment();
        env.registerStub(element_1.ElementGenerator, 'polymer-init-element:app');
        env.registerStub(application_1.ApplicationGenerator, 'polymer-init-application:app');
        env.registerStub(shopGenerator, 'polymer-init-shop:app');
        env.registerStub(pskGenerator, 'polymer-init-starter-kit:app');
        env.lookup((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(env);
        });
    });
}
/**
 * Create the prompt used for selecting which template to run. Generate
 * the list of available generators by filtering relevent ones out from
 * the environment list.
 */
function createSelectPrompt(env) {
    const generators = env.getGeneratorsMeta();
    const polymerInitGenerators = Object.keys(generators).filter((k) => {
        return k.startsWith('polymer-init') && k !== 'polymer-init:app';
    });
    const choices = polymerInitGenerators.map((generatorName) => {
        const generator = generators[generatorName];
        return getGeneratorDescription(generator, generatorName);
    });
    // Some windows emulators (mingw) don't handle arrows correctly
    // https://github.com/SBoudrias/Inquirer.js/issues/266
    // Fall back to rawlist and use number input
    // Credit to https://gist.github.com/geddski/c42feb364f3c671d22b6390d82b8af8f
    const isMinGW = checkIsMinGW();
    return {
        type: isMinGW ? 'rawlist' : 'list',
        name: 'generatorName',
        message: 'Which starter template would you like to use?',
        choices: choices,
    };
}
/**
 * Run the given generator. If no Yeoman environment is provided, a new one
 * will be created. If the generator does not exist in the environment, an
 * error will be thrown.
 */
function runGenerator(generatorName, options) {
    return __awaiter(this, void 0, void 0, function* () {
        options = options || {};
        const templateName = options['templateName'] || generatorName;
        const env = yield (options['env'] || createYeomanEnvironment());
        logger.info(`Running template ${templateName}...`);
        logger.debug(`Running generator ${generatorName}...`);
        const generators = env.getGeneratorsMeta();
        const generator = generators[generatorName];
        if (!generator) {
            logger.error(`Template ${templateName} not found`);
            throw new Error(`Template ${templateName} not found`);
        }
        return new Promise((resolve, reject) => {
            env.run(generatorName, {}, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    });
}
exports.runGenerator = runGenerator;
/**
 * Prompt the user to select a generator. When the user
 * selects a generator, run it.
 */
function promptGeneratorSelection(options) {
    return __awaiter(this, void 0, void 0, function* () {
        options = options || {};
        const env = yield (options['env'] || createYeomanEnvironment());
        // TODO(justinfagnani): the typings for inquirer appear wrong
        const answers = yield inquirer_1.prompt([createSelectPrompt(env)]);
        const generatorName = answers['generatorName'];
        yield runGenerator(generatorName, { templateName: getDisplayName(generatorName), env: env });
    });
}
exports.promptGeneratorSelection = promptGeneratorSelection;
