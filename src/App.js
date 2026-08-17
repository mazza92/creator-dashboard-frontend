import React, { useContext, useEffect, useCallback, lazy, Suspense } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { UserContext, UserProvider } from './contexts/UserContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Analytics } from '@vercel/analytics/react';
import IndexNowInitializer from './components/IndexNowInitializer';
import IndexNowTest from './components/IndexNowTest';
import QueryParamRedirect from './components/QueryParamRedirect';
import CreatorHomeRedirect from './components/CreatorHomeRedirect';
import { loginUrlWithReturn } from './utils/upgradeDeeplink';
import BrandOnboardingForm from './components/forms/BrandOnboardingForm';
// eslint-disable-next-line no-unused-vars
import CreatorOnboardingForm from './components/forms/CreatorOnboardingForm';
import Signup from './components/forms/Signup';
import SuccessPage from './components/forms/SuccessPage';
import DashboardLayout from './Layouts/DashboardLayout';
import CreatorDashboardLayout from './Layouts/CreatorDashboardLayout';
import BrandPROffers from './brand-portal/BrandPROffers';
import BrandMarketplace from './brand-portal/BrandMarketplace';
import PRHunter from './brand-portal/PRHunter';
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
import LandingPage from './cra-pages/LandingPage';
import AboutPage from './cra-pages/AboutPage';
// Blog routes - Next.js has /app/blog, but keep CRA routes for dev/fallback
import BlogPage from './cra-pages/BlogPage';
import BlogPost from './cra-pages/BlogPost';
import ContactPage from './cra-pages/ContactPage';
import PrivacyPolicy from './cra-pages/PrivacyPolicy';
import TermsOfService from './cra-pages/TermsOfService';
import Unsubscribed from './cra-pages/Unsubscribed';
import BrandPRPackagesPage from './cra-pages/BrandPRPackagesPage';
import LandFirstPRPackage from './cra-pages/LandFirstPRPackage';
// eslint-disable-next-line no-unused-vars
import LandingPageLayout from './Layouts/LandingPageLayout';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
// Homepage - Next.js has /app/page.js, but keep CRA route for development and as fallback
// eslint-disable-next-line no-unused-vars
import Founding50 from './cra-pages/Founding50';
import { NotificationProvider } from './contexts/NotificationContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import PaymentsPage from './creator-portal/PaymentsPage';
import CampaignInvites from './creator-portal/CampaignInvites';
import FirstAdSlot from './creator-portal/FirstAdSlot';
import PROffers from './creator-portal/PROffers';
import BrandSubmitPage from './cra-pages/BrandSubmitPage';
import PRReady from './creator-portal/PRReady';
import PublicMediaKit from './cra-pages/PublicMediaKit';
import FirstAdSlotSuccess from './creator-portal/FirstAdSlotSuccess';
import VerifyEmailPending from './components/VerifyEmailPending';
import VerifyEmail from './components/VerifyEmail';
import ResendVerification from './components/ResendVerification';
import LoadingSpinner from './components/LoadingSpinner';
import StripeSuccess from './components/StripeSuccess';
import api from './config/api';
// Creator profiles - Next.js has /app/c/[username], but keep CRA route for dev/fallback
import PublicCreatorProfile from './components/PublicCreatorProfile';
import CreatorSignup from './components/forms/CreatorSignup';
import CreatorOnboarding from './components/forms/CreatorOnboarding';
import ProfileLayoutWrapper from './Layouts/ProfileLayoutWrapper';
import { AuthProvider } from './contexts/AuthContext';
import Marketplace from './cra-pages/Marketplace';
import SubscriptionSuccess from './creator-portal/SubscriptionSuccess';
import SubscriptionCancel from './creator-portal/SubscriptionCancel';
import AccountSettings from './creator-portal/AccountSettings';
// Brand pages - Next.js has /app/brand/[slug], but keep CRA route for dev/fallback
import PublicBrandPage from './cra-pages/PublicBrandPage';
// Public directory pages - Next.js has /app/directory, but keep CRA routes for dev/fallback
import SkincareDirectory from './cra-pages/SkincareDirectory';
import KBeautyDirectory from './cra-pages/KBeautyDirectory';
import AustraliaDirectory from './cra-pages/AustraliaDirectory';
import NotFound from './cra-pages/NotFound';

// Lazy-loaded heavy components for code splitting (reduces initial bundle ~40%)
// These load on-demand when the route is accessed
const ForYou = lazy(() => import('./cra-pages/ForYou'));
const Pool = lazy(() => import('./cra-pages/Pool'));
const CreatorOverview = lazy(() => import('./creator-portal/CreatorOverview'));
const BrandOverview = lazy(() => import('./components/BrandOverview'));
const MediaKit = lazy(() => import('./creator-portal/MediaKit'));
const PortfolioBuilder = lazy(() => import('./creator-portal/PortfolioBuilder'));
const ContentHub = lazy(() => import('./creator-portal/ContentHub'));
const PRPipeline = lazy(() => import('./creator-portal/PRPipeline'));
const UnifiedBrandDirectory = lazy(() => import('./cra-pages/UnifiedBrandDirectory'));

