import {Exception} from "../Exception/Exception.js"
import encoding from "encoding"
import moment from 'moment'

/**
 * Verifies if `string` is encoded in Base 64.
 * @param {string} str - String object to be verified
 * @return {boolean} - True, if `string` complies with Base 64 format, False, otherwise
 */
function isBase64(str) {
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    return base64regex.test(str)
}

const whitespace = ' \t\n\r\v\f'
const ascii_lowercase = 'abcdefghijklmnopqrstuvwxyz'
const ascii_uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ascii_letters = ascii_lowercase + ascii_uppercase
const digits = '0123456789'
const punctuation = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
const restrictions_dict = {'digits': new Set(digits), 'letters': new Set(ascii_letters), 'punctuation': new Set(punctuation),
                       'whitespace':  new Set(whitespace)}
const available_restrictions = new Set(['digits', 'letters', 'punctuation', 'whitespace'])

/**
 * Verifies if `string` complies with `restrictions`, ie. `string` can't contain characters from the `restriction`.
 * @param {string} string - String object to be verified
 * @param {Set} restrictions - Set object containing restrictions wanted
 * @exception ExceptionValidation(100) - if restrictions argument contains values not supported
 * @exception ExceptionValidation(101) - if string argument contains characters defined by the imposed restrictions
 */
function check_for_restrictions(string, restrictions) {
    if (!isSubsetOf(available_restrictions, restrictions)) {
        throw new Exception("Restrictions defined doesn't match with possible values", 100)
    }

    let pattern = new Set()
    for (let restriction of restrictions) {
        restrictions_dict[restriction].forEach(i => pattern.add(i))
    }

    if ((new Set([...string].filter(i => pattern.has(i)))).size !== 0) {
        throw new Exception("Invalid Characters", 101)
    }
}

/**
 * Verifies if `string` complies with `restrictions`, ie. `string`  must be of a length that complies with the defined restrictions.
 * @param {string} string - String object to be verified
 * @param {number|null} string_length - Length wanted for `string`
 * @param {number|null} min_length - Minimum length for `string`
 * @param {number|null} max_length - Maximum length for `string`
 * @exception ExceptionValidation(200) - if length of string argument does not match length argument
 * @exception ExceptionValidation(201) - if length of string argument is superior than max_length argument
 * @exception ExceptionValidation(202) - if length of string argument is inferior than min_length argument
 */
function check_length(string, string_length, min_length, max_length) {
    if (string_length !== null && string.length !== string_length) {
        throw new Exception("{0} doesn't have defined length: {1}", 200, string, string_length)
    }
    if (max_length !== null && string.length > max_length) {
        throw new Exception("{0} exceeds maximum length: {1}", 201, string, max_length)
    }
    if (min_length !== null && string.length < min_length) {
        throw new Exception("{0} doesn't meet minimum length: {1}", 202, string, min_length)
    }
}

/**
 * Verifies if a set is a subset of other set.
 * @param {set} set - String object to be verified
 * @param {Set} subset - Length wanted for `string`
 * @return {boolean} - True, if `subset` is subset of `set`, False, otherwise
 */
function isSubsetOf(set, subset) {
    return Array.from(new Set([...set, ...subset])).length === set.size;
}

/**
 * Verifies if `number` complies with restrictions defined.
 * @param {string|string[]} string - String to be verified
 * @param {object} options - Object containing all possible restrictions
 * @exception ExceptionValidation(102) - if string contains characters not defined in alphabet
 * @exception ExceptionValidation(300) - if contains multiple values and shouldn't
 * @exception ExceptionValidation(400) - if binary string isn't encoded in Base 64
 * @exception ExceptionValidation(401) - if string isn't a string value
 * @exception ExceptionValidation(402) - if string can't be encoded in the defined encoding
 * @exception ExceptionValidation(500) - if string value isn't defined in given enum
 * @exception Exceptions thrown by `check_length` and `check_for_restrictions`
 */
