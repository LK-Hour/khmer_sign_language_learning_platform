'use client';

import React from 'react';
import { TextField, TextFieldProps, FormHelperText, Box } from '@mui/material';

export interface FormFieldProps extends Omit<TextFieldProps, 'helperText'> {
  error?: boolean;
  errorMessage?: string;
  helperMessage?: string;
}

/**
 * Reusable form field component built on MUI TextField
 * Handles error states and helper text consistently
 */
export function FormField({
  error = false,
  errorMessage,
  helperMessage,
  required,
  ...props
}: FormFieldProps): JSX.Element {
  const hasError = error || !!errorMessage;
  const displayText = errorMessage || helperMessage;

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        {...props}
        required={required}
        error={hasError}
        fullWidth
        variant="outlined"
        size="medium"
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: hasError ? 'error.main' : 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: hasError ? 'error.main' : 'primary.main',
              boxShadow: `0 0 0 3px ${hasError ? 'rgba(211, 47, 47, 0.1)' : 'rgba(192, 57, 43, 0.1)'}`,
            },
          },
          ...props.sx,
        }}
      />
      {displayText && (
        <FormHelperText error={hasError}>
          {displayText}
        </FormHelperText>
      )}
    </Box>
  );
}
