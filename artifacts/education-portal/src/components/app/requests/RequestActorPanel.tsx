import { ArrowRight, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { Link } from 'wouter';
import type { AppDashboardProfile } from '@workspace/api-client-react';

import {
  getRequestActorConfig,
  getWorkflowStepsForActor,
} from '@/config/request-permissions';

type RequestActorPanelProps = {
  profile: AppDashboardProfile;
};

export function RequestActorPanel({ profile }: RequestActorPanelProps) {
  const config = getRequestActorConfig(profile);
  const steps = getWorkflowStepsForActor(config.kind);

  return (
    <div className="request-actor-panel">
      <header className="request-actor-panel-head">
        <p className="request-actor-panel-eyebrow">{config.eyebrow}</p>
        <h3 className="request-actor-panel-title">{config.heading}</h3>
        <p className="request-actor-panel-desc">{config.description}</p>
      </header>

      <section className="request-actor-capabilities" aria-labelledby="request-capabilities-heading">
        <h4 id="request-capabilities-heading">Vos droits sur ce module</h4>
        <ul>
          {config.capabilities.map((capability) => (
            <li
              key={capability.id}
              className={
                capability.allowed
                  ? 'request-actor-capability is-allowed'
                  : 'request-actor-capability is-denied'
              }
            >
              {capability.allowed ? (
                <CheckCircle2 size={15} aria-hidden="true" />
              ) : (
                <XCircle size={15} aria-hidden="true" />
              )}
              <span>{capability.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="request-actor-workflow" aria-labelledby="request-workflow-heading">
        <h4 id="request-workflow-heading">Circuit officiel</h4>
        <ol>
          {steps.map((step) => (
            <li key={step.step} className={step.isActorStep ? 'is-current-actor' : undefined}>
              <span className="request-actor-workflow-step" aria-hidden="true">
                {step.isActorStep ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              </span>
              <div>
                <strong>{step.actor}</strong>
                <span>{step.action}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="request-actor-panel-actions">
        {config.primaryFilter ? (
          <Link href={config.primaryFilter.href} className="request-actor-panel-link">
            {config.primaryFilter.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : null}
        {config.cta ? (
          <Link
            href={config.cta.href}
            className={
              config.kind === 'establishment'
                ? 'request-actor-panel-cta'
                : 'request-actor-panel-link request-actor-panel-link--secondary'
            }
          >
            {config.cta.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : null}
      </footer>
    </div>
  );
}
