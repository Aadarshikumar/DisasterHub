import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Drawer,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HelpRequest, HelpCategory, UrgencyLevel } from '../../types';
import { useRequests } from '../../context/RequestContext';
import { useAuth } from '../../context/AuthContext';
import { CategoryBadge } from '../../components/CategoryBadge/CategoryBadge';
import { UrgencyChip } from '../../components/UrgencyChip/UrgencyChip';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import AddAlertRoundedIcon from '@mui/icons-material/AddAlertRounded';

// Helper component to center map dynamically when selected item changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom(), { animate: true });
  return null;
}

// Custom Leaflet DivIcon Generators
const createRequestIcon = (urgency: UrgencyLevel, _category: HelpCategory) => {
  const color = urgency === 'critical' ? '#DC2626' : urgency === 'urgent' ? '#D97706' : '#059669';

  return L.divIcon({
    className: 'custom-crisis-pin',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid #FFFFFF;
      ">
        <div style="
          transform: rotate(45deg);
          color: #FFF;
          font-size: 13px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${urgency === 'critical' ? '⚡' : '🆘'}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });
};

const createVolunteerIcon = () => {
  return L.divIcon({
    className: 'custom-volunteer-pin',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: #059669;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(5,150,105,0.4);
        border: 2px solid #FFFFFF;
        color: #FFF;
        font-size: 14px;
      ">
        🤝
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
};

const createOrgIcon = () => {
  return L.divIcon({
    className: 'custom-org-pin',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: #4F46E5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(79,70,229,0.4);
        border: 2px solid #FFFFFF;
        color: #FFF;
        font-size: 14px;
      ">
        🏢
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

interface CrisisMapProps {
  initialSelectedRequestId?: string;
  onNavigateToTasks?: () => void;
  onOpenNeedHelp?: () => void;
}

export const CrisisMap: React.FC<CrisisMapProps> = ({
  initialSelectedRequestId,
  onNavigateToTasks,
  onOpenNeedHelp,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { requests, offers, resources, acceptRequest } = useRequests();

  // Filter States
  const [selectedUrgencies, setSelectedUrgencies] = useState<UrgencyLevel[]>(['critical', 'urgent', 'normal']);
  const [selectedCategory, _setSelectedCategory] = useState<HelpCategory | 'all'>('all');
  const [showRequests, setShowRequests] = useState<boolean>(true);
  const [showVolunteers, setShowVolunteers] = useState<boolean>(true);
  const [showOrgHubs, setShowOrgHubs] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Selected Detail Drawer
  const [activeRequest, setActiveRequest] = useState<HelpRequest | null>(() => {
    if (initialSelectedRequestId) {
      return requests.find((r) => r.id === initialSelectedRequestId) || null;
    }
    return null;
  });

  const [activeCenter, setActiveCenter] = useState<[number, number]>([
    currentUser.location?.latitude || 28.6139,
    currentUser.location?.longitude || 77.2090,
  ]);

  // Filtered lists
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (!selectedUrgencies.includes(r.urgency)) return false;
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      return true;
    });
  }, [requests, selectedUrgencies, selectedCategory]);

  const toggleUrgencyFilter = (u: UrgencyLevel) => {
    setSelectedUrgencies((prev) =>
      prev.includes(u) ? prev.filter((item) => item !== u) : [...prev, u]
    );
  };

  const handleSelectRequestMarker = (req: HelpRequest) => {
    setActiveRequest(req);
    setActiveCenter([req.location.latitude, req.location.longitude]);
  };

  const handleAcceptFromMap = async (requestId: string) => {
    await acceptRequest(requestId);
    setActiveRequest(null);
    onNavigateToTasks?.();
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 'calc(100dvh - 165px)', md: 'calc(100vh - 130px)' },
        minHeight: { xs: 440, md: 520 },
        borderRadius: { xs: 2.5, md: 3 },
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Top Filter Floating Bar / Mobile Toggle */}
      {isMobile ? (
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            startIcon={<FilterListRoundedIcon />}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              fontSize: '0.78rem',
              fontWeight: 700,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            Filters ({selectedUrgencies.length + (showVolunteers ? 1 : 0) + (showOrgHubs ? 1 : 0)})
          </Button>
        </Box>
      ) : (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
            maxWidth: 600,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mr: 0.5 }}>
            FILTERS:
          </Typography>

          {/* Urgency Toggles */}
          <Chip
            label="Critical"
            size="small"
            onClick={() => toggleUrgencyFilter('critical')}
            color={selectedUrgencies.includes('critical') ? 'error' : 'default'}
            variant={selectedUrgencies.includes('critical') ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />

          <Chip
            label="Urgent"
            size="small"
            onClick={() => toggleUrgencyFilter('urgent')}
            color={selectedUrgencies.includes('urgent') ? 'warning' : 'default'}
            variant={selectedUrgencies.includes('urgent') ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />

          <Chip
            label="Normal"
            size="small"
            onClick={() => toggleUrgencyFilter('normal')}
            color={selectedUrgencies.includes('normal') ? 'success' : 'default'}
            variant={selectedUrgencies.includes('normal') ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Layer Toggles */}
          <Chip
            icon={<VolunteerActivismRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="Volunteers"
            size="small"
            onClick={() => setShowVolunteers(!showVolunteers)}
            color={showVolunteers ? 'success' : 'default'}
            variant={showVolunteers ? 'filled' : 'outlined'}
          />

          <Chip
            icon={<CorporateFareRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="NGO Depots"
            size="small"
            onClick={() => setShowOrgHubs(!showOrgHubs)}
            color={showOrgHubs ? 'secondary' : 'default'}
            variant={showOrgHubs ? 'filled' : 'outlined'}
          />
        </Paper>
      )}

      {/* Mobile Filters Dropdown Sheet */}
      {isMobile && mobileFilterOpen && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            top: 54,
            left: 12,
            right: 12,
            zIndex: 1000,
            p: 2,
            borderRadius: 3,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Filter Map Incidents
            </Typography>
            <IconButton size="small" onClick={() => setMobileFilterOpen(false)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            URGENCY LEVELS:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
            <Chip
              label="Critical"
              size="small"
              onClick={() => toggleUrgencyFilter('critical')}
              color={selectedUrgencies.includes('critical') ? 'error' : 'default'}
              variant={selectedUrgencies.includes('critical') ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="Urgent"
              size="small"
              onClick={() => toggleUrgencyFilter('urgent')}
              color={selectedUrgencies.includes('urgent') ? 'warning' : 'default'}
              variant={selectedUrgencies.includes('urgent') ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="Normal"
              size="small"
              onClick={() => toggleUrgencyFilter('normal')}
              color={selectedUrgencies.includes('normal') ? 'success' : 'default'}
              variant={selectedUrgencies.includes('normal') ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            MAP LAYERS:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
            <Chip
              label="Help Requests"
              size="small"
              onClick={() => setShowRequests(!showRequests)}
              color={showRequests ? 'primary' : 'default'}
              variant={showRequests ? 'filled' : 'outlined'}
            />
            <Chip
              label="Volunteers"
              size="small"
              onClick={() => setShowVolunteers(!showVolunteers)}
              color={showVolunteers ? 'success' : 'default'}
              variant={showVolunteers ? 'filled' : 'outlined'}
            />
            <Chip
              label="NGO Depots"
              size="small"
              onClick={() => setShowOrgHubs(!showOrgHubs)}
              color={showOrgHubs ? 'secondary' : 'default'}
              variant={showOrgHubs ? 'filled' : 'outlined'}
            />
          </Box>
        </Paper>
      )}

      {/* Floating Action: Quick Request Aid */}
      <Box sx={{ position: 'absolute', bottom: { xs: 16, sm: 20 }, right: { xs: 16, sm: 20 }, zIndex: 1000, display: 'flex', gap: 1.5 }}>
        <Button
          variant="contained"
          color="error"
          size={isMobile ? 'small' : 'medium'}
          onClick={onOpenNeedHelp}
          startIcon={<AddAlertRoundedIcon />}
          sx={{
            fontWeight: 800,
            boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
            borderRadius: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          Post Aid Request
        </Button>
      </Box>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={activeCenter}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <MapRecenter center={activeCenter} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Requests Markers */}
        {showRequests &&
          filteredRequests.map((req) => (
            <React.Fragment key={req.id}>
              <Marker
                position={[req.location.latitude, req.location.longitude]}
                icon={createRequestIcon(req.urgency, req.category)}
                eventHandlers={{
                  click: () => handleSelectRequestMarker(req),
                }}
              >
                <Popup>
                  <Box sx={{ minWidth: 190, p: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <UrgencyChip urgency={req.urgency} size="small" />
                      <StatusBadge status={req.status} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5, fontSize: '0.9rem' }}>
                      {req.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                      {req.location.address}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      color={req.urgency === 'critical' ? 'error' : 'primary'}
                      onClick={() => setActiveRequest(req)}
                      sx={{ fontSize: '0.75rem', py: 0.5, fontWeight: 700 }}
                    >
                      View Details & Assist
                    </Button>
                  </Box>
                </Popup>
              </Marker>

              {/* Approximate Location Privacy Zone (PRD Section 14) */}
              {req.locationVisibility === 'public_approximate' && (
                <Circle
                  center={[req.location.latitude, req.location.longitude]}
                  radius={300}
                  pathOptions={{
                    color: req.urgency === 'critical' ? '#DC2626' : '#D97706',
                    fillColor: req.urgency === 'critical' ? '#DC2626' : '#D97706',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    dashArray: '4, 4',
                  }}
                />
              )}
            </React.Fragment>
          ))}

        {/* Volunteers Markers */}
        {showVolunteers &&
          offers.map((off) => (
            <React.Fragment key={off.id}>
              <Marker
                position={[off.location.latitude, off.location.longitude]}
                icon={createVolunteerIcon()}
              >
                <Popup>
                  <Box sx={{ minWidth: 180, p: 0.5 }}>
                    <Chip label="VOLUNTEER" size="small" color="success" sx={{ fontWeight: 700, mb: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {off.volunteerName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      Radius: {off.serviceRadiusKm} km • Available Now
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                      {off.description}
                    </Typography>
                  </Box>
                </Popup>
              </Marker>

              {/* Service Radius Visualizer */}
              <Circle
                center={[off.location.latitude, off.location.longitude]}
                radius={off.serviceRadiusKm * 1000}
                pathOptions={{
                  color: '#059669',
                  fillColor: '#059669',
                  fillOpacity: 0.05,
                  weight: 1,
                }}
              />
            </React.Fragment>
          ))}

        {/* Organization Depots Markers */}
        {showOrgHubs &&
          resources.map((res) => (
            <Marker
              key={res.id}
              position={[res.location.latitude, res.location.longitude]}
              icon={createOrgIcon()}
            >
              <Popup>
                <Box sx={{ minWidth: 200, p: 0.5 }}>
                  <Chip label="RELIEF DEPOT" size="small" color="secondary" sx={{ fontWeight: 700, mb: 0.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {res.organizationName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Stocked: {res.availableQuantity} {res.unit} of {res.resourceName}
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Slide-out Request Detail Drawer (Right on Desktop, Bottom Sheet on Mobile) */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={Boolean(activeRequest)}
        onClose={() => setActiveRequest(null)}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? '100%' : 400,
              maxHeight: isMobile ? '82vh' : '100%',
              borderTopLeftRadius: isMobile ? 20 : 0,
              borderTopRightRadius: isMobile ? 20 : 0,
              p: { xs: 2.5, sm: 3 },
              boxSizing: 'border-box',
            },
          }
        }}
      >
        {activeRequest && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Mobile Drag Indicator */}
            {isMobile && (
              <Box
                sx={{
                  width: 36,
                  height: 4,
                  bgcolor: 'divider',
                  borderRadius: 2,
                  mx: 'auto',
                  mb: 1.5,
                }}
              />
            )}

            {/* Drawer Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  REQUEST ID: {activeRequest.id}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <UrgencyChip urgency={activeRequest.urgency} size="small" />
                  <StatusBadge status={activeRequest.status} />
                </Box>
              </Box>
              <IconButton onClick={() => setActiveRequest(null)} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Request Body */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Box sx={{ mb: 1.5 }}>
                <CategoryBadge category={activeRequest.category} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.1rem' }}>
                {activeRequest.title}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                {activeRequest.description}
              </Typography>

              {/* Location Card */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default', mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  DELIVERY LOCATION
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activeRequest.location.address}
                </Typography>
                {activeRequest.location.landmark && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                    Landmark: {activeRequest.location.landmark}
                  </Typography>
                )}

                {activeRequest.locationVisibility === 'public_approximate' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1.2, color: 'primary.main' }}>
                    <SecurityRoundedIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Approximate 300m Pin (Protected for Privacy)
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* People & Contact Info */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default', mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  REQUESTER DETAILS
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activeRequest.requesterName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {activeRequest.peopleCount} {activeRequest.peopleCount > 1 ? 'People' : 'Person'} needing help
                </Typography>
              </Paper>
            </Box>

            {/* Bottom Actions */}
            <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              {activeRequest.status === 'OPEN' ? (
                <Button
                  variant="contained"
                  color={activeRequest.urgency === 'critical' ? 'error' : 'primary'}
                  fullWidth
                  size="large"
                  onClick={() => handleAcceptFromMap(activeRequest.id)}
                  startIcon={<HandshakeRoundedIcon />}
                  sx={{ fontWeight: 800, py: 1.2 }}
                >
                  ACCEPT & ASSIST NOW
                </Button>
              ) : (
                <Alert severity="info" sx={{ fontWeight: 600 }}>
                  This request is currently {activeRequest.status}. Assigned to {activeRequest.assignedVolunteerName || 'volunteer'}.
                </Alert>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};
