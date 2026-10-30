import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import MyDentalCases from "./cases/myDentalCases.tsx";
import MyAppointments from "./myAppointments.tsx";

/** The dentists block of the account page: estimate requests first, then appointments. */
function DentistsAccountSection({resolveLanguageKey}: WithLanguageType) {
    return (
        <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold">{resolveLanguageKey("requestsTitle")}</h3>
                <MyDentalCases />
            </section>
            <section className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold">{resolveLanguageKey("appointmentsTitle")}</h3>
                <MyAppointments />
            </section>
        </div>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/dentistsAccountSection.tsx"))(DentistsAccountSection);