// Admin pages - rarely accessed, lazy load
const BrandAdmin = lazy(() => import('./admin/BrandAdmin'));
const AdminReports = lazy(() => import('./admin/AdminReports'));
const AdminEmail = lazy(() => import('./admin/AdminEmail'));
const AdminOpportunities = lazy(() => import('./admin/AdminOpportunities'));
const CreatorsAdmin = lazy(() => import('./admin/CreatorsAdmin'));

// Skeleton components for Suspense fallbacks (non-lazy - needed immediately)
import { ForYouSkeleton, DashboardOverviewSkeleton } from './components/Skeleton';

// Suspense wrapper with loading fallback for lazy routes
const LazyRoute = ({ children, fallback, skeleton }) => (
  <Suspense fallback={skeleton || fallback || <LoadingSpinner />}>
    {children}
  </Suspense>
);

const stripePromise = loadStripe('pk_test_51RWy7PDAK7yV5SICch3oyllPQv3FJqZGx8QUWySdMVWPQkzE8ND5HMfRbXYX0ZYtiaDyCmVcWZKnoQqEd5eO3nC9003fK6K3fQ');

// Public media kit wrapper - extracts username from route params
function PublicMediaKitWrapper() {
    const { username } = useParams();
    return <PublicMediaKit username={username} />;
}

// Role-aware onboarding router - brands complete onboarding during registration,
// so if they end up here, redirect them to their dashboard
function OnboardingRouter() {
    const { user, loading } = useContext(UserContext);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    // If user is a brand with a brand_id, they've completed onboarding
    // Redirect them to their dashboard
    if (user?.role === 'brand' && user?.brand_id) {
        return <Navigate to="/brand/dashboard/overview" replace />;
    }

    // If brand user but no brand_id, show brand onboarding form
    if (user?.role === 'brand' && !user?.brand_id) {
        return <BrandOnboardingForm />;
    }

    // For creators (or no user), show the creator onboarding
    return <CreatorOnboarding />;
}

