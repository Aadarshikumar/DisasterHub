import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { HelpCategory } from '../../types';
import { categoryConfig } from '../CategoryBadge/CategoryBadge';

interface SOSModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (tab: string, requestId?: string) => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ open, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { createRequest } = useRequests();

  const [category, setCategory] = useState<HelpCategory>('medical_assistance');
  const [address, setAddress] = useState<string>(currentUser.location?.address || 'Current Location');
  const [landmark, setLandmark] = useState<string>('Near Main Road');
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [notes, setNotes] = useState<string>('Immediate assistance needed - trapped/critical emergency.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleQuickSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await createRequest({
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterPhone: currentUser.phone,
        category,
        title: `EMERGENCY SOS: ${categoryConfig[category]?.label || 'Medical'} Required`,
        description: notes,
        urgency: 'critical',
        location: {
          latitude: currentUser.location?.latitude || 28.6139,
          longitude: currentUser.location?.longitude || 77.2090,
          address,
          landmark,
          city: currentUser.location?.city || 'New Delhi',
        },
        locationVisibility: 'helper_precise',
        peopleCount,
      });

      onClose();
      onSuccess('my-requests', created.id);
    } catch (e) {
      console.error('SOS Submit failed', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, border: '2px solid #DC2626' }
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'rgba(220, 38, 38, 0.08)', pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'error.main',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 1.5s infinite',
            }}
          >
            <WarningAmberRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main' }}>
              EMERGENCY SOS BROADCAST
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Instant alert dispatched with CRITICAL priority to all active responders
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="error" sx={{ mb: 2.5, fontWeight: 600 }}>
          Use this only for life-threatening emergencies, serious injuries, or urgent rescue needs.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Emergency Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as HelpCategory)}
            >
              <MenuItem value="medical_assistance">Medical Aid / Doctor</MenuItem>
              <MenuItem value="evacuation">Evacuation & Rescue</MenuItem>
              <MenuItem value="water">Drinking Water</MenuItem>
              <MenuItem value="food">Food Rations</MenuItem>
              <MenuItem value="shelter">Emergency Shelter</MenuItem>
              <MenuItem value="medicine">Urgent Medicine</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="number"
              fullWidth
              label="People in Danger"
              value={peopleCount}
              onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Your Exact Location / Building"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 2nd Floor, House 12, Riverview Enclave"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Landmark (High Visibility)"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Big Water Tank / Metro Pillar 45"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Brief Situation / Medical Condition"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: 'background.default' }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleQuickSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <WarningAmberRoundedIcon />}
          sx={{ fontWeight: 800, px: 3 }}
        >
          {isSubmitting ? 'Dispatching SOS...' : 'BROADCAST SOS NOW'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
