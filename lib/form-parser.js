import Parser from "./parser.js";
import qs from "qs";

export default class FormParser extends Parser {

    get defaultOpts() {
        return {
            ...super.defaultOpts,
            limit: '56kb',
            queryString: { allowDots: true },
            qs
        }
    }

    getParsed(raw) {
        const { qs, queryString } = this.opts
        return qs.parse(raw, queryString);
    }
}
