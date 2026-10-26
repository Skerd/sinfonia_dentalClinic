import {lazy, Suspense} from "react";
import {Route, Routes} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {ClinicConfigProvider} from "@dentalClinicModule/clients/client/public/shared/clinicConfigContext.tsx";
import ClinicLayout from "@dentalClinicModule/clients/client/public/shared/clinicLayout.tsx";

const HomePage = lazy(() => import("@dentalClinicModule/clients/client/public/home/index.tsx"));
const BookPage = lazy(() => import("@dentalClinicModule/clients/client/public/book/index.tsx"));
const ManagePage = lazy(() => import("@dentalClinicModule/clients/client/public/manage/index.tsx"));
const PrivacyPage = lazy(() => import("@dentalClinicModule/clients/client/public/privacy/index.tsx"));
const NotFoundPage = lazy(() => import("@dentalClinicModule/clients/client/public/notFound/index.tsx"));

/**
 * One clinic's site: treatments and team, book as a guest, manage the appointment from the
 * emailed link. Served by the clinic app at the root and by the portal under `/dentists/<clinic>`.
 */
export default function ClinicSiteRoutes() {
    return (
        <ClinicConfigProvider>
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route element={<ClinicLayout />}>
                        <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                        <Route path="book" element={<ErrorBoundary><BookPage /></ErrorBoundary>} />
                        <Route path="manage" element={<ErrorBoundary><ManagePage /></ErrorBoundary>} />
                        <Route path="privacy" element={<ErrorBoundary><PrivacyPage /></ErrorBoundary>} />
                        <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
                    </Route>
                </Routes>
            </Suspense>
        </ClinicConfigProvider>
    );
}
