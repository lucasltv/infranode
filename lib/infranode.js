/*!
 * infranode
 * Copyright(c) 2019 Lucas Thomaz Vieira
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var infra = require('./infrastructure');

/**
 * Expose `createInfrastructure()`.
 */

exports = module.exports = createInfrastructure;

/**
 * Create the infra.
 *
 * @return {Function}
 */

function createInfrastructure(options) {
    infra.init(options);
    return infra;
}
