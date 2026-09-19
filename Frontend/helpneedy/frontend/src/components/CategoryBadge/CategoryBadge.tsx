import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { HelpCategory } from '../../types';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

export const categoryConfig: Record<HelpCategory, { label: string; icon: React.ReactElement; color: string; bg: string }> = {
  water: {
    label: 'Drinking Water',
    icon: <WaterDropRoundedIcon fontSize="small" />,
    color: '#0284C7',
    bg: '#E0F2FE',
  },
  food: {
    label: 'Food & Rations',
    icon: <RestaurantRoundedIcon fontSize="small" />,
    color: '#D97706',
    bg: '#FEF3C7',
  },
  medicine: {
    label: 'Medicine',
    icon: <MedicationRoundedIcon fontSize="small" />,
    color: '#9333EA',
    bg: '#F3E8FF',
  },
  medical_assistance: {
    label: 'Medical Aid / Doctor',
    icon: <LocalHospitalRoundedIcon fontSize="small" />,
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  shelter: {
    label: 'Shelter / Accommodation',
    icon: <HomeWorkRoundedIcon fontSize="small" />,
    color: '#4F46E5',
    bg: '#EEF2FF',
  },
  evacuation: {
    label: 'Evacuation & Rescue',
    icon: <DirectionsRunRoundedIcon fontSize="small" />,
    color: '#EA580C',
    bg: '#FFEDD5',
  },
  power: {
    label: 'Power / Charging',
    icon: <BoltRoundedIcon fontSize="small" />,
    color: '#CA8A04',
    bg: '#FEF9C3',
  },
  other: {
    label: 'Other Essential Need',
    icon: <HelpOutlineRoundedIcon fontSize="small" />,
    color: '#475569',
    bg: '#F1F5F9',
  },
};

interface CategoryBadgeProps {
  category: HelpCategory;
  variant?: 'chip' | 'icon-only' | 'card';
  selected?: boolean;
  onClick?: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  variant = 'chip',
  selected = false,
  onClick 
}) => {
  const config = categoryConfig[category] || categoryConfig.other;

  if (variant === 'card') {
    return (
      <Box
        onClick={onClick}
        sx={{
          p: 2,
          borderRadius: 3,
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 1.2,
          border: selected ? `2px solid ${config.color}` : '1.5px solid rgba(226, 232, 240, 0.9)',
          backgroundColor: selected ? config.bg : 'background.paper',
          color: selected ? config.color : 'text.primary',
          boxShadow: selected ? `0 4px 14px ${config.color}33` : 'none',
          transition: 'all 0.2s ease',
          '&:hover': onClick ? {
            borderColor: config.color,
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
          } : {},
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: config.bg,
            color: config.color,
          }}
        >
          {config.icon}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.88rem' }}>
          {config.label}
        </Typography>
      </Box>
    );
  }

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      onClick={onClick}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        border: `1px solid ${config.color}33`,
        '& .MuiChip-icon': { color: `${config.color} !important` },
        '& .MuiChip-label': { px: 0.8 },
      }}
    />
  );
};