function AppContent() {
    const { user, loading } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const isAppHost = window.location.hostname.startsWith('app.');
        if (!isAppHost) return;

        const appPrefixes = [
            '/login',
            '/register',
            '/marketplace',
            '/payment',
            '/forgot-password',
            '/reset-password',
            '/verify-email',
            '/verify-email-pending',
            '/resend-verification',
            '/stripe',
            '/onboarding',
            '/supply',
            '/admin',
            '/creator',
            '/brand',
            '/c/',
            '/dashboard',
            '/for-brands',
            // Note: /directory removed - served by Next.js on newcollab.co for SEO
        ];

        const isAppRoute = appPrefixes.some(prefix =>
            location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
        );

        if (!isAppRoute) {
            const target = `https://newcollab.co${location.pathname}${location.search}`;
            window.location.replace(target);
        }
    }, [location.pathname, location.search]);

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
            navigate('/brand/dashboard/overview', { replace: true });
        } catch (error) {
            console.error('🔥 Error completing Stripe payment:', error.response?.data || error);
            navigate('/brand/dashboard/overview', { replace: true });
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
                '/kit/',
                '/for-brands',
                '/land-your-first-pr-package',
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
                navigate(loginUrlWithReturn(location), { replace: true });
            } else if (user) {
                const correctBasePath = user.role === 'creator' ? '/creator/dashboard/for-you' : '/brand/dashboard/overview';
                
                // A brand user is allowed to visit a creator's profile page.
                const isViewingCreatorProfileAsBrand = user.role === 'brand' && location.pathname.startsWith('/creator/profile/');

                // Check if we just completed onboarding - if so, skip incomplete profile check
                // This prevents redirect loop when user context hasn't updated yet
                const justCompletedOnboarding = sessionStorage.getItem('justCompletedOnboarding');

                // Also check if user just registered (pendingVerificationEmail is set)
                // Brand users complete onboarding during registration, so don't redirect them
                const justRegistered = localStorage.getItem('pendingVerificationEmail');

                // Check if user has incomplete profile (creator_id is null for creators)
                // Only check if we're not in a loading state to avoid premature redirects
                // Skip this check if we just completed onboarding (user context is updating)
                // For brands: they complete onboarding during registration, so don't redirect them
                // The brand_id might be in session but not in profile response - don't rely on it
                const hasIncompleteProfile = (user.role === 'creator' && !user.creator_id);
                
                // If user has incomplete profile and is not on onboarding, redirect to onboarding
                // But skip this if we just completed onboarding (give user context time to update)
                // Also skip for email verification routes - users need to verify email after registration
                if (hasIncompleteProfile && !justCompletedOnboarding &&
                    !location.pathname.startsWith('/onboarding') &&
                    !location.pathname.startsWith('/register/creator') &&
                    !location.pathname.startsWith('/register/brand') &&
                    !location.pathname.startsWith('/verify-email') &&
                    !location.pathname.startsWith('/resend-verification')) {
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
                        navigate('/brand/dashboard/overview', { replace: true });
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

    if (loading && isProtectedRoute) return <LoadingSpinner fullScreen />;

    const isPayPalFlow = location.pathname === '/payment-success' && location.search.includes('paymentId');

    // Determine if header should be hidden for immersive/focused routes
    // eslint-disable-next-line no-unused-vars
    const shouldHideHeader = location.pathname.startsWith('/c/')
        || location.pathname.startsWith('/onboarding')
        || location.pathname.startsWith('/register/creator');

    return (
        <>
            <IndexNowInitializer />
            <QueryParamRedirect />
            <Routes>
            {/* Public routes always available */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Signup />} />
            <Route path='/register/brand' element={<BrandOnboardingForm />} />
            <Route path='/register/creator' element={<CreatorSignup />} />
            {/* About, Contact, Privacy, Terms - Still on CRA (Next.js has placeholders) */}
            <Route path='/about' element={<AboutPage />} />
            <Route path='/for-brands' element={<BrandSubmitPage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            <Route path='/terms-of-service' element={<TermsOfService />} />
            <Route path='/unsubscribed' element={<Unsubscribed />} />
            {/* Blog routes - Next.js has /app/blog, but keep CRA routes for dev/fallback */}
            <Route path='/blog' element={<BlogPage />} />
            <Route path='/blog/:slug' element={<BlogPost />} />
            {/* Brand PR Packages - Next.js has /app/brands/pr-packages, but keep CRA route for dev/fallback */}
            <Route path='/brands/pr-packages' element={<BrandPRPackagesPage />} />
            <Route path='/brands/send-pr-packages' element={<BrandPRPackagesPage />} />
            {/* Google Ads Landing Page */}
            <Route path='/land-your-first-pr-package' element={<LandFirstPRPackage />} />
            {/* /f50 redirects to / (handled by vercel.json redirect, / is Next.js) */}
            <Route path='/success' element={<SuccessPage />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='/payment' element={<Payment />} />
            <Route path='/payment-success' element={isPayPalFlow ? <PaymentSuccess /> : <Navigate to='/brand/dashboard/overview' replace />} />
            <Route path='/payment-failed' element={<PaymentFailed />} />
            <Route path='/verify-email-pending' element={<VerifyEmailPending />} />
            <Route path='/verify-email' element={<VerifyEmail />} />
            <Route path='/resend-verification' element={<ResendVerification />} />
            <Route path='/stripe/success' element={<StripeSuccess />} />
            <Route path='/stripe/reauth' element={<StripeSuccess />} />
            {/* Marketplace - Still on CRA (Next.js has placeholder) */}
            <Route path='/marketplace' element={<Marketplace />} />
            {/* Directory routes - Next.js has /app/directory, but keep CRA routes for dev/fallback */}
            <Route
                path='/directory'
                element={
                    user ? <Navigate to='/creator/dashboard/for-you' replace /> : <LazyRoute><UnifiedBrandDirectory /></LazyRoute>
                }
            />
            <Route path='/directory/skincare' element={<SkincareDirectory />} />
            <Route path='/directory/k-beauty' element={<KBeautyDirectory />} />
            <Route path='/directory/australia' element={<AustraliaDirectory />} />
            {/* Brand pages - Next.js has /app/brand/[slug], but keep CRA route for dev/fallback */}
            <Route path='/brand/:slug' element={<PublicBrandPage />} />
            {/* Creator profiles - Next.js has /app/c/[username], but keep CRA route for dev/fallback */}
            <Route path='/c/:username' element={<PublicCreatorProfile />} />
            {/* Public media kit page */}
            <Route path='/kit/:username' element={<PublicMediaKitWrapper />} />
            <Route path='/register-new' element={<CreatorSignup />} />
            <Route path='/onboarding' element={<OnboardingRouter />} />
            <Route path='/test-indexnow' element={<IndexNowTest />} />
            <Route path='/creator/dashboard/subscription/success' element={<SubscriptionSuccess />} />
            <Route path='/creator/dashboard/subscription/cancel' element={<SubscriptionCancel />} />

            {/* PR Hunter - Internal Tool (has its own login) */}
            <Route path='/supply' element={<PRHunter />} />
            <Route path='/admin/brands' element={<LazyRoute><BrandAdmin /></LazyRoute>} />
            <Route path='/admin/creators' element={<LazyRoute><CreatorsAdmin /></LazyRoute>} />
            <Route path='/admin/reports' element={<LazyRoute><AdminReports /></LazyRoute>} />
            <Route path='/admin/email' element={<LazyRoute><AdminEmail /></LazyRoute>} />
            <Route path='/admin/opportunities' element={<LazyRoute><AdminOpportunities /></LazyRoute>} />

            {/* Standalone routes for profiles, wrapped in a layout manager */}
            <Route element={<ProfileLayoutWrapper />}>
              <Route path='/creator/profile/:id' element={<ProfilePage />} />
              <Route path='/brand/profile/:id' element={<BrandProfilePage />} />
            </Route>

            {/* Dashboard redirect - handles email links pointing to /dashboard */}
            <Route
                path='/dashboard'
                element={
                    loading
                        ? <LoadingSpinner fullScreen />
                        : user
                            ? <Navigate to={user.role === 'brand' ? '/brand/dashboard/overview' : '/creator/dashboard/for-you'} replace />
                            : <Navigate to={loginUrlWithReturn(location)} replace />
                }
            />

            {/* Homepage - Next.js handles in production, but keep CRA route for dev/fallback */}
            <Route path='/' element={<LandingPageLayout hideFooter><LandingPage /></LandingPageLayout>} />

            {/* Brand dashboard routes with layout */}
            <Route
                path='/brand'
                element={user ? <DashboardLayout /> : <Navigate to={loginUrlWithReturn(location)} replace />}
            >
            <Route index element={<Navigate to='/brand/dashboard/overview' replace />} />
            <Route path='dashboard' element={<Navigate to='/brand/dashboard/overview' replace />} />
            <Route path='dashboard/overview' element={<LazyRoute skeleton={<DashboardOverviewSkeleton />}><BrandOverview /></LazyRoute>} />
            <Route path='dashboard/marketplace' element={<BrandMarketplace />} />
            <Route path='dashboard/bookings' element={<BrandBookings />} />
            <Route path='dashboard/pr-offers' element={<BrandPROffers />} />
            <Route path='dashboard/pr-hunter' element={<PRHunter />} />
            <Route path='dashboard/branded-partnerships' element={<SponsorOpportunities />} />
                {/* The profile/:id route is now handled by the wrapper */}
            </Route>

            {/* Creator dashboard routes with layout */}
            <Route
                path='/creator'
                element={user ? <CreatorDashboardLayout /> : <Navigate to={loginUrlWithReturn(location)} replace />}
            >
                <Route index element={<CreatorHomeRedirect />} />
                <Route path='dashboard' element={<CreatorHomeRedirect />} />
                <Route path='dashboard/overview' element={<LazyRoute skeleton={<DashboardOverviewSkeleton />}><CreatorOverview /></LazyRoute>} />
                <Route path='dashboard/bookings' element={<CreatorBookings />} />
                <Route path='dashboard/campaign-invites' element={<CampaignInvites />} />
                <Route path='dashboard/branded-content' element={<SponsorOffers />} />
                <Route path='dashboard/my-offers' element={<ManagePackages />} />
                <Route path='dashboard/profile' element={<Profile />} />
                <Route path='dashboard/pr-brands' element={<LazyRoute><UnifiedBrandDirectory /></LazyRoute>} />
                <Route path='dashboard/pr-pipeline' element={<LazyRoute><PRPipeline /></LazyRoute>} />
                <Route path='dashboard/payments' element={<PaymentsPage />} />
                <Route path='dashboard/for-you' element={<LazyRoute skeleton={<ForYouSkeleton />}><ForYou /></LazyRoute>} />
                <Route path='dashboard/pr-ready' element={<PRReady />} />
                <Route path='dashboard/pool' element={<LazyRoute><Pool /></LazyRoute>} />
                <Route path='dashboard/media-kit' element={<LazyRoute><MediaKit /></LazyRoute>} />
                <Route path='dashboard/my-kit' element={<LazyRoute><PortfolioBuilder currentUser={user} /></LazyRoute>} />
                <Route path='dashboard/content-hub' element={<LazyRoute><ContentHub /></LazyRoute>} />
                <Route path='dashboard/settings' element={<AccountSettings />} />
                <Route path='dashboard/brand/:slug' element={<PublicBrandPage />} />
                <Route path='first-ad-slot' element={<FirstAdSlot />} />
                <Route path='first-ad-slot/success' element={<FirstAdSlotSuccess />} />
                {/* The profile/:id route is now handled by the wrapper */}
            </Route>

            {/* Fallback 404 */}
            <Route path='*' element={<NotFound />} />
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