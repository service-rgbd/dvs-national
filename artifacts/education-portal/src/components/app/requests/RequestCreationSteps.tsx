import { ArrowRight, CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { Link } from 'wouter';

import { appRoutes } from '@/content/routes';

type RequestCreationStepsProps = {
  hasActivities: boolean;
};

type StepState = 'done' | 'current' | 'upcoming';

function stepState(stepId: string, hasActivities: boolean): StepState {
  if (stepId === 'activity') return hasActivities ? 'done' : 'current';
  if (stepId === 'draft') {
    if (!hasActivities) return 'upcoming';
    return 'current';
  }
  return 'upcoming';
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') return <CheckCircle2 size={18} aria-hidden="true" />;
  if (state === 'current') return <CircleDot size={18} aria-hidden="true" />;
  return <Circle size={18} aria-hidden="true" />;
}

export function RequestCreationSteps({ hasActivities }: RequestCreationStepsProps) {
  const steps = [
    {
      id: 'activity',
      label: 'Activité scolaire',
      detail: 'Décrire la sortie (titre, type, lieu)',
      href: appRoutes.activities,
      cta: hasActivities ? 'Modifier' : 'Créer',
    },
    {
      id: 'draft',
      label: 'Dossier brouillon',
      detail: 'Lier l’activité et enregistrer le dossier',
      href: undefined,
      cta: undefined,
    },
    {
      id: 'submit',
      label: 'Soumission DREN',
      detail: 'Checklist Voyage Découverte puis envoi',
      href: undefined,
      cta: undefined,
    },
    {
      id: 'circuit',
      label: 'Décision DVS',
      detail: 'DREN instruit, DVS valide ou renvoie',
      href: undefined,
      cta: undefined,
    },
  ] as const;

  return (
    <section className="request-steps" aria-labelledby="request-steps-heading">
      <div className="request-steps-head">
        <h2 id="request-steps-heading">Comment créer une demande</h2>
        <p>Quatre étapes — vous êtes guidé automatiquement selon votre avancement.</p>
      </div>

      <ol className="request-steps-list">
        {steps.map((step, index) => {
          const state = stepState(step.id, hasActivities);
          return (
            <li
              key={step.id}
              className={`request-steps-item request-steps-item--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="request-steps-marker" aria-hidden="true">
                <StepIcon state={state} />
                <span className="request-steps-num">{index + 1}</span>
              </span>
              <div className="request-steps-copy">
                <strong>{step.label}</strong>
                <span>{step.detail}</span>
              </div>
              {step.href && state !== 'upcoming' ? (
                <Link href={step.href} className="request-steps-link">
                  {step.cta}
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
