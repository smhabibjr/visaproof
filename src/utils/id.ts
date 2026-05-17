export function makeId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