export function check_format_string(string, options) {
    options = options || {}
    const is_binary = options.is_binary || false;
    const string_length = options.string_length || null;
    let alphabet = options.alphabet || null;
    const min_length = options.min_length || null;
    const max_length = options.max_length || null;
    const encoding_ = options.encoding || null;
    const is_multiple_values = options.is_multiple_values || false;
    const enums = options.enums || null;
    const restrictions = options.restrictions || null;

    if (!is_multiple_values && typeof string !== "string") {
        throw new Exception("String {0} contains multiple values or isn't a string}", 300, string.valueOf())
    }
    if (typeof (string) === "string") {
        string = [string]
    }

    if (alphabet !== null && (typeof (alphabet) === "string" || typeof (alphabet) === "object")) {
        alphabet = new Set(alphabet)
    }
    else {
        alphabet = null
    }

    for (let s of string) {
        check_length(s, string_length, min_length, max_length)

        if (is_binary) {
            if (typeof (s) !== "string" || !isBase64(s))
                throw new Exception("String encoding doesn't match Base 64", 400)
        } else {
            if (typeof (s) !== "string") {
                throw new Exception("String isn't a str object", 401)
            }
            if (encoding_ !== null && s !== encoding.convert(s, encoding_, encoding_).toString()) {
                throw new Exception("String couldn't be encoded to {1}", 402, encoding_)
            }

            if (enums !== null && typeof (enums) === "object" && !(enums.indexOf(s))) {
                throw new Exception("String {0} isn't defined in possible values: {1}", 500, s, enums)
            }
            if (restrictions !== null && typeof (restrictions) === "object") {
                check_for_restrictions(s, new Set(restrictions))
            }

            if (alphabet !== null) {
                const string_set = new Set(s);
                const result = isSubsetOf(alphabet, string_set)
                if (!result) {
                    throw new Exception("Invalid Characters", 101)
                }
            }
        }
    }
}

/**
 * Verifies if `number` is a Integer or Float Object.
 * @param {number|null} number - Number to be verified
 * @param {object} options - Object containing all possible restrictions
 * @exception ExceptionValidation(600) - if number must be an integer and isn't
 * @exception ExceptionValidation(601) - if number isn't a number
 */
function check_number(number, options) {
    options = options || {}
    const is_nullable = options.is_nullable || false;
    let is_int = options.is_int;
    if (is_int === undefined) {
        is_int = true
    }
    const type_num = options.type_num || null;

    if (is_nullable && number === null) {
        return
    }

    // 3.0 é int, ver isso
    const int_format = /^[+-]?[0-9]+$/;
    if (is_int && !int_format.test(number.toString())) {
        throw new Exception("{0} {1} isn't an Integer", 600, type_num, number)
    }

    if (is_int && (typeof number !== "number" || !Number.isInteger(number))) {
        throw new Exception("{0} {1} isn't an Integer", 600, type_num, number)
    }

    if (typeof number !== "number") {
        throw new Exception("{0} {1} isn't a Number", 601, type_num, number)
    }
}

/**
 * Verifies if `number` is a Integer or Float Object and if respects all bounds defined.
 * @param {number} number - Number to be verified
 * @param {object} options - Object containing all possible restrictions
 * @exception ExceptionValidation(700) - if number exceeds the defined length
 * @exception ExceptionValidation(701) - if number is lower than the minimum value
 * @exception ExceptionValidation(702) - if number is higher than the maximum value
 * @exception Exception thrown by `check_number`
 */
export function check_format_number(number, options) {
    options = options || {};
    const is_int = options.is_int || false;
    const number_length = options.number_length || null;
    const lower_bound = options.lower_bound || null;
    const upper_bound = options.upper_bound || null;

    if (isNaN(number))
        throw new Exception("{0} {1} isn't a Number", 601, "Main number", number)

    number = parseInt(number)

    check_number(number, {is_int: is_int, type_num: "Main Number"})
    check_number(number_length, {is_nullable:true, is_int:true, type_num:"Length"})
    check_number(lower_bound, {is_nullable:true, is_int:true, type_num:"Minimum Value"})
    check_number(upper_bound, {is_nullable:true, is_int:true, type_num:"Maximum Value"})

    if (number_length !== null && number >= Math.pow(10, number_length))
    {
        throw new Exception("{0} exceeds length of {1}", 700, number, number_length)
    }
    if (lower_bound !== null && number < lower_bound)
    {
        throw new Exception("{0} lower than the minimum value of {1}", 701, number, lower_bound)
    }
    if (upper_bound !== null && number > upper_bound) {
        throw new Exception("{0} exceeds maximum value of {1}", 701, number, upper_bound)
    }
}

