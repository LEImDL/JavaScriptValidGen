/**
 * A class used to throw user-defined exceptions
 */
export class Exception extends Error {

    /*
    :param code: Integer that identifies the type of the exception thrown
        Possible values:\n
        100 -> Unknown restrictions\n
        101 -> Characters not allowed\n
        102 -> Characters not defined in alphabet\n
        200 -> Invalid length\n
        201 -> Exceeds Maximum length\n
        202 -> Exceeds Minimum length\n
        300 -> Multiples values for singleton value\n
        400 -> Not Encoded in Base64\n
        401 -> String value is not String\n
        402 -> Not Encoded in given Encoding\n
        500 -> Value not defined in Enum\n
        600 -> Numerical value is not Integer\n
        601 -> Numerical value is not Numeric\n
        700 -> Invalid length (numeric representation)\n
        701 -> Exceeds Maximum value\n
        702 -> Exceeds Minimum value\n
        800 -> Boolean value is not Boolean\n
        900 -> Date value is not String\n
        901 -> Incorrect format for date\n
        902 -> Future date, but past requested\n
        903 -> Past date, but future requested\n
        904 -> Exceeds Maximum years limit\n
        905 -> Exceeds Minimum years limit
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

