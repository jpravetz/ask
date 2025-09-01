## Gemini bugs to fix:

- typing ESC key while on an input prompt should behave the same as it does for other prompts (and not be written to the console, as it is now)
- For lists, insert a blank line between a prompt heading and it's list items.

### Example 1

This, which is from [all_prompts.ts](./examples/all_prompts.ts):

```bash
               Select the days of the week
                 ○ Monday   ❯ ○ Tuesday    ○ Wednesday
                 ○ Thursday   ○ Friday     ○ Saturday 
                 ○ Sunday   
```

Should be presented as follows (with the extra blank line and colon):

```bash
               Select the days of the week:

                 ○ Monday   ❯ ○ Tuesday    ○ Wednesday
                 ○ Thursday   ○ Friday     ○ Saturday 
                 ○ Sunday   
```

### Example 2

This:

```bash
               Select your favorite letter
               ❯ 1. A  
                 2. B  
                 3. C  
```

Should be this:

```bash
               Select your favorite letter:

               ❯ 1. A  
                 2. B  
                 3. C  
```

- For example 2, when you make a selection (by typing a number or typing RETURN), the display should show the letter selected. This output is not added to the output, it is in place of the output.

```bash
               Select your favorite letter: B

               Select the days of the week:

               ❯ ○ Monday     ○ Tuesday    ○ Wednesday
                 ○ Thursday   ○ Friday     ○ Saturday 
                 ○ Sunday   
```

- Continuing with the all_prompts.ts output, after selecting day of the week the output is currently:

```bash
               Select your favorite letter

               Select the days of the week

               Select the days of the week
               What is your name? (John Doe)
```

But it should be as follows. Note that 'John Doe' is the defaultValue that is provided to the prompt, which we need to support for input prompts as well as list prompts The user's cursor will be at the end of this line. Typing RETURN or ESC will confirm this value, leaving it unchanged.

```bash
               Select your favorite letter: B

               Select the days of the week: Monday, Thursday

               What is your name?: John Doe
```

Number and password prompts should also show a colon, followed by a space. Numbers would then show the defaultValue. Passwords cannot have a defaultValue. Confirm prompt behaviour is ESC is false, RETURN is true.





