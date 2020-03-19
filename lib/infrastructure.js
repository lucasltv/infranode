/*!
 * infranode
 * Copyright(c) 2019 Lucas Thomaz Vieira
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

// var flatten = require('array-flatten');


/**
 * Infra prototype.
 */

var infra = exports = module.exports = {};

/**
 * Initialize the infra
 *
 *   - setup and save models to each folder
 *   - connect
 *
 * @private
 */

infra.init = function init(settings = {}) {
    this.defaultConfiguration(settings);
    if (this.get('env') === "development" && this.enabled('copyModelGeneratorScriptToRoot')) {
        //Copy model generator to root folder
        try {
            var fs = require('fs');
            fs.copyFileSync(__dirname + '/../examples/modelGeneratorSample.js', __dirname + '/../../../modelGenerator.js');
        } catch (err) {
            console.error(err)
        }
    }

};

/**
 * Initialize application configuration.
 * @private
 */

infra.defaultConfiguration = function defaultConfiguration(settings) {
    this.settings = settings;
    var env = process.env.NODE_ENV || 'development';

    // default settings
    this.set('env', env);
};

/**
 * Assign `setting` to `val`
 *    infra.set('foo', 'bar');
 *
 * @param {String} setting
 * @param {*} [val]
 * @public
 */

infra.set = function set(setting, val) {
    this.settings[setting] = val;
    return this;
};

/**
 * Get `setting`
 *    infra.set('foo', 'bar');
 *
 * @param {String} setting
 * @param {*} [val]
 * @public
 */

infra.get = function get(setting) {
    return this.settings[setting];
};


/**
 * Check if `setting` is enabled (truthy).
 *
 *    infra.enabled('foo')
 *    // => false
 *
 *    infra.enable('foo')
 *    infra.enabled('foo')
 *    // => true
 *
 * @param {String} setting
 * @return {Boolean}
 * @public
 */

infra.enabled = function enabled(setting) {
    return Boolean(this.get(setting));
};

/**
 * Check if `setting` is disabled.
 *
 *    infra.disabled('foo')
 *    // => true
 *
 *    infra.enable('foo')
 *    infra.disabled('foo')
 *    // => false
 *
 * @param {String} setting
 * @return {Boolean}
 * @public
 */

infra.disabled = function disabled(setting) {
    return !this.get(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {infra} for chaining
 * @public
 */

infra.enable = function enable(setting) {
    return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {infra} for chaining
 * @public
 */

infra.disable = function disable(setting) {
    return this.set(setting, false);
};
