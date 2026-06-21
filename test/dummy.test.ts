import { InterruptedError } from '$errors';
import { assertThrows } from '@std/assert';

Deno.test('Errors', async (t) => {
  await t.step('InterruptedError', () => {
    assertThrows(
      () => {
        throw new InterruptedError();
      },
      InterruptedError,
      "Prompt interrupted by user (Ctrl+C)."
    );
  });
});