import { createFeedbackHandler } from './handler.mjs';
Deno.serve(createFeedbackHandler({env:(name:string) => Deno.env.get(name)}));
