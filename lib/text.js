'use strict';

/**
 * Module dependencies.
 */
import raw from "raw-body";
import inflate from "inflation";
import { clone } from "./utils.js";

/**
 * Return a Promise which parses text/plain requests.
 *
 * Pass a node request or an object with `.req`,
 * such as a koa Context.
 *
 * @param {Request} req
 * @param {Options} [opts]
 * @return {Function}
 * @api public
 */
export default async (req, opts) => {
    req = req.req ?? req;
    opts = clone(opts);

    // defaults
    const len = req.headers['content-length'];
    const encoding = req.headers['content-encoding'] || 'identity';
    if (len && encoding === 'identity') opts.length = ~~len;
    opts.encoding ??= 'utf8';
    opts.limit ??= '1mb';

    const str = await raw(inflate(req), opts);
    // ensure return the same format with json / form
    return opts.returnRawBody ? { parsed: str, raw: str } : str;
}
