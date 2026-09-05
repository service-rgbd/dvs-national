type WorkflowStep = {
  step: number;
  actor: string;
  action: string;
};

type PublicWorkflowTimelineProps = {
  steps: WorkflowStep[];
  title?: string;
};

export function PublicWorkflowTimeline({ steps, title }: PublicWorkflowTimelineProps) {
  return (
    <section className="public-workflow" aria-label={title ?? 'Workflow'}>
      {title ? <h2 className="public-section-title">{title}</h2> : null}
      <ol className="public-workflow-track">
        {steps.map((step, index) => (
          <li key={step.step} className="public-workflow-step">
            <span className="public-workflow-marker">{step.step}</span>
            <div className="public-workflow-body">
              <strong>{step.actor}</strong>
              <p>{step.action}</p>
            </div>
            {index < steps.length - 1 ? (
              <span className="public-workflow-connector" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
