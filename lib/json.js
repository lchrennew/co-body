'use strict';

/**
 * Module dependencies.
 */
import raw from "raw-body";
import inflate from "inflation";
import { clone } from "./utils.js";

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

/**
 * Return a Promise which parses json requests.
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
    const { strict } = opts;


    const parse = str => {
        if (!strict) return str ? JSON.parse(str) : str;
        // strict mode always return object
        if (!str) return {};
        // strict JSON test
        if (!strictJSONReg.test(str)) {
            throw new SyntaxError('invalid JSON, only supports object and array');
        }
        return JSON.parse(str);
    };

    const str = await raw(inflate(req), opts);
    try {
        const parsed = parse(str);
        return opts.returnRawBody ? { parsed, raw: str } : parsed;
    } catch (err) {
        err.status = 400;
        err.body = str;
        throw err;
    }
}
