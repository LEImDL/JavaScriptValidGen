/**
 * A class used to throw user-defined exceptions
 */
export class Exception extends Error {

    /*
    :param code:
    100 -> Unknown restrictions
    101 -> Characters not allowed
    200 -> Invalid length
    201 -> Exceeds Maximum length
    202 -> Exceeds Minimum length
    300 -> Multiples values for singleton value
    400 -> Not Encoded in Base64
    401 -> String value isn't String
    402 -> Not Encoded in given Encoding
    500 -> Value not defined in Enum
    600 -> Numerical value isn't Integer
    601 -> Numerical value isn't Numeric
    700 -> Invalid length (numeric representation)
    701 -> Exceeds Maximum value
    702 -> Exceeds Minimum value
    800 -> Boolean value isn't Boolean
    900 -> Date value isn't string
    901 -> Incorret format for date
    902 -> Future date, but past requested\n
    903 -> Past date, but future requested\n
    904 -> Exceeds maximum years limit\n
    905 -> Exceeds minimum years limit
    */

    /**
     * Constructor that saves information about a `specification` (ie. document format), `dict` object, as well as the target's filepath.
     * @param {string} message - String explaining thrown exception
     * @param {number} code - Integer that identifies the type of the exception thrown
     * @param {list} args - list of arguments used to format string passed
     */
    constructor(message, code, ...args) {
        let msg = message.format(args)
        super(msg);
        this.code = code
    }
}


if (!String.prototype.format)
{
    String.prototype.format = function()
    {
        const args = arguments;

        if (typeof args[0] != "object")
        {
            return this.replace(/{\d+}/g, function(m)
            {
                const index = Number(m.replace(/\D/g, ""));
                return (args[index] ? args[index] : m);
            });
        }
        else
        {
            const obj = args[0];

            return this.replace(/{\w+}/g, function(m)
            {
                const key = m.replace(/[{}]/g, "");
                return (obj.hasOwnProperty(key) ? obj[key] : m);
            });
        }
    };
}

