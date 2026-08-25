import { Component } from 'react';
import { clearAppCaches, recordClientDiagnostic } from './lib/clientDiagnostics.js';

export default class AppErrorBoundary extends Component {
  state = { failed: false, clearing: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    recordClientDiagnostic('react', error);
  }

  async recover() {
    this.setState({ clearing: true });
    await clearAppCaches();
    window.location.reload();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="fatal-error" role="alert">
      <div className="paper-card">
        <span>A2 Prüfungsakte</span>
        <h1>Die App konnte diesen Bereich nicht öffnen.</h1>
        <p>Dein gespeicherter Lernfortschritt bleibt erhalten. Lade die App neu; bei einem veralteten Cache wird er sicher erneuert.</p>
        <button className="primary-button" onClick={() => this.recover()} disabled={this.state.clearing}>{this.state.clearing ? 'Wird neu geladen …' : 'App neu laden'}</button>
      </div>
    </main>;
  }
}
