'use strict';

/**
 * Module dependencies.
 */
import TextParser from "./text-parser.js";

/**
 * Return a Promise which parses text/plain requests.
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
    const parser = new TextParser(opts)
    return await parser.parse(ctx)

    // opts = clone(opts);
    //
    // // defaults
    // const { length } = ctx.request;
    // const encoding = ctx.get('content-encoding') || 'identity';
    // if (length && encoding === 'identity') opts.length = ~~length;
    // opts.encoding ??= 'utf8';
    // opts.limit ??= '1mb';
    //
    // const raw = await rawBody(inflate(ctx.req), opts);
    // // ensure return the same format with json / form
    // return opts.returnRawBody ? { parsed: raw, raw: raw } : raw;
}
