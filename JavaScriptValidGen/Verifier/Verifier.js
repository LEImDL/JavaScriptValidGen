import Validator from "jsonschema"
const v = new Validator.Validator();


/**
 * A class used to verify documents.
 */
class Verifier {
    /**
     * Load schema from file `schema`, must be a *.json* file.
     * @param {dict} schema - Dictionary representing the schema
     */
    constructor(schema) {
        this.schema = schema
    }

    /**
     * Verifies if `specification` object follows loaded schema.
     * @param {dict} specification - Dictionary representing the specification to be verified
     */
    verify(specification) {
        try {
            return v.validate(specification, this.schema).valid
        }
        catch (e) {
            return false
        }
    }
}

/*
import fs from "fs";

const data = fs.readFileSync('C:\\Users\\a84807\\Desktop\\Uni\\4ANO\\LEI\\JSON_Files\\mDL_specification_prototype.json').toString()
const vf = new Verifier(JSON.parse(data))
console.log(vf.verify(JSON.parse(fs.readFileSync('C:\\Users\\a84807\\Desktop\\Uni\\4ANO\\LEI\\JSON_Files\\standard_format_prototype.json').toString())));
*/

export default Verifier
