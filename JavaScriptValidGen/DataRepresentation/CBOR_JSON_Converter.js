import fs from 'fs';
import cose from 'cose-js';
import cbor from 'cbor';
import forge from 'node-forge';
import ECKey from 'ec-key';


/**
 * Converts a `cbor object` into a `json object`.
 * @param {bytes} cbor_obj - `Cbor` object to be converted
 * @return {dict} - `Json` object represented in `dict` format
 */
export function cbor2json(cbor_obj) {
	return cbor.decodeAllSync(cbor_obj,
		function(error, obj) {
			return obj
	})[0];
}

/**
 * Converts a `json object` into a `cbor object`.
 * @param {dict} json_obj - `Json` object to be converted
 * @return {bytes} - `Cbor` object represented in `bytes`
 */
export function json2cbor(json_obj) {
	return cbor.encode(json_obj);
}

function load_number_as_hex(data) {
	let string = ""

	data.forEach(number => string += number.toString(16))

	if (string.length % 2 === 1) {
		string = "0" + string
	}

	return string
}

/**
 * Loads a cose key given another key.
 * @param {bytes|string} key_or_path - Key used to load other key, or path to PEM file
 * @param {string} yourPassphrase - Passphrase used to encrypt key
 * @return {Object|Buffer} - Representing loaded cose key
 */
function load_key(key_or_path, yourPassphrase) {
	let key;
	try {
		const pem = fs.readFileSync(key_or_path).toString()
		const pki = forge.pki

		const t = forge.pem.decode(pem)
		const type = t[0].type

		if (type.indexOf("RSA") !== -1 && type.indexOf("PRIVATE") !== -1) {
			let privateKey = pki.decryptRsaPrivateKey(pem, yourPassphrase);

			key = {
				"e": Buffer.from(load_number_as_hex(privateKey.e.data), 'hex'),
				"n": Buffer.from(load_number_as_hex(privateKey.n.data), 'hex'),
				"d": Buffer.from(load_number_as_hex(privateKey.d.data), 'hex'),
				"p": Buffer.from(load_number_as_hex(privateKey.p.data), 'hex'),
				"q": Buffer.from(load_number_as_hex(privateKey.q.data), 'hex'),
				// "dp": privateKey.dp,
				// "dq": privateKey.dq,
				// "qi": privateKey.qinv
			}
		} else if (type.indexOf("EC") !== -1 && type.indexOf("PRIVATE") !== -1) {
			let privateKey = new ECKey(pem, 'pem');

			key = {
				"crv": privateKey.curve,
				"d": privateKey.d
			}
		} else if (type.indexOf("OKP") !== -1 && type.indexOf("PRIVATE") !== -1) {
		} else if (type.indexOf("PUBLIC") !== -1) {
			try {
				let publicKey = pki.publicKeyFromPem(pem);

				key = {
					"e": Buffer.from(load_number_as_hex(publicKey.e.data), 'hex'),
					"n": Buffer.from(load_number_as_hex(publicKey.n.data), 'hex'),
				}
			} catch (e) {
				let publicKey = new ECKey(pem, 'pem');

				key = {
					"crv": publicKey.curve,
					"y": publicKey.y,
					"x": publicKey.x
				}
			}
		} else {
			console.log("Erro")
		}

		return {'key': key}
	} catch (e) {
		return Buffer.from(key_or_path, 'hex')
	}
}

/**
 * Sign a `json object` and return an equivalent `cose object`.
 * @param {dict} payload - `JSON` object to be signed
 * @param {dict} phdr - Protected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
 * @param {dict} uhdr - Unprotected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
 * @param {bytes} key - Keys used to sign object
 * @param {string} passphrase - Passphrase used to encrypt key
 * @return {bytes|dict} - Representation of CBOR/COSE object
 * @exception Error - If an invalid combination of headers has been found or key type
 */
export async function sign(payload, phdr, uhdr, key, passphrase) {
	const headers = {
	  'p': phdr,
	  'u': uhdr
	};

	const signer = load_key(key, passphrase)

	return cose.sign.create(
	  	headers,
	  	JSON.stringify(payload),
	  	signer)
	.then((buf) => {
	  	return buf
	}).catch((error) => {
	  console.log(error);
	});
}

/**
 * Generates an Hash of a `json object` and return an equivalent `cose object`.
 * @param {dict} payload - `JSON` object to be hashed
 * @param {dict} phdr - Protected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
 * @param {dict} uhdr - Unprotected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
 * @param {bytes} key - Keys used to sign object
 * @param {string} passphrase - Passphrase used to encrypt key
 * @return {bytes|dict} - Representation of CBOR/COSE object
 * @exception Error - If an invalid combination of headers has been found or wrong key type
 */
