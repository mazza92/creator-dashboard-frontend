import React, { useContext, useEffect, useCallback } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { UserContext, UserProvider } from './contexts/UserContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Analytics } from '@vercel/analytics/react';
import IndexNowInitializer from './components/IndexNowInitializer';
import IndexNowTest from './components/IndexNowTest';
import CreatorOverview from './creator-portal/CreatorOverview';
import BrandOnboardingForm from './components/forms/BrandOnboardingForm';
// eslint-disable-next-line no-unused-vars
import CreatorOnboardingForm from './components/forms/CreatorOnboardingForm';
import Signup from './components/forms/Signup';
import SuccessPage from './components/forms/SuccessPage';
import DashboardLayout from './Layouts/DashboardLayout';
import CreatorDashboardLayout from './Layouts/CreatorDashboardLayout';
import BrandOverview from './components/BrandOverview';
import BrandPROffers from './brand-portal/BrandPROffers';
import BrandMarketplace from './brand-portal/BrandMarketplace';
import CreatorBookings from './components/CreatorBookings';
import ManagePackages from './creator-portal/ManagePackages';
// eslint-disable-next-line no-unused-vars
import Listing from './creator-portal/Listing';
import Profile from './components/Profile';
import ProfilePage from './creator-portal/ProfilePage';
import BrandProfilePage from './components/BrandProfilePage';
import Login from './components/Login';
import BrandBookings from './components/BrandBookings';
import Payment from './Payment';
import PaymentSuccess from './PaymentSuccess';
import PaymentFailed from './PaymentFailed';
import SponsorOpportunities from './components/SponsorOpportunities';
import SponsorOffers from './creator-portal/SponsorOffers';
// eslint-disable-next-line no-unused-vars
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import BlogPost from './pages/BlogPost';
import ContactPage from './pages/ContactPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BrandPRPackagesPage from './pages/BrandPRPackagesPage';
// eslint-disable-next-line no-unused-vars
import LandingPageLayout from './Layouts/LandingPageLayout';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Founding50 from './pages/Founding50';
import { NotificationProvider } from './contexts/NotificationContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import PaymentsPage from './creator-portal/PaymentsPage';
import CampaignInvites from './creator-portal/CampaignInvites';
import FirstAdSlot from './creator-portal/FirstAdSlot';
import PROffers from './creator-portal/PROffers';
import FirstAdSlotSuccess from './creator-portal/FirstAdSlotSuccess';
import VerifyEmailPending from './components/VerifyEmailPending';
import VerifyEmail from './components/VerifyEmail';
import ResendVerification from './components/ResendVerification';
import LoadingSpinner from './components/LoadingSpinner';
import StripeSuccess from './components/StripeSuccess';
import api from './config/api';
import PublicCreatorProfile from './components/PublicCreatorProfile';
import CreatorSignup from './components/forms/CreatorSignup';
import CreatorOnboarding from './components/forms/CreatorOnboarding';
import ProfileLayoutWrapper from './Layouts/ProfileLayoutWrapper';
import { AuthProvider } from './contexts/AuthContext';
import Marketplace from './pages/Marketplace';
import PRPipeline from './creator-portal/PRPipeline';
import SubscriptionSuccess from './creator-portal/SubscriptionSuccess';
import SubscriptionCancel from './creator-portal/SubscriptionCancel';
import AccountSettings from './creator-portal/AccountSettings';
import PublicBrandPage from './pages/PublicBrandPage';
import UnifiedBrandDirectory from './pages/UnifiedBrandDirectory';
import SkincareDirectory from './pages/SkincareDirectory';
import KBeautyDirectory from './pages/KBeautyDirectory';
import AustraliaDirectory from './pages/AustraliaDirectory';

const stripePromise = loadStripe('pk_test_51RWy7PDAK7yV5SICch3oyllPQv3FJqZGx8QUWySdMVWPQkzE8ND5HMfRbXYX0ZYtiaDyCmVcWZKnoQqEd5eO3nC9003fK6K3fQ');

