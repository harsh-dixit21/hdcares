export function matchesFaq(question: string, answer: string, query: string): boolean {
  const text = `${question} ${answer}`.toLowerCase();
  return query.toLowerCase().trim().split(/\s+/).every(word => text.includes(word));
}
