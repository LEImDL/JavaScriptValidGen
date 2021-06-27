# JavaScriptValidGen - More than a JavaScript parser!

A fantastic Python tool to parse and automate the generation of validation functions, as well as enconde and decode to/from an arbitrary data structure.

## Features

- Parse documents
- Generate validation functions
- Encode and Decode data


## Execution example

```javascript
function test_gen(specification_path, schema_path, target_path) {
    const document = new Document({file:specification_path, extension:"JSON"})
    const specification = document.content

    const schema = new Document({file:schema_path, extension:"JSON"})
    const verifier = new Verifier(schema.content)

    const valid = verifier.verify(specification)
    console.log(valid)
    if (valid) {
        const generator = new Generator(specification, target_path)

        generator.main()
        console.log("File generated")
    }
    else {
        console.log("Ficheiro não cumpre esquema")
    }
}

test_gen('JSON_Files/mDL_specification_prototype.json', 'JSON_Files/standard_format_prototype.json', 'validator_example.js')
```