export async function mac(payload, phdr, uhdr, key, passphrase) {
	const headers = {
	  'p': phdr,
	  'u': uhdr
	};

	const recipent = {'key': load_key(key, passphrase)}

	return cose.mac.create(
	  	headers,
		JSON.stringify(payload),
	  	recipent)
	.then((buf) => {
	  	return buf
	}).catch((error) => {
	  console.log(error);
	});
}

/**
 * Encrypts a `json object` and return an equivalent `cose object`.
 * @param {dict} payload - `JSON` object to be hashed
 * @param {dict} phdr - Protected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
 * @param {dict} uhdr - Unprotected headers, dict with pairs of key, values of either plaintext or cose.headers object (and cose.algorithms, p.e.)
 * @param {bytes} key - Keys used to sign object
 * @param {string} passphrase - Passphrase used to encrypt key
 * @return {bytes|dict} - Representation of CBOR/COSE object
 * @exception Error - If an invalid combination of headers has been found or wrong key type
 */
export async function enc(payload, phdr, uhdr, key, passphrase) {
	const headers = {
	  'p': phdr,
	  'u': uhdr
	};

	const recipent = {'key': load_key(key, passphrase)}

	return cose.encrypt.create(
	  	headers,
		JSON.stringify(payload),
		recipent)
	.then((buf) => {
	  	return buf
	}).catch((error) => {
	  console.log(error);
	});
}

/**
 * Decodes a `cose mac object` and returns equivalent `json object`.
 * @param {bytes} cose_obj - `Cose` object to be decoded
 * @param {bytes} key - Keys used to sign object
 * @param {string} passphrase - Passphrase used to encrypt key
 * @return {string|dict} - Payload in `cose_obj`
*/
export async function decode_sign(cose_obj, key, passphrase) {
	const verifier = load_key(key, passphrase)

	return cose.sign.verify(
		cose_obj,
		verifier
	).then((payload) => {
		if (isJson(payload))
			return JSON.parse(payload.toString('utf8'))
		else
			return payload
	}).catch((error) => {
		console.log(error);
	});
}

/**
 * Decodes a `cose mac object` and returns equivalent `json object`.
 * @param {bytes} cose_obj - `Cose` object to be decoded
 * @param {bytes} key - Keys used to sign object
 * @param {string} passphrase - Passphrase used to encrypt key
 * @return {string|dict} - Payload in `cose_obj`
*/
export async function decode_mac(cose_obj, key, passphrase) {
	const cose_key = load_key(key, passphrase)

	return cose.mac.read(
		cose_obj,
		cose_key
	).then((payload) => {
		if (isJson(payload))
			return JSON.parse(payload.toString('utf8'))
		else
			return payload
	}).catch((error) => {
		console.log(error);
	});
}

/**
 * Decodes a `cose encrypt object` and returns equivalent `json object`.
 * @param {bytes} cose_obj - `Cose` object to be decoded
 * @param {bytes} key - Keys used to sign object
 * @param {string} passphrase - Passphrase used to encrypt key
 * @return {string|dict} - Payload in `cose_obj`
*/
export async function decode_enc(cose_obj, key, passphrase) {
	const cose_key = load_key(key, passphrase)

	return cose.encrypt.read(
		cose_obj,
		cose_key
	).then((payload) => {
		if (isJson(payload))
			return JSON.parse(payload.toString('utf8'))
		else
			return payload
	}).catch((error) => {
		console.log(error);
	});
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/*
let encoded1 = await sign({"1": "2"}, {'alg': 'ES256'}, {'kid': '11'}, "ecprikey.pem", "Andre")
console.log(encoded1)
let decoded2 = await decode_sign(encoded1, "ecpubkey.pem", "Andre")
console.log(decoded2)
*/

/*
let encoded3 = await mac({"3": "4"},{'alg': 'SHA-256_64'}, {'kid': 'our-secret'},'231f4c4d4d3051fdc2ec0a3851d5b383')
// console.log("Teste: " + encoded3)
let decoded4 = await decode_mac(encoded3, '231f4c4d4d3051fdc2ec0a3851d5b383')
console.log(decoded4)
*/

/*
let encoded5 = await enc("{\"5\": \"6\"}",{'alg': 'A128GCM'}, {'kid': '11'},'231f4c4d4d3051fdc2ec0a3851d5b383')
// console.log(encoded5)
let decoded6 = await decode_enc(encoded5, '231f4c4d4d3051fdc2ec0a3851d5b383')
console.log(decoded6)
*/
