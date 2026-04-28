'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { login, loginWithGoogle, saveTokens } from '@/lib/api/client';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
      locale?: string;
    }
  ) => void;
};

type GoogleGlobal = {
  accounts: {
    id: GoogleAccountsId;
  };
};

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const t = useTranslations('auth.login');
  const commonT = useTranslations('common');
  const googleContainerRef = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    let cancelled = false;

    const onCredential = async (response: GoogleCredentialResponse): Promise<void> => {
      if (!response.credential) {
        setErrorMessage('Google login did not return a credential.');
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const tokens = await loginWithGoogle(response.credential);
        saveTokens(tokens);
        router.push('/dashboard');
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Unable to login with Google.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const renderGoogleButton = (): void => {
      if (cancelled || !window.google || !googleContainerRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          void onCredential(response);
        },
      });

      googleContainerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 280,
        locale: 'en',
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-google-identity='true']"
    );
    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton);
      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', renderGoogleButton);
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', renderGoogleButton);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener('load', renderGoogleButton);
    };
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const tokens = await login(email, password);
      saveTokens(tokens);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasGoogleClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(192, 57, 43, 0.05) 0%, rgba(41, 128, 185, 0.05) 100%)',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            {t('title')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('noAccount')}{' '}
            <Link href="/register" passHref legacyBehavior>
              <MuiLink component="a" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                {t('register')}
              </MuiLink>
            </Link>
          </Typography>
        </Box>

        {/* Error Alert */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Email/Password Form */}
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2.5, mb: 3 }}>
          <TextField
            fullWidth
            type="email"
            label={t('email')}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
            variant="outlined"
          />

          <TextField
            fullWidth
            type="password"
            label={t('password')}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
            variant="outlined"
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isSubmitting}
            size="large"
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A93226 0%, #C0392B 100%)',
              },
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                Signing in...
              </>
            ) : (
              t('signInButton')
            )}
          </Button>
        </Box>

        {/* Divider */}
        {hasGoogleClientId && (
          <>
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="textSecondary">
                or
              </Typography>
            </Divider>

            {/* Google OAuth Button */}
            <Box
              ref={googleContainerRef}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2,
                '& > div': {
                  width: '100%',
                },
              }}
            />
          </>
        )}

        {/* Google Disabled Notice */}
        {!hasGoogleClientId && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Google Sign-In is disabled. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.
          </Alert>
        )}
      </Paper>
    </Container>
  );
}

