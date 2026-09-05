import { FormEvent, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { institution } from '@/config/institution';
import { appRoutes, publicRoutes } from '@/content/routes';
import { usePageSeo } from '@/hooks/use-page-seo';
import { invalidateAuth } from '@/lib/query-sync';
import { useAuthLogin } from '@workspace/api-client-react';
import { ApiError } from '@workspace/api-client-react';

import './login.css';

/** Visuel institutionnel — élèves en classe (PNIGVS). */
const LOGIN_COVER_SRC = '/login/vie-scolaire-classe.png';

function getReturnTo(search: string): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const value = params.get('returnTo');
  if (value && value.startsWith('/')) {
    return value;
  }
  return appRoutes.app;
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  usePageSeo({
    title: 'Connexion PNIGVS',
    description: 'Connexion sécurisée à l\'application métier de la Direction de la Vie Scolaire.',
  });

  const login = useAuthLogin({
    mutation: {
      onSuccess: async () => {
        await invalidateAuth(queryClient);
        navigate(getReturnTo(search));
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          const data = error.data as { error?: { message?: string } } | null;
          setErrorMessage(data?.error?.message ?? 'Identifiants incorrects ou compte non autorisé.');
          return;
        }
        setErrorMessage('Connexion impossible. Vérifiez votre connexion réseau et que l\'API est démarrée.');
      },
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    login.mutate({ data: { email: email.trim(), password } });
  }

  return (
    <div className="login-screen">
      <header className="login-screen-top">
        <Link href={publicRoutes.home} className="login-screen-brand">
          <span className="login-screen-mark" aria-hidden="true" />
          <span>{institution.platform.name} — {institution.direction.shortName}</span>
        </Link>
        <Link href={publicRoutes.espaceAgents} className="login-screen-back">
          Retour à l&apos;espace agents
        </Link>
      </header>

      <div className="login-screen-body">
        <aside className="login-screen-visual" aria-label="Illustration vie scolaire">
          <img
            className="login-screen-photo"
            src={LOGIN_COVER_SRC}
            alt="Élèves en classe — vie scolaire en Côte d'Ivoire"
            loading="eager"
            decoding="async"
          />
          <div className="login-screen-visual-overlay" aria-hidden="true" />
          <div className="login-screen-visual-copy">
            <p className="eyebrow">{institution.platform.name}</p>
            <h1>Espace agents sécurisé</h1>
            <p>{institution.platform.tagline}</p>
          </div>
        </aside>

        <main className="login-screen-panel" id="main-content">
          <div className="login-screen-form-wrap">
            <header>
              <h2>Connexion</h2>
              <p>Utilisez votre email professionnel et votre mot de passe institutionnels.</p>
            </header>

            <form className="login-screen-form" onSubmit={handleSubmit} noValidate>
              <div className="login-screen-field">
                <label htmlFor="login-email">Email professionnel</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={login.isPending}
                  placeholder="prenom.nom@dvs.ci"
                />
              </div>

              <div className="login-screen-field">
                <label htmlFor="login-password">Mot de passe</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={login.isPending}
                  placeholder="Votre mot de passe"
                />
              </div>

              {errorMessage ? (
                <p className="login-screen-error" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              <button type="submit" className="login-screen-submit" disabled={login.isPending}>
                {login.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Connexion en cours…
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <p className="login-screen-note">
              Accès réservé aux agents autorisés par la {institution.direction.shortName}.{' '}
              <Link href={publicRoutes.home}>Portail public</Link>
              {' · '}
              <Link href={publicRoutes.contact}>Assistance</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
