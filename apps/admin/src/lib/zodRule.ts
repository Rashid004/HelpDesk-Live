import type { Rule } from "antd/es/form";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Form validation approach — antd Form + a thin Zod bridge           */
/*  ---------------------------------------------------------------    */
/*  We keep @repo/shared's Zod schemas as the single source of truth   */
/*  and drive antd's Form validation from them, rather than pulling    */
/*  react-hook-form into this app. antd's <Form> already owns layout,  */
/*  field state and submit here, so a per-field custom validator that  */
/*  runs the matching Zod schema gives us shared rules without a       */
/*  second form runtime. Cross-field rules (e.g. resolutionNote        */
/*  required when status === "resolved") are validated by running the  */
/*  whole object schema on submit — see TicketForm.                    */
/* ------------------------------------------------------------------ */

/** Build an antd Rule from a standalone Zod field schema. */
export function zodFieldRule(schema: z.ZodType): Rule {
  return {
    validator(_rule, value) {
      const result = schema.safeParse(value);
      if (result.success) return Promise.resolve();
      const msg = result.error.issues[0]?.message ?? "Invalid value";
      return Promise.reject(new Error(msg));
    },
  };
}

/** Convenience: pull one field's schema out of a Zod object and rule it. */
export function zodRule<T extends z.ZodRawShape>(
  objectSchema: z.ZodObject<T>,
  key: keyof T & string,
): Rule {
  return zodFieldRule(objectSchema.shape[key] as unknown as z.ZodType);
}
