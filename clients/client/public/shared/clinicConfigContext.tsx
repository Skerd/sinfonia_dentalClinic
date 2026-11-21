import {createContext, useContext, useMemo, type ReactNode} from "react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import type {
    ClinicStorefrontConfigResponse,
    ClinicStorefrontService,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";

export type ClinicConfig = ClinicStorefrontConfigResponse["data"];

type ClinicConfigContextValue = {
    config: ClinicConfig | null;
    loading: boolean;
    /** Set when the clinic has no online booking (or the request failed). */
    unavailable: boolean;
    formatMoney: (amount: number | undefined | null) => string;
};

const ClinicConfigContext = createContext<ClinicConfigContextValue>({
    config: null,
    loading: true,
    unavailable: false,
    formatMoney: () => "",
});

/** The clinic site's settings and treatments; the section asks them ahead for a hovered link into a clinic's site. */
export const CLINIC_CONFIG_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/clinicStorefront/config", cache: true};

/** Loads the clinic, locations, treatments and team once for the whole site. */
export function ClinicConfigProvider({children}: {children: ReactNode}) {
    const {data, loading} = useHttpRequest<ClinicStorefrontConfigResponse>(CLINIC_CONFIG_REQUEST, {}, 1);
    const config = data?.data ?? null;

    const value = useMemo<ClinicConfigContextValue>(() => ({
        config,
        loading,
        unavailable: !loading && !config,
        formatMoney: (amount) => {
            if (amount == null || Number.isNaN(amount)) return "";
            const code = config?.currency.abbreviation;
            return code ? formatCurrency(amount, code, {minimumFractionDigits: 0, maximumFractionDigits: 2}) : String(amount);
        },
    }), [config, loading]);

    return <ClinicConfigContext.Provider value={value}>{children}</ClinicConfigContext.Provider>;
}

export function useClinicConfig(): ClinicConfigContextValue {
    return useContext(ClinicConfigContext);
}

/** Treatments a patient can pick online: public, with someone bookable who does them. */
export function bookableServices(config: ClinicConfig): ClinicStorefrontService[] {
    const offered = new Set(config.practitioners.flatMap((practitioner) => practitioner.services));
    return config.services.filter((service) => offered.has(service._id));
}
