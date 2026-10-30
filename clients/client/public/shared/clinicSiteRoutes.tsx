import {lazy, Suspense} from "react";
import {Route, Routes} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {ClinicConfigProvider} from "@dentalClinicModule/clients/client/public/shared/clinicConfigContext.tsx";
import SitePageLayout from "@coreModule/clients/portal/shared/sitePageLayout.tsx";

const HomePage = lazy(() => import("@dentalClinicModule/clients/client/public/home/index.tsx"));
const TreatmentPage = lazy(() => import("@dentalClinicModule/clients/client/public/treatment/index.tsx"));
const BookPage = lazy(() => import("@dentalClinicModule/clients/client/public/book/index.tsx"));
const RequestPage = lazy(() => import("@dentalClinicModule/clients/client/public/request/index.tsx"));
const ManagePage = lazy(() => import("@dentalClinicModule/clients/client/public/manage/index.tsx"));
const PrivacyPage = lazy(() => import("@dentalClinicModule/clients/client/public/privacy/index.tsx"));
const NotFoundPage = lazy(() => import("@dentalClinicModule/clients/client/public/notFound/index.tsx"));

/**
 * One clinic's site: treatment pages, team, book as a guest, ask for an estimate, manage the appointment from the
 * emailed link. The portal serves it under `/dentists` on the clinic's host, `/dentists/<clinic>` on the apex.
 */
export default function ClinicSiteRoutes() {
    return (
        <ClinicConfigProvider>
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route element={<SitePageLayout />}>
                        <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                        <Route path="treatments/:serviceId" element={<ErrorBoundary><TreatmentPage /></ErrorBoundary>} />
                        <Route path="book" element={<ErrorBoundary><BookPage /></ErrorBoundary>} />
                        <Route path="request" element={<ErrorBoundary><RequestPage /></ErrorBoundary>} />
                        <Route path="manage" element={<ErrorBoundary><ManagePage /></ErrorBoundary>} />
                        <Route path="privacy" element={<ErrorBoundary><PrivacyPage /></ErrorBoundary>} />
                        <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
                    </Route>
                </Routes>
            </Suspense>
        </ClinicConfigProvider>
    );
}
