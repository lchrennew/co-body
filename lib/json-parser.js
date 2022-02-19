import Parser from "./parser.js";

export default class JsonParser extends Parser {
    getParsed(raw) {
        return raw ? JSON.parse(raw) : raw
    }
}
