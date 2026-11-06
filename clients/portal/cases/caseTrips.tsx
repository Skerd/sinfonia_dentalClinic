import {compose} from "redux";
import {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {IconCar, IconPlaneArrival, IconPlaneDeparture} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import type {
    PatientTripResponse,
    PatientTripsResponse,
    PatientTripView,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";
import {PATIENT_TRIP_ACCOMMODATION_MAX, PATIENT_TRIP_FLIGHT_MAX} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/patientTrip/patientTrip.schema-def.ts";

type Props = WithLanguageType & {requestGroup: string};

const TRIPS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/trips"};
const TRIP_DETAILS_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/tripDetails"};

const when = (iso: string) => new Date(iso).toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"});

type TripDetailsProps = Pick<WithLanguageType, "resolveLanguageKey"> & {trip: PatientTripView; onSaved: (trip: PatientTripView) => void};

/** The patient's own part of a trip: their flights and where they stay. */
function TripDetails({trip, onSaved, resolveLanguageKey}: TripDetailsProps) {
    const [arrivalFlight, setArrivalFlight] = useState(trip.arrivalFlight ?? "");
    const [departureFlight, setDepartureFlight] = useState(trip.departureFlight ?? "");
    const [accommodation, setAccommodation] = useState(trip.accommodation ?? "");
    const [saveCount, setSaveCount] = useState(0);
    const {loading: saving} = useHttpRequest<PatientTripResponse>(
        TRIP_DETAILS_REQUEST,
        {trip: trip._id, arrivalFlight, departureFlight, accommodation},
        saveCount,
        true,
        {
            success: (response) => { onSaved(response.data); toast.success(String(resolveLanguageKey("saved"))); },
            error: () => toast.error(String(resolveLanguageKey("saveFailed"))),
        },
    );

    const save = () => setSaveCount((count) => count + 1);

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`arrival-${trip._id}`}>{resolveLanguageKey("arrivalFlight")}</Label>
                <Input id={`arrival-${trip._id}`} value={arrivalFlight} maxLength={PATIENT_TRIP_FLIGHT_MAX} placeholder={String(resolveLanguageKey("flightPlaceholder"))} onChange={(event) => setArrivalFlight(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`departure-${trip._id}`}>{resolveLanguageKey("departureFlight")}</Label>
                <Input id={`departure-${trip._id}`} value={departureFlight} maxLength={PATIENT_TRIP_FLIGHT_MAX} placeholder={String(resolveLanguageKey("flightPlaceholder"))} onChange={(event) => setDepartureFlight(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor={`stay-${trip._id}`}>{resolveLanguageKey("accommodation")}</Label>
                <Input id={`stay-${trip._id}`} value={accommodation} maxLength={PATIENT_TRIP_ACCOMMODATION_MAX} placeholder={String(resolveLanguageKey("accommodationPlaceholder"))} onChange={(event) => setAccommodation(event.target.value)} />
            </div>
            <Button type="button" size="sm" variant="outline" className="self-start" disabled={saving} onClick={save}>{resolveLanguageKey("save")}</Button>
        </div>
    );
}

/** The stays the chosen clinic planned: dates, airport pickup, and the patient's flights and hotel. */
function CaseTrips({requestGroup, resolveLanguageKey}: Props) {
    const [trips, setTrips] = useState<PatientTripView[]>([]);
    const [tripsCount, setTripsCount] = useState(0);
    useHttpRequest<PatientTripsResponse>(TRIPS_REQUEST, {requestGroup}, tripsCount, true, {
        success: (response) => setTrips(response.data),
        error: () => setTrips([]),
    });

    const load = useCallback(() => setTripsCount((count) => count + 1), []);

    useEffect(() => { load(); }, [load, requestGroup]);

    if (!trips.length) return null;
    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{resolveLanguageKey("title")}</h3>
            {trips.map((trip) => {
                const editable = trip.status === "planned" || trip.status === "confirmed";
                return (
                    <div key={trip._id} className="flex flex-col gap-3 rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">
                                {trip.phase ? `${trip.phase}. ` : ""}{trip.phaseTitle ?? trip.clinic.name}
                            </p>
                            <Badge variant="outline">{resolveLanguageKey(`status.${trip.status}`)}</Badge>
                        </div>
                        <ul className="flex flex-col gap-1 text-sm">
                            <li className="flex items-center gap-2"><IconPlaneArrival size={16} className="text-muted-foreground" />{resolveLanguageKey("arrival")} {when(trip.arrivalAt)}</li>
                            <li className="flex items-center gap-2"><IconPlaneDeparture size={16} className="text-muted-foreground" />{resolveLanguageKey("departure")} {when(trip.departureAt)}</li>
                            {trip.transfer ? <li className="flex items-center gap-2"><IconCar size={16} className="text-muted-foreground" />{resolveLanguageKey("transfer")}</li> : null}
                        </ul>
                        {editable ? (
                            <TripDetails
                                trip={trip}
                                resolveLanguageKey={resolveLanguageKey}
                                onSaved={(saved) => setTrips((current) => current.map((entry) => (entry._id === saved._id ? saved : entry)))}
                            />
                        ) : null}
                    </div>
                );
            })}
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/cases/caseTrips.tsx"))(CaseTrips);
