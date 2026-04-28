'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Container, Box, Paper, TextField, Button, Alert, CircularProgress, Typography, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';

import { register, saveTokens } from '@/lib/api/client';

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const t = useTranslations('auth.register');
  const tc = useTranslations('common');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPasswordError(null);
    setErrorMessage(null);

    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError(t('passwordMismatch'));
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setPasswordError(t('passwordTooShort'));
      return;
    }

    setIsSubmitting(true);
    try {
      const tokens = await register(email, password, displayName);
      saveTokens(tokens);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t('errorMessage'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          p: 4,
          background: 'linear-gradient(135deg, rgba(192, 57, 43, 0.05) 0%, rgba(41, 128, 185, 0.05) 100%)',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('subtitle')}
          </Typography>
        </Box>

        {/* Error Alert */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Register Form */}
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Display Name */}
          <TextField
            label={t('displayName')}
            type="text"
            placeholder={t('displayNamePlaceholder')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            fullWidth
            variant="outlined"
            size="medium"
          />

          {/* Email */}
          <TextField
            label={t('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
            size="medium"
          />

          {/* Password */}
          <TextField
            label={t('password')}
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
            size="medium"
            helperText={t('passwordHelper')}
          />

          {/* Confirm Password */}
          <TextField
            label={t('confirmPassword')}
            type="password"
            placeholder={t('confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
            size="medium"
            error={passwordError !== null}
            helperText={passwordError || ''}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A93226 0%, #C0392B 100%)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #BDC3C7 0%, #95A5A6 100%)',
              },
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>{t('creatingAccount')}</span>
              </Box>
            ) : (
              t('createAccountButton')
            )}
          </Button>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>or</Divider>

        {/* Sign In Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            {t('haveAccount')}{' '}
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {t('signInLink')}
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
