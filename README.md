# JavaScriptValidGen - More than a JavaScript parser!

A fantastic *JavaScript* tool to parse and automate the generation of validation functions, as well as encode and decode to/from an arbitrary data structure.

## Features

- Verify if documents follow an arbitrary schema;
- Generate validation programs, i.e., files capable of validating digital documents following a set of rules or a specification;
- Read *XML*, *JSON* and *CBOR* files into an unique structure;
- Encode and Decode data into an external format (*CBOR*/*COSE*);
- Validate exemplaries of documents, f.e., *mDL*.


## JSON files format

### Documents format
There are three types of accepted documents scheme:

- An array of fields, each containing two values - "name" and "value".

````json
{
  "document": [
    {
      "name": "Family Name",
      "value": "Apelido"
    },
    {
      "name": "Given Name",
      "value": "Nome"
    }
  ]
}
````

- An array of fields, each containing only one value, in which key is the "name" followed by the "value".

````json
{
  "document": [
    {
      "Family Name": "Apelido"
    },
    {
      "Given Name": "Nome"
    }
  ]
}
````

- An object of fields, each containing only one value, in which key is the "name" followed by the "value".

````json
{
  "Family Name": "Apelido",
  "Given Name": "Nome"
}
````

### Specification's schema
In this file, the format of the documents to be validated is modelled, i.e., its structure, following the schema defined in the next section.\
Here it is specified every expected field - *name*, if it is *mandatory*, *type* of value expected and its *restrictions*.

#### Examples

1. For an obligatory family name using *utf-8* encoding, with a *maximum* length of 150, while ensuring that punctuation characters and digits are not used:

````json
{
  "name":"family_name",
  "string":{
    "is_binary":false,
    "encoding": "utf-8",
    "max_length": 150,
    "restrictions": ["punctuation", "digits"]
  },
  "mandatory":true
}
````

2. For an optional birthdate (date only), that must match to someone aged 16 or over:

````json
{
  "name":"birth_date",
  "date":{
    "is_full_date":false,
    "years_or_more": 16
  },
  "mandatory":false
}
````

3. For an optional *timestamp* (with an hour, minutes and seconds):

````json
{
  "name":"portrait_capture_date",
  "date":{
    "is_full_date":true
  },
  "mandatory":false
}
````

4. For an optional boolean value:

````json
{
  "name":"age_over_18",
  "boolean":{
  },
  "mandatory":false
}
````

5. For a mandatory binary string:

````json
{
  "name":"portrait",
  "string":{
    "is_binary":true
  },
  "mandatory":true
}
````

6. For an age field (*integer* value), restricted (in lower bound) to positive values, i.e., greater or equal than 0 (the same can be done to restrict the upper bound):

````json
{
  "name":"age_in_years",
  "number":{
    "is_int":true,
    "lower_bound":0
  },
  "mandatory":false
}
````

7. For a ten character string (containing only A, B, C, D, E, and F), a binary string, a string which length is between 10 and 20 characters (restricting the use of digits, ponctuation and whitespaces, that could be also letters), and a field that accepts an array of just enumerated values, respectively:

````json
{
  "example": [
    {
      "name":"string_example",
      "string":{
        "is_binary": false,
        "length": 10,
        "alphabet": "ABCDEF",
         "encoding": "latin-1"
      },
      "mandatory":true
    },
        {
      "name":"string_example",
      "string":{
        "is_binary": true
      },
      "mandatory":true
    },
    {
      "name":"string_example",
      "string":{
        "is_binary": false,
        "min_length": 10,
        "max_length": 20,
        "restrictions": ["punctuation", "digits", "whitespaces"]
      },
      "mandatory":true
    },
    {
      "name":"string_example",
      "string":{
        "is_binary": false,
        "is_multiple_values": true,
        "enums": ["AM", "A1", "A2", "A"]
      },
      "mandatory":true
    }
  ]
}
````

8. For a positive *integer* number, a *float* between 0 and 10 and a two-digit *integer*, respectively:

````json
{
  "example": [
    {
      "name":"number_example",
      "number":{
        "is_int":true,
        "lower_bound":0
      },
      "mandatory":false
    },
    {
      "name":"number_example",
      "number":{
        "is_int":false,
        "upper_bound":10,
        "lower_bound":0
      },
      "mandatory":false
    },
    {
      "name":"number_example",
      "number":{
        "is_int":true,
        "length": 2
      },
      "mandatory":false
    }
  ]
}
````

9. For a date that happened between 10 and 30 years ago, a past date (*timestamp*) and a future date, respectively:

````json
{
  "example": [
    {
      "name":"date_example",
      "date":{
              "is_full_date": false,
              "years_or_more": 10,
              "years_or_less": 30
      },
      "mandatory":false
    },
    {
      "name":"date_example",
      "date":{
              "is_full_date": true,
              "past_date": true
      },
      "mandatory":false
    },
    {
      "name":"date_example",
      "date":{
              "is_full_date": false,
              "future_date": true
      },
      "mandatory":false
    }
  ]
}
````

10. For a field containing inner fields in which one is also an object with inner fields (it is also possible to defined mandatory fields inside an optional object, which condition is only verified if the object exists):

````json
{
  "example": [
    {
      "name":"object_example",
      "my_object":[
        {
          "name":"string_example",
          "string":{
            "is_binary":false
          },
          "mandatory":true
        },
        {
          "name":"date_example",
          "date":{
            "is_full_date":false
          },
          "mandatory":false
        },
        {
          "name":"inner_object_example",
          "my_object": [
            {
              "name":"string_example",
              "string":{
                "is_binary":false
              },
              "mandatory":true
            }, 
            {
              "name":"string_example",
              "string":{
                "is_binary":false
              },
              "mandatory":false
            }
          ],
          "mandatory":false
        }
      ],
      "mandatory":true
    }
  ]
}
````

### Standard formats for specification
All specifications must should follow the schema in *standard_format_prototype.json*. In this file, it is defined the format for every field in the desired specification, for example, it is defined that every field must have a name, a boolean value to determine if it is mandatory, and the type of accepted fields. In addition to the four main types (explained in the next section), there is an object, i.e., a "recursive" type, since a certain document may contain fields inside some other outer object/value.

For example, in ***mDL***:

````json
{
  "...": "...",
  "driving_privileges": [
    {
      "vehicle_category_code": "B",
      "issue_date": "2010-03-15",
      "expiry_date": "2050-03-15",
      "codes": []
    }
  ],
  "....": "..."
}
````

#### Defined Types
There are four types of supported values - *strings*, *numbers*, *dates* and  *booleans*. In order to specify many documents without the need to redefine the same types, the file *types_prototype.json* was created.\
This file also contains all the accepted restrictions for each type.


## Execution example

### Verify schema - ***Verifier***
* Verify if `mDL_specification_prototype1` file follows the accepted schema for files.\
It is possible to use a different file extension, f.e., *XML*, but it has to follow the same type of "scheme".

```javascript
import Verifier from "javascript_valid_gen/Verifier/Verifier.js";
import Document from "javascript_valid_gen/DataRepresentation/Document.js";

const specification_path = 'JSON_Files/mDL_specification_prototype1.json'
const schema_path = 'JSON_Files/standard_format_prototype.json'

const document = new Document({file: specification_path, extension: "JSON"})
const specification = document.content

const schema = new Document({file: schema_path, extension: "JSON"})
const verifier = new Verifier(schema.content)

if (verifier.verify(specification))
    console.log("Valid Format")
else
    console.log("Invalid Format")
```

### Read files/objects + Encode/Decode Data - ***Document***+***CBOR_JSON_Converter***

* To load a *JSON* file, only the following code is required.

```javascript
import Document from "javascript_valid_gen/DataRepresentation/Document.js";

const specification_path = 'JSON_Files/mDL_specification_prototype1.json'
const document = new Document({file: specification_path, extension: "JSON"})
const specification = document.content

console.log(specification)
```

* For *XML* files, the required code is similar.

```javascript
import Document from "javascript_valid_gen/DataRepresentation/Document.js";

const specification_path = 'Test_Files/file.xml'
const document = new Document({file: specification_path, extension: "XML"})
const specification = document.content

console.log(specification)
```

* For *CBOR* files, the required code is also identical.

```javascript
import Document from "javascript_valid_gen/DataRepresentation/Document.js";

const specification_path = 'Test_Files/file.cbor'
const document = new Document({file: specification_path, extension: "CBOR"})
const specification = document.content

console.log(specification)
```

It is possible to load data from more sources than files, f.e., a *dict* object. In this example, the object is later converted into a *CBOR* object, to finally load it again.

```javascript
import Document from "javascript_valid_gen/DataRepresentation/Document.js";
import {cbor2json} from "javascript_valid_gen/DataRepresentation/CBOR_JSON_Converter.js";

const s = {"document": [{"name": "Family Name", "string": {"is_binary": false, "encoding": "utf-8", "max_length": 150, "restrictions": ["punctuation", "digits"]}, "mandatory": true}]}
let document = new Document({content:s})
console.log(document.content)

let cbor_obj = document.to_cbor()
console.log(cbor_obj)
let json_obj = cbor2json(cbor_obj)

let document1 = new Document({content:json_obj})
console.log(document1.content)
```

Last, but not least, the object is converted into a *COSE* object.\
All three operations (*encryption*, *mac* and *sign*) are supported, as well all header values defined in `Cose-JS` library:

- *Encrypting* using a symmetric key:

```javascript
import Document from "javascript_valid_gen/DataRepresentation/Document.js";

const specification_path = 'JSON_Files/mDL_example_document3.json'
const document = new Document({file:specification_path, extension:"JSON"})

const key = '231f4c4d4d3051fdc2ec0a3851d5b383'
const enc = await document.enc({'alg': 'A128GCM'}, {'kid': '11'}, key, '')

const dec = await Document.decoded_enc(enc, key, '')
console.log(dec.content)
```

- Calculate a *MAC* for the document to ensure its integrity, using the same key for both operations:

```javascript
import Document from "javascript_valid_gen/DataRepresentation/Document.js";

const specification_path = 'JSON_Files/mDL_example_document3.json'
const document = new Document({file:specification_path, extension:"JSON"})

const key = '231f4c4d4d3051fdc2ec0a3851d5b383'
const mac = await document.mac({'alg': 'SHA-256_64'}, {'kid': '11'}, key, '')
const unmac = await Document.decoded_mac(mac, key, '')

console.log(unmac.content)
```

- Calculate a *signature* for the document to ensure its integrity and non-repudiation, using assymetric cryptography. The two keys are encoded in *pem format*, the public key is used to *verify*, and the private key is used to *sign*:

```javascript
import Document from "javascript_valid_gen/DataRepresentation/Document.js";

const specification_path = 'JSON_Files/mDL_example_document3.json'
const document = new Document({file:specification_path, extension:"JSON"})

const signed = await document.sign({'alg': 'ES256'}, {'kid': '11'}, "Test_Files/private.pem", "Andre")
const verified = await Document.decoded_sign(signed, "Test_Files/public.pem", "Andre")
console.log(verified.content)
```

### Generate validator + Validate document  - ***Generator***+***Validator***
* Generate a file to validate documents according to an arbitrary struture.\
In this case *mDL* will be the used as proof-of-work. To validate a driver's license document (*mDL*), the file must be generated. For a more secure/robust way to generate this type of files, firstly, it is verified if the specification follows the accepted schema. After that, the file `validator_example.js` is generated, in order to check if the document is valid. 

Essentially, there are two ways to validate:
1. import the "future" file and execute the `validate_json_file` function with the intended document. In this case, the structure was validated beforehand, returning *True* for valid documents and *False* otherwise;
2. executing as a *script* in *cmd*.

```javascript
import Document from "javascript_valid_gen/DataRepresentation/Document.js";
import Verifier from "javascript_valid_gen/Verifier/Verifier.js";
import {Generator} from "javascript_valid_gen/Generator/Generator.js";

const specification_path = "JSON_Files/mDL_specification_prototype1.json"
const schema_path = "JSON_Files/schema_document3.json"
const target_path = "validator_example.js"

let document = new Document({file:specification_path, extension:"JSON"})
let specification = document.content

let schema = new Document({file:schema_path, extension:"JSON"})
const verifier = new Verifier(schema.content)

if (verifier.verify(specification)) {
    const generator = new Generator(specification, target_path)
    generator.main()
    console.log("File generated")
    console.log()

    let module = await import("./validator_example.js");

    const example_doc_path = "JSON_Files/mDL_example_document3.json"
    const schema_doc_path = "JSON_Files/schema_document3.json"

    document = new Document({file:example_doc_path, extension:"JSON"})
    const document_data = document.content

    const schema_document = new Document({file:schema_doc_path, extension:"JSON"})

    const schema_data = schema_document.content

    const v = new Verifier(schema_data)
    v.verify(document_data)

    if (module.validate_json_file(document_data))
        console.log("Documento Válido");
    else
        console.log("Documento Inválido");

}
else
    console.log("An Error occured")
```

