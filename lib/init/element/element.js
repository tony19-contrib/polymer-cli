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
const chalk = require("chalk");
const path = require("path");
const yeoman_generator_1 = require("yeoman-generator");
class ElementGenerator extends yeoman_generator_1.Base {
    constructor(args, options) {
        super(args, options);
        this.sourceRoot(path.join(__dirname, 'templates'));
    }
    initializing() {
        // Yeoman replaces dashes with spaces. We want dashes.
        this.appname = this.appname.replace(/\s+/g, '-');
    }
    prompting() {
        return __awaiter(this, void 0, void 0, function* () {
            const prompts = [
                {
                    name: 'name',
                    type: 'input',
                    message: `Element name`,
                    default: this.appname + (this.appname.includes('-') ? '' : '-element'),
                    validate: (name) => {
                        let nameContainsHyphen = name.includes('-');
                        if (!nameContainsHyphen) {
                            this.log('\nUh oh, custom elements must include a hyphen in ' +
                                'their name. Please try again.');
                        }
                        return nameContainsHyphen;
                    },
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'Brief description of the element',
                },
            ];
            this.props = yield this.prompt(prompts);
        });
    }
    writing() {
        const name = this.props.name;
        this.fs.copyTpl(`${this.templatePath()}/**/?(.)!(_)*`, this.destinationPath(), this.props);
        this.fs.copyTpl(this.templatePath('_element.html'), `${name}.html`, this.props);
        this.fs.copyTpl(this.templatePath('test/_element_test.html'), `test/${name}_test.html`, this.props);
    }
    install() {
        this.log(chalk.bold('\nProject generated!'));
        this.log('Installing dependencies...');
        this.installDependencies({
            npm: false,
        });
    }
    end() {
        this.log(chalk.bold('\nSetup Complete!'));
        this.log('Check out your new project README for information about what to do next.\n');
    }
}
exports.ElementGenerator = ElementGenerator;
