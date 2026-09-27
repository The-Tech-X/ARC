/**
 * Shared by the server-rendered layout and the client IntroProvider, so it
 * deliberately lives in a module with no "use client" directive.
 *
 * It used to be exported from IntroProvider.tsx. When a server component
 * imports a plain constant from a client module, Next hands back a client
 * reference rather than the value — the constant read as `undefined` on the
 * server and the inline script shipped as
 * `sessionStorage.getItem(undefined)`, which silently disabled the whole
 * intro-skip. Keep this here.
 */
export const INTRO_SESSION_KEY = "arc:intro-played";
