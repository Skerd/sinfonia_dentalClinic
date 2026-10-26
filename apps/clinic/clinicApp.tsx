import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import {ensureDeviceId} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import ClinicSiteRoutes from "@dentalClinicModule/clients/client/public/shared/clinicSiteRoutes.tsx";

/** Public clinic site: treatments and team, book as a guest, manage the appointment from the emailed link. */
function ClinicApp() {
    ensureDeviceId();

    return (
        <Provider store={store}>
            <LanguageProvider>
                <BrowserRouter>
                    <ClinicSiteRoutes />
                </BrowserRouter>
            </LanguageProvider>
            <Toaster closeButton richColors position="bottom-right" duration={2500} />
        </Provider>
    );
}

export default ClinicApp;
