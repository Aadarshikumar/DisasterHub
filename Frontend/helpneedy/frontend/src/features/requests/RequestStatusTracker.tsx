import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Typography,
  Paper,
} from '@mui/material';
import { RequestStatus } from '../../types';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#0284C7',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#059669',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
  },
}));

const lifecycleSteps = [
  { label: 'Request Open', desc: 'Broadcasted to nearby responders' },
  { label: 'Helper Matched', desc: 'Volunteer assigned & notified' },
  { label: 'Aid in Transit', desc: 'En route to location' },
  { label: 'Fulfilled', desc: 'Aid delivered successfully' },
];

const getActiveStepIndex = (status: RequestStatus): number => {
  switch (status) {
    case 'OPEN': return 0;
    case 'MATCHED': return 1;
    case 'IN_PROGRESS': return 2;
    case 'FULFILLED': return 4; // all completed
    case 'CANCELLED': return -1;
    default: return 0;
  }
};

interface RequestStatusTrackerProps {
  status: RequestStatus;
}

export const RequestStatusTracker: React.FC<RequestStatusTrackerProps> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2.5, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary' }}>
          <CancelOutlinedIcon />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            This aid request was Cancelled
          </Typography>
        </Box>
      </Paper>
    );
  }

  const activeIndex = getActiveStepIndex(status);

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      <Stepper 
        activeStep={activeIndex} 
        alternativeLabel 
        connector={<CustomConnector />}
      >
        {lifecycleSteps.map((s, idx) => {
          const isCompleted = activeIndex > idx || status === 'FULFILLED';
          const isCurrent = activeIndex === idx && status !== 'FULFILLED';

          return (
            <Step key={s.label} completed={isCompleted}>
              <StepLabel
                slots={{
                  stepIcon: () => (
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isCompleted ? '#059669' : isCurrent ? '#0284C7' : '#E2E8F0',
                        color: isCompleted || isCurrent ? '#FFFFFF' : '#64748B',
                        boxShadow: isCurrent ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {idx === 0 && <RadioButtonCheckedRoundedIcon fontSize="small" />}
                      {idx === 1 && <HourglassTopRoundedIcon fontSize="small" />}
                      {idx === 2 && <LocalShippingRoundedIcon fontSize="small" />}
                      {idx === 3 && <CheckCircleRoundedIcon fontSize="small" />}
                    </Box>
                  )
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: isCurrent || isCompleted ? 700 : 500, fontSize: '0.85rem' }}>
                  {s.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' }, fontSize: '0.72rem' }}>
                  {s.desc}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};
