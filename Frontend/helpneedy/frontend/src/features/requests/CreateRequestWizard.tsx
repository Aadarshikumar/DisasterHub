import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Radio,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Alert,
  InputAdornment,
  CircularProgress,
  LinearProgress,
  Switch,
} from '@mui/material';
import { HelpCategory, UrgencyLevel, LocationVisibility } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { CategoryBadge, categoryConfig } from '../../components/CategoryBadge/CategoryBadge';
import { UrgencyChip } from '../../components/UrgencyChip/UrgencyChip';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';

const steps = [
  'Select Aid Category',
  'Urgency Level',
  'Location & Privacy',
  'Details & Contact',
  'Review & Submit',
];

interface CreateRequestWizardProps {
  initialUrgency?: UrgencyLevel;
  onSuccessNavigate?: (tab: string, requestId?: string) => void;
}

export const CreateRequestWizard: React.FC<CreateRequestWizardProps> = ({ 
  initialUrgency, 
  onSuccessNavigate 
}) => {
  const { currentUser } = useAuth();
  const { createRequest } = useRequests();

  // Wizard Step State (0 to 4)
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  // Form Field State
  const [category, setCategory] = useState<HelpCategory>('water');
  const [urgency, setUrgency] = useState<UrgencyLevel>(initialUrgency || 'urgent');
  const [latitude, setLatitude] = useState<number>(currentUser.location?.latitude || 28.6139);
  const [longitude, setLongitude] = useState<number>(currentUser.location?.longitude || 77.2090);
  const [address, setAddress] = useState<string>(currentUser.location?.address || 'Sector 14, Block C');
  const [landmark, setLandmark] = useState<string>('Near Central Water Tank');
  const [city, setCity] = useState<string>('New Delhi');
  const [locationVisibility, setLocationVisibility] = useState<LocationVisibility>('public_approximate');

  const [title, setTitle] = useState<string>('Clean drinking water required for family');
  const [description, setDescription] = useState<string>('Basement flooded, no tap water available. Need drinking water for children and elderly.');
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [requesterName, setRequesterName] = useState<string>(currentUser.name);
  const [requesterPhone, setRequesterPhone] = useState<string>(currentUser.phone);

  // Auto-Update default title when category changes
  const handleSelectCategory = (cat: HelpCategory) => {
    setCategory(cat);
    const label = categoryConfig[cat]?.label || 'Aid';
    setTitle(`Urgent ${label} assistance needed`);
  };

  // Browser Geolocation Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(5)));
        setLongitude(Number(position.coords.longitude.toFixed(5)));
        setAddress(`GPS Location (${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)})`);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation failed or denied, keeping preset coords', error);
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Step Navigation Handlers
  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Submission Handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newReq = await createRequest({
        requesterId: currentUser.id,
        requesterName: requesterName.trim() || currentUser.name,
        requesterPhone: requesterPhone.trim() || currentUser.phone,
        category,
        title: title.trim() || `${category.toUpperCase()} Assistance`,
        description: description.trim(),
        urgency,
        location: {
          latitude,
          longitude,
          address,
          landmark,
          city,
        },
        locationVisibility,
        peopleCount: Number(peopleCount) || 1,
      });

      setCreatedRequestId(newReq.id);
      setActiveStep(5); // Show Confirmation Success Step
    } catch (e) {
      console.error('Error submitting request', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Render Success Confirmation Screen (Step 5)
  // ----------------------------------------------------
  if (activeStep === 5 && createdRequestId) {
    return (
      <Card sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'success.light',
            color: 'success.dark',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.25)',
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#059669' }} />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Help Request Created!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Your request has been broadcasted to verified community helpers and relief teams within your vicinity.
        </Typography>

        {/* Confirmation Details Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 4,
            textAlign: 'left',
            bgcolor: 'background.default',
          }}
        >
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                REQUEST REFERENCE ID
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'JetBrains Mono, monospace', 
                  fontWeight: 800, 
                  color: 'primary.main',
                  letterSpacing: '0.05em' 
                }}
              >
                {createdRequestId}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                PRIORITY & URGENCY
              </Typography>
              <UrgencyChip urgency={urgency} size="medium" />
            </Grid>

            <Grid size={{ xs: 12 }}><Divider /></Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>CATEGORY</Typography>
              <Box sx={{ mt: 0.5 }}>
                <CategoryBadge category={category} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>PEOPLE IN NEED</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {peopleCount} People
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>LOCATION</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {address} {landmark && `(Landmark: ${landmark})`}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => onSuccessNavigate?.('my-requests', createdRequestId)}
            startIcon={<TrackChangesRoundedIcon />}
            sx={{ fontWeight: 800 }}
          >
            Track in "My Requests"
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => onSuccessNavigate?.('admin', createdRequestId)}
            startIcon={<MapRoundedIcon />}
          >
            View in Incident Map
          </Button>

          <Button
            variant="text"
            onClick={() => {
              setActiveStep(0);
              setCreatedRequestId(null);
            }}
          >
            Create Another Request
          </Button>
        </Box>
      </Card>
    );
  }

  // ----------------------------------------------------
  // Render Step 0: Category Selection
  // ----------------------------------------------------
  const renderStep0 = () => {
    const categories: HelpCategory[] = [
      'water',
      'food',
      'medicine',
      'medical_assistance',
      'shelter',
      'evacuation',
      'power',
      'other',
    ];

    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Step 1: What type of assistance do you need?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Select the primary essential aid category required for you or your family.
        </Typography>

        <Grid container spacing={2}>
          {categories.map((cat) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={cat}>
              <CategoryBadge
                category={cat}
                variant="card"
                selected={category === cat}
                onClick={() => handleSelectCategory(cat)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // ----------------------------------------------------
  // Render Step 1: Urgency Selection
  // ----------------------------------------------------
  const renderStep1 = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Step 2: How urgent is this situation?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Helpers prioritize critical life-threatening and medical emergencies first.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Critical */}
          <Paper
            onClick={() => setUrgency('critical')}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              cursor: 'pointer',
              border: urgency === 'critical' ? '2px solid #DC2626' : '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: urgency === 'critical' ? 'rgba(220, 38, 38, 0.06)' : 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <UrgencyChip urgency="critical" size="medium" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Immediate Danger / Critical Emergency
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Life-saving medical needs, stranded in severe rising floodwaters, trauma, or urgent evacuation.
              </Typography>
            </Box>
            <Radio checked={urgency === 'critical'} color="error" />
          </Paper>

          {/* Urgent */}
          <Paper
            onClick={() => setUrgency('urgent')}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              cursor: 'pointer',
              border: urgency === 'urgent' ? '2px solid #D97706' : '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: urgency === 'urgent' ? 'rgba(217, 119, 6, 0.06)' : 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <UrgencyChip urgency="urgent" size="medium" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Urgent Assistance (Needed within 2-4 hours)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Baby food, clean drinking water runs out today, emergency charging for rescue contact.
              </Typography>
            </Box>
            <Radio checked={urgency === 'urgent'} sx={{ color: '#D97706', '&.Mui-checked': { color: '#D97706' } }} />
          </Paper>

          {/* Normal */}
          <Paper
            onClick={() => setUrgency('normal')}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              cursor: 'pointer',
              border: urgency === 'normal' ? '2px solid #059669' : '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: urgency === 'normal' ? 'rgba(5, 150, 105, 0.06)' : 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <UrgencyChip urgency="normal" size="medium" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Standard Priority (Can wait if others in danger)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Dry ration replenishment, blanket supplies, general community check-in.
              </Typography>
            </Box>
            <Radio checked={urgency === 'normal'} color="success" />
          </Paper>
        </Box>
      </Box>
    );
  };

  // ----------------------------------------------------
  // Render Step 2: Location & Privacy
  // ----------------------------------------------------
  const renderStep2 = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Step 3: Where should assistance be delivered?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Accurate location coordinates allow our matching engine to find volunteers within 1 to 5 km.
        </Typography>

        {/* GPS Detection Bar */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MyLocationRoundedIcon />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Auto-Detect GPS Location
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Lat: {latitude}, Lng: {longitude}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            sx={{ bgcolor: '#FFF', color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: '#F1F5F9' } }}
            onClick={handleDetectLocation}
            disabled={isLocating}
            startIcon={isLocating ? <CircularProgress size={16} /> : <MyLocationRoundedIcon />}
          >
            {isLocating ? 'Locating...' : 'Use My GPS'}
          </Button>
        </Paper>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              label="Street Address / Building Name"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. House 42, Block C, Sector 14"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="City / District"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Notable Landmark (Crucial during floods/grid outages)"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Mother Dairy Booth / Red Water Tank"
              helperText="Helps volunteers find you even if street signs are underwater or dark."
            />
          </Grid>

          {/* Privacy Toggle as per PRD Section 14 */}
          <Grid size={{ xs: 12 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SecurityRoundedIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Location Privacy Mode
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {locationVisibility === 'public_approximate'
                      ? 'Display approximate 300m circle on public crisis map. Exact address is revealed ONLY to the volunteer who accepts.'
                      : 'Show exact pinpoint location on public map.'}
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={locationVisibility === 'public_approximate'}
                    onChange={(e) => setLocationVisibility(e.target.checked ? 'public_approximate' : 'helper_precise')}
                    color="primary"
                  />
                }
                label={locationVisibility === 'public_approximate' ? 'Approximate (Safe)' : 'Precise'}
                sx={{ ml: 1 }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ----------------------------------------------------
  // Render Step 3: Details & Contact Information
  // ----------------------------------------------------
  const renderStep3 = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Step 4: Request Details & Contact
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Provide clear quantities and phone numbers so helpers can prepare proper supplies.
        </Typography>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Request Title (Short Summary)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Drinking water for 4 people, 1 infant"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="People Needing Aid"
              value={peopleCount}
              onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleAltRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              label="Contact Person Name"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              label="Phone Number"
              value={requesterPhone}
              onChange={(e) => setRequesterPhone(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Detailed Situation / Specific Requirements (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. We have an elderly patient on 2nd floor who cannot walk down stairs. Need 15 liters of drinking water and dry biscuits."
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ----------------------------------------------------
  // Render Step 4: Review Summary
  // ----------------------------------------------------
  const renderStep4 = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Step 5: Review & Confirm Emergency Request
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Please verify your details before broadcasting to nearby volunteers and response units.
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3, bgcolor: 'background.default' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>CATEGORY</Typography>
              <Box sx={{ mt: 0.5 }}>
                <CategoryBadge category={category} />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                URGENCY
              </Typography>
              <UrgencyChip urgency={urgency} size="medium" />
            </Grid>

            <Grid size={{ xs: 12 }}><Divider /></Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>SUMMARY</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.2 }}>
                {title}
              </Typography>
              {description && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {description}
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>DELIVERY LOCATION</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {address}, {city}
              </Typography>
              {landmark && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Landmark: {landmark}
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>CONTACT & PEOPLE</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {requesterName} ({requesterPhone})
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {peopleCount} People in need
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Alert severity={urgency === 'critical' ? 'error' : 'info'} sx={{ mb: 2 }}>
          {urgency === 'critical'
            ? 'This is flagged as a Critical Priority. Nearby emergency drivers and volunteers will be notified instantly.'
            : 'Your request will appear on the Live Crisis Map with matching scores for local helpers.'}
        </Alert>
      </Box>
    );
  };

  return (
    <Card sx={{ maxWidth: 840, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Mobile Step Header */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.04em' }}>
            STEP {activeStep + 1} OF {steps.length}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {steps[activeStep]}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={((activeStep + 1) / steps.length) * 100}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Desktop Stepper Header */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, display: { xs: 'none', sm: 'flex' } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Active Step Content */}
      <CardContent sx={{ minHeight: 320, p: 0 }}>
        {activeStep === 0 && renderStep0()}
        {activeStep === 1 && renderStep1()}
        {activeStep === 2 && renderStep2()}
        {activeStep === 3 && renderStep3()}
        {activeStep === 4 && renderStep4()}
      </CardContent>

      <Divider sx={{ my: 3 }} />

      {/* Navigation Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowBackRoundedIcon />}
        >
          Back
        </Button>

        {activeStep < 4 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            endIcon={<ArrowForwardRoundedIcon />}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            color={urgency === 'critical' ? 'error' : 'primary'}
            size="large"
            disabled={isSubmitting}
            onClick={handleSubmit}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleRoundedIcon />}
            sx={{ px: 4, fontWeight: 800 }}
          >
            {isSubmitting ? 'Broadcasting...' : 'SUBMIT AID REQUEST'}
          </Button>
        )}
      </Box>
    </Card>
  );
};
