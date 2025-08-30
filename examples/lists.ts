import iro, { cyan, gray } from "@sallai/iro";
import * as Ask from "../mod.ts";

const indent = " ".repeat(8);

const ask = new Ask.Ask({ prefix: "\n" + " ".repeat(6), suffix: "\n" });

const listFormatters = {
  activeFormatter: (message: string): string => {
    return iro(`${indent}● ${message}`, cyan);
  },
  inactiveFormatter: (message: string): string => {
    return `${indent}  ${message}`;
  },
  disabledFormatter: (message: string): string => {
    return iro(`${indent}- ${message} (disabled)`, gray);
  },
};

const result = await ask.select(
  {
    name: "letter",
    type: "select",
    message: "Select your favorite letter",
    useNumbers: true,
    choices: [
      { message: "A", value: "a" },
      { message: "B", value: "b" },
      { message: "C", value: "c" },
    ],
    ...listFormatters,
  },
);
const result2 = await ask.checkbox(
  {
    name: "colors",
    type: "checkbox",
    message: "Select your favorite colors",
    choices: [
      { message: "Red", value: "red" },
      { message: "Green", value: "green" },
      { message: "Blue", value: "blue" },
    ],
    defaultValues: ["green", "blue"],
    ...listFormatters,
  },
);

console.log(result);
console.log(result2);
