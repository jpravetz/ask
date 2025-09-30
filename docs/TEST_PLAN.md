# Test Plan

This document provides instructions for manually testing the `@jpravetz/ask` library using the examples provided in the `./examples` folder.

## Testing Environment

All tests should be run in a terminal that supports ANSI escape codes.

## Running Examples

To run an example, use the following command, replacing `<example_name.ts>` with the name of the example file you want to run:

```bash
deno run -A examples/<example_name.ts>
```

## Test Cases

Run the interactive test suite:

```bash
deno run -A examples/test.ts
```

Follow the on-screen instructions to test the different prompt types. The test suite will guide you through the verification process and provide a summary of the results at the end.

## Unit Tests

At this time, there are no unit tests for the prompt interactions, as they require a TTY environment to run. Future work may involve creating a mock TTY to allow for automated testing of these features.
