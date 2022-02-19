/**
 * Module dependencies.
 */
import json from "./json.js";
import form from "./form.js";
import text from "./text.js";

const defaultJsonTypes = [ 'json', 'application/*+json', 'application/csp-report' ];
const defaultFormTypes = [ 'urlencoded' ];
const defaultTextTypes = [ 'text' ];

const defaultTypes = {
    json: defaultJsonTypes,
    form: defaultFormTypes,
    text: defaultTextTypes,
}

const parsers = {
    json,
    form,
    text,
}

/**
 * Return a Promise which parses form and json requests
 * depending on the Content-Type.
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
    opts ??= {};

    for (const type in parsers) {
        const { [`${type}Types`]: types = defaultTypes[type] } = opts
        if (ctx.is(types)) return parsers[type](ctx, opts)
    }

    // invalid
    const type = ctx.request.type;
    const message = type ? 'Unsupported content-type: ' + type : 'Missing content-type';
    const err = new Error(message);
    err.status = 415;
    throw err;
}
