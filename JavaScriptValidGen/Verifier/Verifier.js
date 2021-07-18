import Ajv from 'ajv';
import $RefParser from "@apidevtools/json-schema-ref-parser";

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
     * Dereferences a schema, should be used if contains "$ref" for external files
     */
    async dereference() {
        this.schema = await $RefParser.bundle(this.schema);
    }

    /**
     * Verifies if `specification` object follows loaded schema.
     * @param {dict} specification - Dictionary representing the specification to be verified
     */
    verify(specification) {
        try {
            return new Ajv().validate(this.schema, specification)
        }
        catch (e) {
            return false
        }
    }
}

/*
import fs from "fs";

const data = fs.readFileSync('..\\..\\JSON_Files\\mDL_specification_prototype.json').toString()
const vf = new Verifier(JSON.parse(fs.readFileSync('..\\..\\JSON_Files\\standard_format_prototype.json').toString()));
console.log(vf.verify(JSON.parse(data)));
*/

export default Verifier
