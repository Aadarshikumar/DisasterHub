import React, { useState } from 'react';
import {
  Card,
  Typography,
  Box,
  Grid,
  Button,
  FormControlLabel,
  Switch,
  Slider,
  TextField,
  Divider,
  Alert,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { HelpCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { CategoryBadge } from '../../components/CategoryBadge/CategoryBadge';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

const allCategories: HelpCategory[] = [
  'water',
  'food',
  'medicine',
  'medical_assistance',
  'shelter',
  'evacuation',
  'power',
  'other',
];

const radiusMarks = [
  { value: 1, label: '1 km' },
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
];

interface CreateOfferFormProps {
  onOfferActivated?: () => void;
}

export const CreateOfferForm: React.FC<CreateOfferFormProps> = ({ onOfferActivated }) => {
  const { currentUser } = useAuth();
  const { createOffer } = useRequests();

  const [selectedCategories, setSelectedCategories] = useState<HelpCategory[]>(['water', 'food', 'power']);
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(5);
  const [isAvailableNow, setIsAvailableNow] = useState<boolean>(true);
  const [availableUntil, setAvailableUntil] = useState<string>('10:00 PM');
  const [description, setDescription] = useState<string>(
    'Have a 4x4 pickup truck with drinking water cartons, dry rations, and high-capacity portable charging stations.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleCategory = (cat: HelpCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleActivateOffer = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one aid capability you can provide.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createOffer({
        volunteerId: currentUser.id,
        volunteerName: currentUser.name,
        volunteerPhone: currentUser.phone,
        categories: selectedCategories,
        description,
        location: {
          latitude: currentUser.location?.latitude || 28.6150,
          longitude: currentUser.location?.longitude || 77.2100,
          address: currentUser.location?.address || 'Connaught Place',
          city: currentUser.location?.city || 'New Delhi',
        },
        serviceRadiusKm,
        isAvailableNow,
        availableUntil,
      });

      onOfferActivated?.();
    } catch (e) {
      console.error('Failed to create offer', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: 'success.light',
            color: 'success.dark',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <VolunteerActivismRoundedIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            I Can Help — Volunteer Offer
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Register your capabilities and service radius to automatically match with nearby requests.
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Step 1: Capabilities Selection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          1. What aid can you provide? (Select all that apply)
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          You will receive matched notifications for these specific needs.
        </Typography>

        <Grid container spacing={1.5}>
          {allCategories.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={cat}>
                <CategoryBadge
                  category={cat}
                  variant="card"
                  selected={isSelected}
                  onClick={() => toggleCategory(cat)}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Step 2: Service Radius */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            2. Maximum Service Travel Radius
          </Typography>
          <Chip
            icon={<NearMeRoundedIcon sx={{ fontSize: '1rem !important' }} />}
            label={`Within ${serviceRadiusKm} km`}
            color="primary"
            sx={{ fontWeight: 700 }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          How far are you able to travel by foot, boat, or vehicle during this crisis?
        </Typography>

        <Box sx={{ px: 2, pt: 1 }}>
          <Slider
            value={serviceRadiusKm}
            min={1}
            max={25}
            step={null}
            marks={radiusMarks}
            onChange={(_, val) => setServiceRadiusKm(val as number)}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>

      {/* Step 3: Availability Settings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          3. Availability Status
        </Typography>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.default' }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAvailableNow}
                    onChange={(e) => setIsAvailableNow(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {isAvailableNow ? 'Available Right Now' : 'Currently Standby / Off-Duty'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {isAvailableNow ? 'Ready to accept incoming requests immediately' : 'Temporarily not accepting dispatches'}
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Available Until (Time/Shift)"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                placeholder="e.g. 10:00 PM or Overnight"
                slotProps={{
                  input: {
                    startAdornment: <AccessTimeRoundedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Step 4: Equipment / Notes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          4. Resources, Vehicle & Capabilities Description
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. High clearance SUV, first aid kit, generator, can carry up to 4 passengers."
        />
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        Your volunteer profile will immediately calculate matching scores (+50 category, +30 proximity) for all open requests in your radius.
      </Alert>

      <Button
        variant="contained"
        color="success"
        size="large"
        fullWidth
        disabled={isSubmitting || selectedCategories.length === 0}
        onClick={handleActivateOffer}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleRoundedIcon />}
        sx={{ py: 1.4, fontWeight: 800, fontSize: '1rem' }}
      >
        {isSubmitting ? 'Activating Offer...' : 'ACTIVATE VOLUNTEER AID OFFER'}
      </Button>
    </Card>
  );
};
