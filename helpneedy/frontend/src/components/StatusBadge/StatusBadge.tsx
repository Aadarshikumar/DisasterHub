import React from 'react';
import { Chip } from '@mui/material';
import { RequestStatus } from '../../types';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  switch (status) {
    case 'OPEN':
      return (
        <Chip
          icon={<RadioButtonCheckedRoundedIcon sx={{ fontSize: '0.95rem !important', color: '#0284C7 !important' }} />}
          label="OPEN • SEARCHING"
          size={size}
          sx={{
            backgroundColor: '#E0F2FE',
            color: '#0369A1',
            fontWeight: 700,
            border: '1px solid #7DD3FC',
            fontSize: '0.75rem',
          }}
        />
      );

    case 'MATCHED':
      return (
        <Chip
          icon={<HourglassTopRoundedIcon sx={{ fontSize: '0.95rem !important', color: '#7C3AED !important' }} />}
          label="VOLUNTEER MATCHED"
          size={size}
          sx={{
            backgroundColor: '#EDE9FE',
            color: '#6D28D9',
            fontWeight: 700,
            border: '1px solid #C4B5FD',
            fontSize: '0.75rem',
          }}
        />
      );

    case 'IN_PROGRESS':
      return (
        <Chip
          icon={<LocalShippingRoundedIcon sx={{ fontSize: '0.95rem !important', color: '#D97706 !important' }} />}
          label="IN PROGRESS / TRANSIT"
          size={size}
          sx={{
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            fontWeight: 700,
            border: '1px solid #FCD34D',
            fontSize: '0.75rem',
          }}
        />
      );

    case 'FULFILLED':
      return (
        <Chip
          icon={<CheckCircleRoundedIcon sx={{ fontSize: '0.95rem !important', color: '#059669 !important' }} />}
          label="FULFILLED"
          size={size}
          sx={{
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            fontWeight: 700,
            border: '1px solid #6EE7B7',
            fontSize: '0.75rem',
          }}
        />
      );

    case 'CANCELLED':
      return (
        <Chip
          icon={<CancelOutlinedIcon sx={{ fontSize: '0.95rem !important', color: '#64748B !important' }} />}
          label="CANCELLED"
          size={size}
          sx={{
            backgroundColor: '#F1F5F9',
            color: '#475569',
            fontWeight: 600,
            border: '1px solid #CBD5E1',
            fontSize: '0.75rem',
          }}
        />
      );

    default:
      return (
        <Chip
          label={status}
          size={size}
          sx={{ fontWeight: 600 }}
        />
      );
  }
};
