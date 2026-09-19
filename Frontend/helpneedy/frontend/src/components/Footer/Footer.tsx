import React from 'react';
import { Box, Container, Grid, Typography, Chip, Divider } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';

export const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto', 
        bgcolor: 'background.paper', 
        borderTop: '1px solid', 
        borderColor: 'divider',
        pt: 5,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          
          {/* Col 1: Brand & Mission */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <WarningAmberRoundedIcon sx={{ color: 'error.main', fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                DisasterAid Hub
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
              A hyper-local community crisis relief platform designed to connect people needing emergency aid with nearby volunteers and relief organizations in real-time.
            </Typography>
            <Chip 
              icon={<SecurityRoundedIcon sx={{ fontSize: '1rem !important' }} />}
              label="Location Privacy Protected • Approx 300m" 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          </Grid>

          {/* Col 2: Emergency Helplines */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneInTalkRoundedIcon sx={{ color: 'error.main', fontSize: 20 }} />
              National Emergency Helplines
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>National Emergency Number</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>112</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Disaster Management (NDRF)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>1078</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Ambulance / Medical</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>108 / 102</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Col 3: Principles & Quick Guidelines */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Relief Principles
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              • <strong>Speed First:</strong> No complex logins or social feed distractions during emergencies.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              • <strong>Deterministic Matching:</strong> Proximity + Category matching for immediate dispatch.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              • <strong>Verified Delivery:</strong> Both requester and volunteer confirm fulfillment.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            © 2026 DisasterAid Community Hub. Open Source Relief Coordination Platform.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Built with
            </Typography>
            <FavoriteRoundedIcon sx={{ fontSize: 14, color: 'error.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              for community safety and rapid crisis assistance.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
