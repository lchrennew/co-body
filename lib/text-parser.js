import Parser from "./parser.js";

export default class TextParser extends Parser {

    static get defaultTypes() {
        return [ 'text/*' ]
    }
}
