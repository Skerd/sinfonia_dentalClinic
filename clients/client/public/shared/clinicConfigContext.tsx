import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from "react";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
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

/** Loads the clinic, locations, treatments and team once for the whole site. */
export function ClinicConfigProvider({children}: {children: ReactNode}) {
    const [config, setConfig] = useState<ClinicConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        apiClient
            .post<ClinicStorefrontConfigResponse>("/api/dentalClinic/clinicStorefront/config", {})
            .then((res) => {
                if (!cancelled) setConfig(res.data.data);
            })
            .catch(() => {
                if (!cancelled) setConfig(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

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
