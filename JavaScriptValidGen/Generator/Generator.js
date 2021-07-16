import fs from "fs"

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function printArrayWithCommas(values) {
    let s = ""

    let first = true
    for (let value of values) {
        if (! first){
            s += ", "
        }
        first = false

        if (typeof value === "string") {
            s += "\"" + value + "\""
        }
        else s += value
    }

    return s;
}

/**
 * A class used to load a `specification` and create a Python file for validating documents.
 */
export class Generator {
    /**
     * Constructor that saves information about a `specification` (ie. document format), `dict` object, as well as the target's filepath.
     * @param {dict} specification - The format to be defined/followed
     * @param {string} target - Path to the generated file
     */
    constructor(specification, target) {
        this.specification = specification;
        this.target = target;
        this.write = data => fs.appendFileSync(this.target, data)
    }

    check_duplicated_fields() {
        let fields = [];

        for(let i=0; i < this.specification['document'].length; i++){
            let field = this.specification['document'][i]
            fields.push(field['name'])
        }

        if (fields.length !== (new Set(fields)).size) {
            throw Error("Campos Duplicados")
        }
    }

    process_all(field, type, function_name, i) {
        let args = field[type]

        if (i === undefined) {
            this.write(function_name + "(val, {")
        }
        else{
            this.write(function_name + "(val" + i + ", {")
        }

        let first = true
        for(let pair of Object.entries(args)) {
            const [key, value] = pair;

            if (! first) {
                this.write(", ")
            }
            first = false

            if (typeof value === "string") {
                this.write(key + ":'" + value + "'")
            }
            else if (Array.isArray(value)) {
                this.write(key + ":[" + printArrayWithCommas(value) + "]")
            }
            else {
                this.write(key + ":" + value)
            }
        }
        this.write("}")
    }

    process_all_object(field, i) {
        let value = field['my_object'];

        const tmp = i === 0 ? '' : i - 1
        this.write('check_format_object(val' + tmp + ", {")

        const mandatories = []
        const optionals = []

        for (let field of value) {
            const name = field['name']

            if (field['mandatory']) {
                mandatories.push(name)
            }
            else {
                optionals.push(name)
            }

            this.write("'" + name + "': (val"+i + " => ")

            if ('my_object' in field) {
                this.process_all_object(field, i + 1)
            }
            else if ('string' in field){
                this.process_all(field, 'string', 'check_format_string', i)
            }
            else if ('number' in field){
                this.process_all(field, 'number', 'check_format_number', i)
            }
            else if ('boolean' in field){
                this.process_all(field, 'boolean', 'check_format_boolean', i)
            }
            else if ('date' in field){
                this.process_all(field, 'date', 'check_format_date', i)
            }
            else {
                throw Error("Unexcepted type")
            }

            this.write(")), ")
        }

        this.write("}, [" + printArrayWithCommas(mandatories) + "], [" + printArrayWithCommas(optionals) + "]")
    }

    get_mandatory() {
        let fields = [];

        for(let i=0; i < this.specification['document'].length; i++){
            let field = this.specification['document'][i]

            if (field['mandatory'] === true) {
                fields.push(field['name'])
            }
        }

        this.write("    let mandatories = [" + printArrayWithCommas(fields) + "];\n")
    }

    get_optionals() {
        const fields = [];

        for(let i=0; i < this.specification['document'].length; i++){
            let field = this.specification['document'][i]

            if (field['mandatory'] === false) {
                fields.push(field['name'])
            }
        }

        this.write("    let optionals = [" + printArrayWithCommas(fields) + "];\n")
    }

    createFile() {
        if (fs.existsSync(this.target)) {
            throw Error("File " + this.target + " already exists")
        }

        if (!fs.existsSync(path.join(__dirname, "Templates", "template0.txt"))) {
            throw Error("Template is missing")
        }
        else {
            fs.copyFileSync(path.join(__dirname, "Templates", "template0.txt"), this.target)
        }
    }

    finalizeFile() {
        if (!fs.existsSync(path.join(__dirname, "Templates", "template1.txt"))) {
            throw Error("Template is missing")
        } else {
            let template_code = fs.readFileSync(path.join(__dirname, "Templates", "template1.txt"), {encoding: 'utf8', flag: 'r'})
            fs.appendFileSync(this.target, template_code)
        }
    }

    generate_js_code() {
        this.write("    let function_dict = {")

        for (let i = 0; i < this.specification['document'].length; i++) {
            const field = this.specification['document'][i]
            const name = field['name']

            this.write("'" + name + "': val => ")

            if ('my_object' in field) {
                this.process_all_object(field, 0)
            }
            else if ('string' in field){
                this.process_all(field, 'string', 'check_format_string')
            }
            else if ('number' in field){
                this.process_all(field, 'number', 'check_format_number')
            }
            else if ('boolean' in field){
                this.process_all(field, 'boolean', 'check_format_boolean')
            }
            else if ('date' in field){
                this.process_all(field, 'date', 'check_format_date')
            }
            else {
                throw Error("Unexcepted type")
            }

            this.write("),\n                     ")
        }

        this.write("}\n\n")
    }

    /**
     * Creates a Python file capable of validating a document with `specification` loaded.
     * @exception DuplicatedFields - If `specification` is malformed with fields identified by the same name
     * @exception FileAlreadyExists - If target file already exists
     * @exception FileNotFound - If template files can't be found
     */
    main() {
        this.check_duplicated_fields()

        this.createFile()

        this.get_mandatory()
        this.get_optionals()

        this.generate_js_code()

        this.finalizeFile()

        console.log("Ficheiro criado")
    }
}

/*
import Document from "../DataRepresentation/Document.js";
const json = new Document({file:'..\\JSON_Files\\mDL_specification_prototype1.json'})
let gen = new Generator(json.content, "Try.js")

gen.main()
*/
