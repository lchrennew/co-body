/**
 * Module dependencies.
 */
import raw from "raw-body";
import inflate from "inflation";
import qs from "qs";
import { clone } from "./utils.js";

/**
 * Return a Promise which parses x-www-form-urlencoded requests.
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
    req = req.req || req;
    opts = clone(opts);
    const { queryString = {} } = opts;

    // keep compatibility with qs@4
    queryString.allowDots ??= true

    // defaults
    const len = req.headers['content-length'];
    const encoding = req.headers['content-encoding'] ?? 'identity';
    if (len && encoding === 'identity') opts.length = ~~len;
    opts.encoding ??= 'utf8';
    opts.limit ??= '56kb';
    opts.qs ??= qs;

    const str = await raw(inflate(req), opts);
    try {
        const parsed = opts.qs.parse(str, queryString);
        return opts.returnRawBody ? { parsed, raw: str } : parsed;
    } catch (err) {
        err.status = 400;
        err.body = str;
        throw err;
    }
}
