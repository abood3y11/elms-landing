import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SiteFooter, SiteHeader } from './layout/SiteChrome';
import { RouteLine } from './motion/motion';
import HomePage from './pages/HomePage';
import {
  AboutPage, ArticlesPage, BranchesPage, ContactPage, CustomersPage, ExperiencePage, MaintenanceContractsPage, MediaPage, ProductDetailsPage,
  ProductsPage, ProjectsPage, ServicesPage, SparePartsPage,
} from './pages/InfoPages';
import { DataDeletionPage, FacebookCallbackPage, PrivacyPage, TermsPage } from './pages/LegalPages';

const BackgroundElevatorScene = lazy(() => import('./components/BackgroundElevatorScene'));
const ConfiguratorPage = lazy(() => import('./configurator/ConfiguratorPage'));

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="app-shell">
      {/* The decorative 3D background belongs to the home page only; other pages have their own heroes. */}
      {pathname === '/' && <div className="background-3d" aria-hidden="true"><Suspense fallback={null}><BackgroundElevatorScene /></Suspense></div>}
      <RouteLine />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/configure" element={<Suspense fallback={<main className="page"><p>جاري تحميل المصمّم…</p></main>}><ConfiguratorPage /></Suspense>} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/maintenance-contracts" element={<MaintenanceContractsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/spare-parts" element={<SparePartsPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />
        <Route path="/auth/facebook/callback" element={<FacebookCallbackPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
