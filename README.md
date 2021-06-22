# JavaScriptValidGen - More than a JavaScript parser!

A fantastic Python tool to parse and automate the generation of validation functions, as well as enconde and decode to/from an arbitrary data structure.

## Features

- Parse documents
- Generate validation functions
- Encode and Decode data


## Execution example

```javascript
import Document from "../DataRepresentation/Document.js";
const json = new Document({file:'.\\JSON_Files\\mDL_specification_prototype.json'})
let gen = new Generator(json.content, "Try.js")

gen.main()
```
