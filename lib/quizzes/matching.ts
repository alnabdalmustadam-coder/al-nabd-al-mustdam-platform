export type MatchingEndpoint = { side: 'prompt' | 'option'; index: number };

export function connectMatchingEndpoints(
  selections: readonly number[],
  optionCount: number,
  source: MatchingEndpoint,
  target: MatchingEndpoint,
): number[] | null {
  if (source.side === target.side) return null;
  const promptIndex = source.side === 'prompt' ? source.index : target.index;
  const optionIndex = source.side === 'option' ? source.index : target.index;
  if (!Number.isInteger(promptIndex) || promptIndex < 0 || promptIndex >= selections.length
    || !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= optionCount) return null;

  // Moving either end releases its old partner. Every answer belongs to one
  // prompt, including when reconnecting a restored draft.
  const next = selections.map((value) => value === optionIndex ? -1 : value);
  next[promptIndex] = optionIndex;
  return next;
}

export function disconnectMatchingEndpoint(selections: readonly number[], endpoint: MatchingEndpoint): number[] {
  return selections.map((value, index) => (
    endpoint.side === 'prompt' ? index === endpoint.index : value === endpoint.index
  ) ? -1 : value);
}
