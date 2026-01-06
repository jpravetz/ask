## @jpravetz/ask

Interactive command-line prompts for Deno. Fork of @sallai/ask with enhanced multi-selection features.

### Key Features

- **Enhanced Checkbox Selection**: 
  - CTRL-A for select/deselect all
  - SHIFT-SPACE for range selection
  - Standard SPACE for individual toggle
- **Multiple prompt types**: input, number, confirm, password, select, checkbox, inlineCheckbox, editor
- **Type-safe**: Strong TypeScript support
- **Customizable**: Formatters, prefixes, columns, etc.

### Basic Usage

```typescript
import { Main as Ask } from '@jpravetz/ask';

const ask = new Ask();
const result = await ask.checkbox({
  name: 'features',
  message: 'Select features:',
  choices: [
    { message: 'Feature A', value: 'a' },
    { message: 'Feature B', value: 'b' },
  ],
});
```

### Architecture

- `src/ask.ts`: Main Ask class
- `src/prompt/`: Individual prompt implementations
- `src/io/`: Input/output handling and key processing
- `src/list/`: List item and separator classes

See README.md for complete documentation.