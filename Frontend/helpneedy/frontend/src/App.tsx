import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { RequestProvider } from './context/RequestContext';
import { getAppTheme } from './theme/theme';

import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { SOSModal } from './components/SOSModal/SOSModal';
import { MobileBottomNav } from './components/BottomNav/BottomNav';

import { CrisisMap } from './features/map/CrisisMap';
import { CreateRequestWizard } from './features/requests/CreateRequestWizard';
import { CreateOfferForm } from './features/offers/CreateOfferForm';
import { VolunteerDashboard } from './features/offers/VolunteerDashboard';
import { MyRequestsPage } from './features/requests/MyRequestsPage';
import { OrgDashboard } from './features/organization/OrgDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';

const MainAppContent: React.FC = () => {
  const { themeMode } = useAuth();
  const theme = getAppTheme(themeMode);

  // Active Tab: 'need-help' | 'can-help' | 'my-requests' | 'org-hub' | 'admin'
  const [currentTab, setCurrentTab] = useState<string>('need-help');
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [selectedRequestIdForMap, setSelectedRequestIdForMap] = useState<string | undefined>(undefined);
  const [isEditingOffer, setIsEditingOffer] = useState<boolean>(false);
  const [adminSubTab, setAdminSubTab] = useState<'map' | 'overview' | 'reports' | 'logs'>('overview');

  const handleNavigate = (tab: string, reqId?: string, subTab?: 'map' | 'overview' | 'reports' | 'logs') => {
    setCurrentTab(tab);
    if (reqId) {
      setSelectedRequestIdForMap(reqId);
    }
    if (subTab) {
      setAdminSubTab(subTab);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          pb: { xs: '70px', md: 0 }, // Leave room for bottom navigation on mobile
        }}
      >
        {/* Navigation Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsEditingOffer(false);
          }}
          onOpenSOSModal={() => setIsSOSOpen(true)}
        />

        {/* Main Content Area */}
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 1.5, sm: 2.5, md: 3 }, px: { xs: 1, sm: 2.5, md: 3 } }}>
          {/* Tab 1: I Need Help (Requester Flow) */}
          {currentTab === 'need-help' && (
            <CreateRequestWizard
              onSuccessNavigate={(tab, reqId) => {
                handleNavigate(tab, reqId);
              }}
            />
          )}

          {/* Tab 2: I Can Help (Volunteer Flow) */}
          {currentTab === 'can-help' && (
            isEditingOffer ? (
              <CreateOfferForm onOfferActivated={() => setIsEditingOffer(false)} />
            ) : (
              <VolunteerDashboard
                onOpenOfferForm={() => setIsEditingOffer(true)}
                onNavigateToMap={(reqId) => {
                  handleNavigate('admin', reqId, 'map');
                }}
                onNavigateToTasks={() => setCurrentTab('my-requests')}
              />
            )
          )}

          {/* Tab 3: My Requests & Lifecycle Tracker */}
          {currentTab === 'my-requests' && (
            <MyRequestsPage
              initialFocusRequestId={selectedRequestIdForMap}
              onOpenCreateRequest={() => setCurrentTab('need-help')}
              onNavigateToMap={(reqId) => {
                handleNavigate('admin', reqId, 'map');
              }}
            />
          )}

          {/* Tab 4: NGO & Organization Resource Hub */}
          {currentTab === 'org-hub' && <OrgDashboard />}

          {/* Tab 5: Admin & Moderation Portal (Includes Embedded Live Crisis Map) */}
          {currentTab === 'admin' && (
            <AdminDashboard
              initialSubTab={adminSubTab}
              onNavigateToTasks={() => setCurrentTab('my-requests')}
              onOpenNeedHelp={() => setCurrentTab('need-help')}
            />
          )}
        </Container>

        {/* Global Emergency SOS Modal */}
        <SOSModal
          open={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
          onSuccess={(tab, reqId) => {
            setSelectedRequestIdForMap(reqId);
            setCurrentTab(tab);
          }}
        />

        {/* Page Footer */}
        <Footer />

        {/* Mobile Fixed Bottom Navigation */}
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsEditingOffer(false);
          }}
          onOpenSOSModal={() => setIsSOSOpen(true)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RequestProvider>
          <MainAppContent />
        </RequestProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
