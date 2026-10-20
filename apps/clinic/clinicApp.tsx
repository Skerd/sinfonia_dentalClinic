import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {lazy, Suspense} from "react";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {ensureDeviceId} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import {ClinicConfigProvider} from "@dentalClinicModule/clients/client/public/shared/clinicConfigContext.tsx";
import ClinicLayout from "@dentalClinicModule/clients/client/public/shared/clinicLayout.tsx";

const HomePage = lazy(() => import("@dentalClinicModule/clients/client/public/home/index.tsx"));
const BookPage = lazy(() => import("@dentalClinicModule/clients/client/public/book/index.tsx"));
const ManagePage = lazy(() => import("@dentalClinicModule/clients/client/public/manage/index.tsx"));
const PrivacyPage = lazy(() => import("@dentalClinicModule/clients/client/public/privacy/index.tsx"));
const NotFoundPage = lazy(() => import("@dentalClinicModule/clients/client/public/notFound/index.tsx"));

/** Public clinic site: treatments and team, book as a guest, manage the appointment from the emailed link. */
function ClinicApp() {
    ensureDeviceId();

    return (
        <Provider store={store}>
            <LanguageProvider>
                <BrowserRouter>
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
                </BrowserRouter>
            </LanguageProvider>
            <Toaster closeButton richColors position="bottom-right" duration={2500} />
        </Provider>
    );
}

export default ClinicApp;