/**
 * Verifies if `value` is a bool object.
 * @param {object} value - Object to be verified
 * @exception ExceptionValidation(800) - if value isn't a boolean object
 */
export function check_format_boolean(value){
    if (typeof value !== "boolean"){
        throw new Exception("{0} isn't a boolean value", 800, value)
    }
}

/**
 * Verifies if `string` defines a date following a given format.
 * @param {string} date - String date to be verified
 * @param {object} options - Object containing all possible restrictions
 * @exception ExceptionValidation(900) - if date isn't a string
 * @exception ExceptionValidation(901) - date doesn't follow date format
 * @exception ExceptionValidation(902) - if date must be a future date, but isn't
 * @exception ExceptionValidation(903) - if date must be a past date, but isn't
 * @exception ExceptionValidation(904) - date is lower than requested
 * @exception ExceptionValidation(905) - date is higher than requested
 */
export function check_format_date(date, options) {
    options = options || {};
    const is_full_date = options.is_full_date || false;
    const past_date = options.past_date || false;
    const futute_date = options.futute_date || false;
    const years_or_more = options.years_or_more || null;
    const years_or_less = options.years_or_less || null;

    if (typeof date !== "string") {
        throw new Exception("{0} isn't a string", 900, date)
    }

    let date_formatter;
    if (is_full_date) {
        date_formatter = 'YYYY-MM-DD HH:mm:ss';
    } else {
        date_formatter = 'YYYY-MM-DD';
    }

    const date_formatted = moment(date, date_formatter, true);

    if (!date_formatted.isValid()) {
        throw new Exception("{0} doesn't follow format {1}", 901, date, date_formatter)
    }

    const now = new Date()

    if (past_date && (!dateInPast(date_formatted._d, now))) {
        throw new Exception("{0} represents a future date and it was requested a past date", 902, date)
    }

    if (futute_date && (!dateInFuture(date_formatted._d, now))) {
        throw new Exception("{0} represents a past date and it was requested a future date", 903, date)
    }

    const years_passed = moment(now).diff(date_formatted, 'years');

    if (years_or_more !== null && years_passed >= 0 && years_or_more > years_passed) {
        throw new Exception("{0} was {1} years ago, and should be at least {2}", 904, date, years_passed, years_or_more)
    }

    if (years_or_less !== null && 0 <= years_or_less < years_passed) {
        throw new Exception("{0} was {1} years ago, and should no more than least {2}", 905, date, years_passed, years_or_less)
    }
}

/**
 * Verifies if `firstDate` comes before `secondDate`.
 * @param {Date} firstDate - Date to be compared
 * @param {Date} secondDate - Date to be compared
 * @return {boolean} - True, if `firstDate` comes before `secondDate`, False, otherwise
 */
const dateInPast = function (firstDate, secondDate) {
    return firstDate.setHours(0, 0, 0, 0) < secondDate.setHours(0, 0, 0, 0);
};

/**
 * Verifies if `firstDate` comes after `secondDate`.
 * @param {Date} firstDate - Date to be compared
 * @param {Date} secondDate - Date to be compared
 * @return {boolean} - True, if `firstDate` comes after `secondDate`, False, otherwise
 */
const dateInFuture = function (firstDate, secondDate) {
    return firstDate.setHours(0, 0, 0, 0) > secondDate.setHours(0, 0, 0, 0);
};

/**
 * Verifies if `string` defines a date following a given format.
 * @param {object} obj - String date to be verified
 * @param {object} functions_dict - Object containing all possible restrictions
 */
export function check_format_object(obj, functions_dict) {
    for (let obj1 of obj) {
         for (let item in obj1) {
            let func = functions_dict[item]

            if (obj1[item] !== null && obj1[item] !== []) {
                func(obj1[item])
            }
        }
    }
}
