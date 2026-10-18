// Opens the help modal (HelpButton) from anywhere, e.g. the notice under the
// chat input, optionally pre-filled with a search query.
export const OPEN_HELP_EVENT = "astronomia:open-help";

export function openHelp(query = "") {
  window.dispatchEvent(new CustomEvent<string>(OPEN_HELP_EVENT, { detail: query }));
}
