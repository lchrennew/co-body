/**
 * Module dependencies.
 */
import JsonParser from "./json-parser.js";
import FormParser from "./form-parser.js";
import TextParser from "./text-parser.js";

const defaultJsonTypes = [ 'json', 'application/*+json', 'application/csp-report' ];
const defaultFormTypes = [ 'urlencoded' ];
const defaultTextTypes = [ 'text/*' ];

const defaultTypes = {
    json: defaultJsonTypes,
    form: defaultFormTypes,
    text: defaultTextTypes,
}

const parsers = {
    json: JsonParser,
    form: FormParser,
    text: TextParser,
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
    const { limit: globalLimit } = opts
    for (const type in parsers) {
        const { [`${type}Types`]: types = defaultTypes[type], [`${type}Limit`]: limit = globalLimit } = opts
        if (ctx.is(types)) {
            const parser = new (parsers[type])({ ...opts, limit })
            return await parser.parse(ctx)
        }
    }

    // invalid
    const type = ctx.request.type;
    const message = type ? 'Unsupported content-type: ' + type : 'Missing content-type';
    const err = new Error(message);
    err.status = 415;
    throw err;
}
