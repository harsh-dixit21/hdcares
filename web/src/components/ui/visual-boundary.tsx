import { Component, type ReactNode } from 'react';

/** Keep an artwork failure from unmounting the private notes elsewhere on the page. */
export default class VisualBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <section className="visual-fallback" role="status">
      <h2>The visual couldn’t load.</h2>
      <p>You can still use the tools and support resources below.</p>
      <a className="button button-light" href="#next-step">Continue to the tools</a>
    </section>;
    return this.props.children;
  }
}
