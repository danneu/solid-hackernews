export function extractDomain(url: string): string {
  const domain = URL.canParse(url)
    ? new URL(url).hostname.replace(/^www\./, "")
    : null;
  if (!domain) {
    // client error
    console.warn(`[extractDomain] could not extract domain from "${url}"`);
  }
  return domain ?? "--";
}

export function isElementInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Useful helper for <Show> and <Match> for type narrowing after a boolean check
export function match<A, B>(
  value: A,
  when: (value: A) => false | B
): false | B {
  return when(value);
}
