# @jpravetz/ask

Interactive command-line prompts for Deno.

This module is not maintained for others to use. It is a fork of [@sallai/ask](https://github.com/jozsefsallai/ask) and I suggest you use that repo. See [Changelog](./CHANGELOG.md) for differences.

![Demo](.github/assets/demo.gif)

## Description

`ask` is a slick Deno module that allows you to create interactive command-line
applications, similar to what you'd achieve with
[inquirer](https://www.npmjs.com/package/inquirer) in Node.js.

## Overview

- **Supported prompts:**
  - `input` (plain text)
  - `number` (integer or float)
  - `password` (hidden/masked input)
  - `confirm` (yes/no)
  - `editor` (open an editor to write longer text)
  - `select` (pick one item from a list)
  - `checkbox` (pick multiple items from a list)
- Elegant output.
- Familiar, inquirer-like syntax.
- Easily configurable.
- Strong type-safety.

## Basic Usage

First, install the package from JSR:

```sh
deno add jsr:@jpravetz/ask
```

Then just create an `Ask` instance and use the `prompt()` method to enumerate
your questions.

```ts
import * as Ask from "@jpravetz/ask";

const ask = new Ask.Main({ prefix: '', indent: 8 }); // global options are also supported!

const answers = await ask.prompt(
  [
    {
      name: "name",
      type: "input",
      message: "Name:",
    },
    {
      name: "age",
      type: "number",
      message: "Age:",
    },
  ] as const,
);

console.log(answers); // { name: "Joe", age: 19 }
```

You can also just ask a single question:

```ts
const { name } = await ask.input(
  {
    name: "name",
    message: "Name:",
  } as const,
);

console.log(name); // Joe
```

> **Note:** The `as const` assertion is necessary to ensure that the `name`
> property is not widened to `string`. This is necessary for the type-checking
> to work properly.

## Documentation and API

Please visit the [JSR documentation page][docs] for more information on how to
use the library.

## Object Relationships

```mermaid
classDiagram
  class Ask {
    +constructor(opts: GlobalPromptOpts)
    +prompt(prompts: PromptOpts[]): Promise<any>
  }

  class Prompt {
    <<abstract>>
    #name: string
    #type: PromptType
    #message: string
    #default: any
    #input: Reader & ReaderSync & Closer
    #output: Writer & WriterSync & Closer
    +constructor(opts: PromptOpts)
    +run(): Promise<any>
  }

  class TextPrompt {
    <<abstract>>
    #hidden: boolean
    #mask: string
    +constructor(opts: TextOpts)
  }

  class ListPrompt {
    <<abstract>>
    #choices: Choice[]
    #multiple: boolean
    +constructor(opts: ListOpts)
  }

  class InputPrompt {
    +constructor(opts: InputOpts)
  }

  class NumberPrompt {
    +constructor(opts: NumberOpts)
  }

  class ConfirmPrompt {
    +constructor(opts: ConfirmOpts)
  }

  class PasswordPrompt {
    +constructor(opts: PasswordOpts)
  }

  class EditorPrompt {
    +constructor(opts: EditorOpts)
  }

  class SelectPrompt {
    +constructor(opts: SelectOpts)
  }

  class CheckboxPrompt {
    +constructor(opts: CheckboxOpts)
  }

  class ListItem {
    +message: string
    +disabled: boolean
    +selected: boolean
    +active: boolean
  }

  class Separator {
    +constructor(message?: string)
  }

  Ask --> Prompt
  Prompt <|-- TextPrompt
  Prompt <|-- ListPrompt
  TextPrompt <|-- InputPrompt
  TextPrompt <|-- NumberPrompt
  TextPrompt <|-- ConfirmPrompt
  TextPrompt <|-- PasswordPrompt
  TextPrompt <|-- EditorPrompt
  ListPrompt <|-- SelectPrompt
  ListPrompt <|-- CheckboxPrompt
  ListPrompt o-- ListItem
  ListItem <|-- Separator
```

## License

MIT.

[docs]: https://jsr.io/@sallai/ask/doc