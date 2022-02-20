import Parser from "./parser.js";

export default class JsonParser extends Parser {
    static get defaultTypes() {
        return [ 'json', 'application/*+json', 'application/csp-report' ]
    }

    getParsed(raw) {
        return raw ? JSON.parse(raw) : raw
    }
}
