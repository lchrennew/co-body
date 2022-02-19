import rawBody from "raw-body";
import inflate from "inflation";
import deepmerge from "deepmerge";

export default class Parser {
    opts;

    constructor(opts) {
        this.opts = deepmerge({ ...this.defaultOpts }, opts ?? {}, { clone: true, });
    }


    /**
     *
     * @return {{limit: string, encoding: string}}
     */
    get defaultOpts() {
        return {
            encoding: 'utf8',
            limit: '1mb',
        }
    }

    get #returnRawBody() {
        return this.opts.returnRawBody
    }

    createOpts(ctx) {
        const opts = { ...this.opts }
        const { length } = ctx.request;
        const encoding = ctx.get('content-encoding') || 'identity';
        if (length && encoding === 'identity') opts.length = ~~length;
        return opts
    }

    /**
     *
     * @param raw
     * @return {{}}
     */
    getParsed(raw) {
        return raw
    }

    async parse(ctx) {
        const opts = this.createOpts(ctx)
        const raw = await rawBody(inflate(ctx.req), opts);
        try {
            const parsed = this.getParsed(raw)
            return this.#returnRawBody ? { parsed, raw } : parsed;
        } catch (err) {
            err.status = 400;
            err.body = raw;
            throw err;
        }
    }
}
