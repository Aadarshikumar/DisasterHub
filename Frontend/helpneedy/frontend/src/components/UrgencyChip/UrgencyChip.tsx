import React from 'react';
import { Chip, Box, keyframes } from '@mui/material';
import { UrgencyLevel } from '../../types';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

const pulse = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
`;

interface UrgencyChipProps {
  urgency: UrgencyLevel;
  size?: 'small' | 'medium';
}

export const UrgencyChip: React.FC<UrgencyChipProps> = ({ urgency, size = 'small' }) => {
  if (urgency === 'critical') {
    return (
      <Chip
        icon={<ErrorOutlineRoundedIcon sx={{ fontSize: '1rem !important', color: '#DC2626 !important' }} />}
        label="CRITICAL"
        size={size}
        sx={{
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          fontWeight: 700,
          border: '1px solid #EF4444',
          letterSpacing: '0.04em',
          animation: `${pulse} 2s infinite ease-in-out`,
          '& .MuiChip-label': { px: 1 },
        }}
      />
    );
  }

  if (urgency === 'urgent') {
    return (
      <Chip
        icon={<WarningAmberRoundedIcon sx={{ fontSize: '1rem !important', color: '#D97706 !important' }} />}
        label="URGENT"
        size={size}
        sx={{
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          fontWeight: 700,
          border: '1px solid #F59E0B',
          letterSpacing: '0.03em',
          '& .MuiChip-label': { px: 1 },
        }}
      />
    );
  }

  return (
    <Chip
      icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: '1rem !important', color: '#059669 !important' }} />}
      label="NORMAL"
      size={size}
      sx={{
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        fontWeight: 600,
        border: '1px solid #10B981',
        letterSpacing: '0.02em',
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};
