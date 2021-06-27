import {mac, sign, enc, decode_mac, decode_sign, decode_enc, cbor2json, json2cbor} from "./CBOR_JSON_Converter.js"
import fs from "fs"
import xml2js from 'xml2js'

/**
 * A class used to represent and process a document.
 */
export class Document {

    /**
     * Constructor that saves information about a Document.
     * @param {object} options - Object storing file information
     * @exception Error - If file and its content are both or none defined
     */
    constructor(options) {
        options = options || {};
        const file = options.file || null;
        const extension = options.extension || "JSON";
        let content = options.content || null;

        if (file === null && content === null) {
            throw Error("File and Content arguments are both undefined")
        }

        if (file !== null && content !== null) {
            throw Error("File and Content arguments are both defined")
        }

        if (content !== null) {
            try {
                content = JSON.parse(content)
            }
            catch (e) {
            }
        }

        this.filename = file
        this.content = content
        this.extension = extension

        this.process()
    }

    process() {
        if (this.content === null) {

            if (this.extension === "JSON") {
                this.content = JSON.parse(fs.readFileSync(this.filename, {encoding:'utf8', flag:'r'}))
            }
            else if (this.extension === "XML") {
                const data = fs.readFileSync(this.filename, {encoding:'utf8', flag:'r'})
                const parser = new xml2js.Parser({explicitArray: false});

                let s1 = {}
                parser.parseString(data, function (err, result) {
                    s1 = result['root'];
                });
                this.content = s1;
            }
            else if (this.extension === "CBOR"){
                this.content = cbor2json(fs.readFileSync(this.filename, {encoding:'utf8', flag:'rb'}))
            }
            else {
                throw Error("Formato não suportado")
            }
        }
    }

    /**
     * Signs a `json object` and return an equivalent `cose object`.
     * @param {dict} phdr - Protected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
     * @param {dict} uhdr - Unprotected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
     * @param {bytes} key - Keys used to sign object
     * @param {string} passphrase - Passphrase used to encrypt key
     * @return {bytes|dict} - Representation of CBOR/COSE object
     * @exception Error - If an invalid combination of headers has been found or key type
     */
    async sign(phdr, uhdr, key, passphrase) {
        return sign(this.content, phdr, uhdr, key, passphrase)
    }

    /**
     * Generates an Hash of a `json object` and return an equivalent `cose object`.
     * @param {dict} phdr - Protected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
     * @param {dict} uhdr - Unprotected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
     * @param {bytes} key - Keys used to sign object
     * @param {string} passphrase - Passphrase used to encrypt key
     * @return {bytes|dict} - Representation of CBOR/COSE object
     * @exception Error - If an invalid combination of headers has been found or key type
     */
    async mac(phdr, uhdr, key, passphrase) {
        return mac(this.content, phdr, uhdr, key, passphrase)
    }

    /**
     * Encrypts a `json object` and return an equivalent `cose object`.
     * @param {dic} phdr - Protected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
     * @param {dict} uhdr - Unprotected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
     * @param {bytes} key - Keys used to sign object
     * @param {string} passphrase - Passphrase used to encrypt key
     * @return {bytes|dict} - Representation of CBOR/COSE object
     * @exception Error - If an invalid combination of headers has been found or key type
     */
    async enc(phdr, uhdr, key, passphrase) {
        return enc(this.content, phdr, uhdr, key, passphrase);
    }

    /**
     * Used to get file content in `cbor` format.
     * @return {bytes} - Represent the content in `cbor`
     * @exception Error - If document content hasn't been loaded
     */
    to_cbor() {
        if (this.content) {
            return json2cbor(this.content)
        }
        else {
            throw Error("File and Content arguments are both defined")
        }
    }

    /**
     * Decodes a `cose sign object` and returns equivalent `json object`.
     * @param {bytes} cose_obj - `Cose` object to be decoded
     * @param {bytes} key - Keys used to sign object
     * @param {string} passphrase - Passphrase used to encrypt key
     * @return {Document} - containing the payload in `cose_obj`
     */
    static async decoded_sign(cose_obj, key, passphrase) {
        const content = decode_sign(cose_obj, key, passphrase)

        const options = {
            content: content
        }

        return new Document(options)
    }

    /**
     * Decodes a `cose mac object` and returns equivalent `json object`.
     * @param {bytes} cose_obj - `Cose` object to be decoded
     * @param {bytes} key - Keys used to sign object
     * @param {string} passphrase - Passphrase used to encrypt key
     * @return {Document} - containing the payload in `cose_obj`
     */
    static async decoded_mac(cose_obj, key, passphrase) {
        const content = decode_mac(cose_obj, key, passphrase)

        const options = {
            content: content
        }

        return new Document(options)
    }

    /**
     * Decodes a `cose encrypt object` and returns equivalent `json object`.
     * @param {bytes} cose_obj - `Cose` object to be decoded
     * @param {bytes} key - Keys used to sign object
     * @param {string} passphrase - Passphrase used to encrypt key
     * @return {Document} - containing the payload in `cose_obj`
     */
    static async decoded_enc(cose_obj, key, passphrase) {
        const content = await decode_enc(cose_obj, key, passphrase)

        const options = {
            content: content
        }

        return new Document(options)
    }
}

export default Document;

/*
function isEqualsJson(obj1,obj2){
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    //return true when the two json has same length and all the properties has same value key by key
    return keys1.length === keys2.length && Object.keys(obj1).every(key=> {
        if (typeof obj1[key] === "object") {
            return isEqualsJson(obj1[key], obj2[key])
        }
        else {
            return obj1[key] === obj2[key]
        }
    });
}


const d = new Document({content: {"ola": "dois"}})

const d = new Document({file: "..\\..\\Test_Files\\test.xml", extension: "XML"})
console.log(d.to_cbor())

const d1 = new Document({file: "..\\..\\JSON_Files\\mDL_example_document.json", extension: "JSON"})

const enc_content = await d1.enc({'alg': 'A128GCM'}, {'kid': '11'},'231f4c4d4d3051fdc2ec0a3851d5b383', '')
const dec = await Document.decoded_enc(enc_content, '231f4c4d4d3051fdc2ec0a3851d5b383', '')
console.log(isEqualsJson(dec.content, d1.content))
*/