function AppContent() {
    const { user, loading } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    const completeStripePayment = useCallback(async (subscriptionId, paymentIntentId = null) => {
        try {
            if (!paymentIntentId) {
                const response = await api.get(`/subscriptions/${subscriptionId}/status`);
                paymentIntentId = response.data.transaction_id;
            }

            if (paymentIntentId) {
                const completeResponse = await api.post(
                    `/subscriptions/${subscriptionId}/complete-payment`,
                    { payment_intent_id: paymentIntentId }
                );
                console.log(`✅ Completed payment for subscription ${subscriptionId}:`, completeResponse.data);
                localStorage.removeItem('pendingSubscriptionId');
                localStorage.removeItem('pendingPaymentIntentId');
            }
            navigate('/brand/dashboard/bookings', { replace: true });
        } catch (error) {
            console.error('🔥 Error completing Stripe payment:', error.response?.data || error);
            navigate('/brand/dashboard/bookings', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        if (!loading) {
            const publicRoutes = [
                '/',
                '/login',
                '/register',
                '/about',
                '/blog',
                '/blog/',
                '/contact',
                '/privacy-policy',
                '/terms-of-service',
                '/success',
                '/payment-success',
                '/payment-failed',
                '/forgot-password',
                '/reset-password',
                '/payment',
                '/register/brand',
                '/register/creator',
                '/verify-email-pending',
                '/verify-email',
                '/resend-verification',
                '/stripe/success',
                '/stripe/reauth',
                '/creator/profile/:id',
                '/brands/pr-packages',
                '/brands/send-pr-packages',
                '/marketplace',
                '/c/',
                '/creator/dashboard/subscription/success',
                '/creator/dashboard/subscription/cancel'
            ];

            // Global scroll restoration for better UX
            const scrollToTop = () => {
                // Try multiple scroll methods for better browser compatibility
                if (window.scrollTo) {
                    window.scrollTo(0, 0);
                } else if (document.documentElement.scrollTop !== undefined) {
                    document.documentElement.scrollTop = 0;
                } else if (document.body.scrollTop !== undefined) {
                    document.body.scrollTop = 0;
                }
            };

            // Scroll to top on route change
            scrollToTop();

            // Check if route is public - explicitly handle blog routes
            const isPublicRoute = location.pathname.startsWith('/blog') || 
                                  publicRoutes.some(route => location.pathname.startsWith(route));

            // Check if we just completed onboarding (give it a moment for user context to load)
            const justCompletedOnboarding = sessionStorage.getItem('justCompletedOnboarding');
            
            // If we just completed onboarding, wait a bit before checking authentication
            // This gives UserContext time to refresh after session is set
            if (justCompletedOnboarding && !user && !isPublicRoute) {
                // Don't redirect immediately - give user context time to load
                console.log('⏳ Just completed onboarding, waiting for user context to load...');
                // Clear the flag after a delay to allow user context to update
                setTimeout(() => {
                    sessionStorage.removeItem('justCompletedOnboarding');
                }, 2000); // Give 2 seconds for user context to load
                return; // Exit early, don't redirect yet
            }

            if (!user && !isPublicRoute) {
                // Set sessionExpired flag if not already set by API interceptor
                if (!localStorage.getItem('sessionExpired')) {
                    localStorage.setItem('sessionExpired', 'true');
                }
                console.log('🟢 Redirecting unauthenticated user to /login');
                navigate('/login', { replace: true });
            } else if (user) {
                const correctBasePath = user.role === 'creator' ? '/creator/dashboard/pr-brands' : '/brand/dashboard/bookings';
                
                // A brand user is allowed to visit a creator's profile page.
                const isViewingCreatorProfileAsBrand = user.role === 'brand' && location.pathname.startsWith('/creator/profile/');

                // Check if we just completed onboarding - if so, skip incomplete profile check
                // This prevents redirect loop when user context hasn't updated yet
                const justCompletedOnboarding = sessionStorage.getItem('justCompletedOnboarding');
                
                // Check if user has incomplete profile (creator_id/brand_id is null)
                // Only check if we're not in a loading state to avoid premature redirects
                // Skip this check if we just completed onboarding (user context is updating)
                const hasIncompleteProfile = (user.role === 'creator' && !user.creator_id) || 
                                          (user.role === 'brand' && !user.brand_id);
                
                // If user has incomplete profile and is not on onboarding, redirect to onboarding
                // But skip this if we just completed onboarding (give user context time to update)
                if (hasIncompleteProfile && !justCompletedOnboarding && 
                    !location.pathname.startsWith('/onboarding') && 
                    !location.pathname.startsWith('/register/creator') && 
                    !location.pathname.startsWith('/register/brand')) {
                    console.log(`🔄 User has incomplete profile, redirecting to onboarding`);
                    navigate('/onboarding', { replace: true });
                    return;
                }
                
                // If we just completed onboarding and user now has creator_id/brand_id, clear the flag
                if (justCompletedOnboarding && !hasIncompleteProfile) {
                    console.log('✅ Profile completed - clearing onboarding flag');
                    sessionStorage.removeItem('justCompletedOnboarding');
                }

                const isInvalidPath =
                    location.pathname === '/' ||
                    (user.role === 'creator' &&
                        location.pathname.startsWith('/brand') &&
                        !location.pathname.startsWith('/brand/profile')) ||
                    (user.role === 'brand' &&
                        location.pathname.startsWith('/creator') &&
                        !isViewingCreatorProfileAsBrand); // <-- The fix is here

                // Check if route is public - explicitly handle blog routes
                const isPublicRouteForUser = location.pathname.startsWith('/blog') || 
                                             publicRoutes.some(route => location.pathname.startsWith(route));

                if (isInvalidPath && !isPublicRouteForUser && location.pathname !== '/payment-success') {
                    console.log(`🟢 Redirecting ${user.role} user to ${correctBasePath}`);
                    navigate(correctBasePath, { replace: true });
                }

                if (location.pathname === '/payment-success' && !location.search.includes('paymentId')) {
                    console.log('📌 Detected Stripe redirect to /payment-success, checking last payment intent');
                    const subscriptionId = localStorage.getItem('pendingSubscriptionId');
                    if (subscriptionId) {
                        completeStripePayment(subscriptionId);
                    } else {
                        navigate('/brand/dashboard/bookings', { replace: true });
                    }
                }

                console.log(`📌 Navigation event: Path changed to ${location.pathname}`);
            }
        }
    }, [user, loading, navigate, location, completeStripePayment]);

    console.log(
        '🔍 App.js - User:',
        user,
        'Loading:',
        loading,
        'Path:',
        location.pathname
    );

    // Only show loading spinner for protected routes
    const isProtectedRoute = location.pathname.startsWith('/brand') || 
                            location.pathname.startsWith('/creator') ||
                            location.pathname.startsWith('/creator/profile') ||
                            location.pathname.startsWith('/brand/profile');
    
    if (loading && isProtectedRoute) return <LoadingSpinner />;

    const isPayPalFlow = location.pathname === '/payment-success' && location.search.includes('paymentId');

    // Determine if header should be hidden for immersive/focused routes
    // eslint-disable-next-line no-unused-vars
    const shouldHideHeader = location.pathname.startsWith('/c/')
        || location.pathname.startsWith('/onboarding')
        || location.pathname.startsWith('/register/creator');

    return (
        <>
            <IndexNowInitializer />
            <Routes>
            {/* Public routes always available */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Signup />} />
            <Route path='/register/brand' element={<BrandOnboardingForm />} />
            <Route path='/register/creator' element={<CreatorSignup />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/blog' element={<BlogPage />} />
            <Route path='/blog/:slug' element={<BlogPost />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            <Route path='/terms-of-service' element={<TermsOfService />} />
            <Route path='/brands/pr-packages' element={<BrandPRPackagesPage />} />
            <Route path='/brands/send-pr-packages' element={<BrandPRPackagesPage />} />
            <Route path='/f50' element={<Founding50 />} />
            <Route path='/success' element={<SuccessPage />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='/payment' element={<Payment />} />
            <Route path='/payment-success' element={isPayPalFlow ? <PaymentSuccess /> : <Navigate to='/brand/dashboard/bookings' replace />} />
            <Route path='/payment-failed' element={<PaymentFailed />} />
            <Route path='/verify-email-pending' element={<VerifyEmailPending />} />
            <Route path='/verify-email' element={<VerifyEmail />} />
            <Route path='/resend-verification' element={<ResendVerification />} />
            <Route path='/stripe/success' element={<StripeSuccess />} />
            <Route path='/stripe/reauth' element={<StripeSuccess />} />
            <Route path='/marketplace' element={<Marketplace />} />
            <Route
                path='/directory'
                element={
                    user ? <Navigate to='/creator/dashboard/pr-brands' replace /> : <UnifiedBrandDirectory />
                }
            />
            <Route path='/directory/skincare' element={<SkincareDirectory />} />
            <Route path='/directory/k-beauty' element={<KBeautyDirectory />} />
            <Route path='/directory/australia' element={<AustraliaDirectory />} />
            <Route path='/brand/:slug' element={<PublicBrandPage />} />
            <Route path='/c/:username' element={<PublicCreatorProfile />} />
            <Route path='/register-new' element={<CreatorSignup />} />
            <Route path='/onboarding' element={<CreatorOnboarding />} />
            <Route path='/test-indexnow' element={<IndexNowTest />} />
            <Route path='/creator/dashboard/subscription/success' element={<SubscriptionSuccess />} />
            <Route path='/creator/dashboard/subscription/cancel' element={<SubscriptionCancel />} />

            {/* Standalone routes for profiles, wrapped in a layout manager */}
            <Route element={<ProfileLayoutWrapper />}>
              <Route path='/creator/profile/:id' element={<ProfilePage />} />
              <Route path='/brand/profile/:id' element={<BrandProfilePage />} />
            </Route>

            <Route path='/' element={<Founding50 />} />

            {/* Brand dashboard routes with layout */}
            <Route
                path='/brand'
                element={user ? <DashboardLayout /> : <Navigate to='/login' replace />}
            >
            <Route path='dashboard/overview' element={<BrandOverview />} />
            <Route path='dashboard/marketplace' element={<BrandMarketplace />} />
            <Route path='dashboard/bookings' element={<BrandBookings />} />
            <Route path='dashboard/pr-offers' element={<BrandPROffers />} />
            <Route path='dashboard/branded-partnerships' element={<SponsorOpportunities />} />
                {/* The profile/:id route is now handled by the wrapper */}
            </Route>

            {/* Creator dashboard routes with layout */}
            <Route
                path='/creator'
                element={user ? <CreatorDashboardLayout /> : <Navigate to='/login' replace />}
            >
                <Route path='dashboard/overview' element={<CreatorOverview />} />
                <Route path='dashboard/bookings' element={<CreatorBookings />} />
                <Route path='dashboard/campaign-invites' element={<CampaignInvites />} />
                <Route path='dashboard/branded-content' element={<SponsorOffers />} />
                <Route path='dashboard/my-offers' element={<ManagePackages />} />
                <Route path='dashboard/profile' element={<Profile />} />
                <Route path='dashboard/pr-brands' element={<UnifiedBrandDirectory />} />
                <Route path='dashboard/pr-pipeline' element={<PRPipeline />} />
                <Route path='dashboard/payments' element={<PaymentsPage />} />
                <Route path='dashboard/pr-offers' element={<PROffers />} />
                <Route path='dashboard/settings' element={<AccountSettings />} />
                <Route path='first-ad-slot' element={<FirstAdSlot />} />
                <Route path='first-ad-slot/success' element={<FirstAdSlotSuccess />} />
                {/* The profile/:id route is now handled by the wrapper */}
            </Route>

            {/* Fallback 404 */}
            <Route path='*' element={<div>404 Not Found</div>} />
        </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <UserProvider>
                    <AnalyticsProvider>
                        <Elements stripe={stripePromise}>
                            <AppContent />
                            <Analytics />
                        </Elements>
                    </AnalyticsProvider>
                </UserProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;