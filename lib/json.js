'use strict';

/**
 * Module dependencies.
 */
import JsonParser from "./json-parser.js";

/**
 * Return a Promise which parses json requests.
 *
 * Pass a node request or an object with `.req`,
 * such as a koa Context.
 *
 * @param ctx
 * @param {Options} [opts]
 * @return {Function}
 * @api public
 */
export default async (ctx, opts) => {
    const parser = new JsonParser(opts)
    return parser.parse(ctx)
}
