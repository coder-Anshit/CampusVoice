import React from "react";

export default class MobileFeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep reporting integration optional; production can wire this to Sentry/etc.
    console.error("Mobile feature failed to render", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="cv-mobile-page cv-mobile-feature-error" role="alert">
        <div className="cv-mobile-feature-error__card">
          <p className="cv-mobile-feature-error__eyebrow">Something went wrong</p>
          <h2>We couldn't load this section.</h2>
          <p>Please try again. Your existing CampusVoice data is unchanged.</p>
          <button type="button" onClick={this.handleRetry}>
            Try again
          </button>
        </div>
      </section>
    );
  }
}
