import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {ComponentType} from "react";
import {MemoryRouter, Route, Routes, useLocation} from "react-router-dom";
import type {
    ClinicSlotsResponse,
    ClinicStorefrontConfigResponse,
} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.response.types.ts";
import type {BookAppointmentFormType} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/clinicStorefront/clinicStorefront.forms.ts";
import {clearResponseCache} from "@coreModule/helpers/apiClient/responseCache.ts";

const {apiClientMock} = vi.hoisted(() => ({apiClientMock: vi.fn()}));

vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: apiClientMock}));
vi.mock("sonner", () => ({toast: Object.assign(vi.fn(), {loading: vi.fn(), success: vi.fn(), error: vi.fn(), dismiss: vi.fn()})}));
vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) =>
        (props: Record<string, unknown>) => <Wrapped {...props} languageCode="en-US" resolveLanguageKey={(key: string) => key}/>,
}));

import BookPage from "../index.tsx";
import {ClinicConfigProvider} from "../../shared/clinicConfigContext.tsx";

type Config = ClinicStorefrontConfigResponse["data"];

const service = (id: string, name: string) => ({_id: id, name, slug: id, category: "hygiene" as const, images: [], videos: [], durationMinutes: 45, priceType: "fixed" as const, price: 120});
const location = (id: string, name: string) => ({_id: id, name, timezone: "Europe/Zurich", openingHours: []});
const practitioner = (id: string, displayName: string, services: string[], locations: string[]) => ({_id: id, displayName, role: "dentist" as const, languages: [], services, locations});

const baseConfig: Config = {
    company: {_id: "c1", name: "Smile"},
    currency: {_id: "chf", name: "Swiss franc", symbol: "CHF", abbreviation: "CHF"},
    publicBookingEnabled: true,
    inquiriesEnabled: false,
    profile: {languagesSpoken: [], implantBrands: [], accreditations: [], gallery: []},
    guestBookingAllowed: true,
    requireStaffConfirmation: false,
    patientNoteEnabled: true,
    minNoticeHours: 0,
    maxAdvanceDays: 60,
    cancellationDeadlineHours: 24,
    rescheduleDeadlineHours: 24,
    locations: [location("l1", "Zürich"), location("l2", "Bern")],
    services: [service("s1", "Hygiene"), service("s2", "Whitening"), service("s3", "Nobody does this")],
    practitioners: [
        practitioner("p1", "Dr. Ana", ["s1", "s2"], ["l1"]),
        practitioner("p2", "Dr. Ben", ["s1"], ["l1", "l2"]),
    ],
};

const slots: ClinicSlotsResponse = {
    data: {
        timezone: "Europe/Zurich",
        days: [{date: "2099-01-05", closed: false, slots: [{time: "09:30", startAt: "2099-01-05T08:30:00.000Z", practitioners: ["p1"]}]}],
    },
};

type Handlers = {book?: (body: BookAppointmentFormType) => Promise<unknown>};

function serve(config: Config = baseConfig, {book}: Handlers = {}) {
    apiClientMock.mockImplementation(({url, data}: {url: string; data: BookAppointmentFormType}) => {
        if (url.endsWith("/clinicStorefront/config")) return Promise.resolve({data: {data: config}});
        if (url.endsWith("/clinicStorefront/slots")) return Promise.resolve({data: slots});
        if (url.endsWith("/clinicStorefront/book")) {
            return book ? book(data) : Promise.resolve({data: {data: {manageToken: "tok-1"}}});
        }
        return Promise.reject(new Error(`unexpected ${url}`));
    });
}

const booked = () => apiClientMock.mock.calls
    .filter(([config]) => config.url.endsWith("/clinicStorefront/book"))
    .map(([config]): BookAppointmentFormType => config.data);

function ManagePage() {
    return <p data-testid="manage">{useLocation().search}</p>;
}

function renderAt(query: string) {
    return render(
        <MemoryRouter initialEntries={[`/book${query}`]}>
            <ClinicConfigProvider>
                <Routes>
                    <Route path="/book" element={<BookPage/>}/>
                    <Route path="/manage" element={<ManagePage/>}/>
                </Routes>
            </ClinicConfigProvider>
        </MemoryRouter>,
    );
}

const DETAILS = "?service=s1&location=l1&practitioner=any&date=2099-01-05&time=09:30";

function fillPatient() {
    fireEvent.change(screen.getByLabelText(/^patient\.firstName/), {target: {value: "Ada"}});
    fireEvent.change(screen.getByLabelText(/^patient\.lastName/), {target: {value: "Lovelace"}});
    fireEvent.change(screen.getByLabelText(/^patient\.email/), {target: {value: "ada@example.com"}});
    fireEvent.change(screen.getByLabelText(/^patient\.phone/), {target: {value: "+41 79 000 00 00"}});
}

const acceptPrivacy = () => fireEvent.click(screen.getByRole("checkbox"));
const submit = () => fireEvent.click(screen.getByRole("button", {name: "confirmBooking"}));

describe("dental clinic booking wizard", () => {
    beforeEach(() => {
        apiClientMock.mockReset();
        // Each test serves its own clinic settings; the cached ones of the last test must not answer.
        clearResponseCache();
    });

    it("offers only the treatments someone can be booked for", async () => {
        serve();
        renderAt("");

        expect(await screen.findByText("chooseService")).toBeInTheDocument();
        expect(screen.getByText("Hygiene")).toBeInTheDocument();
        expect(screen.getByText("Whitening")).toBeInTheDocument();
        expect(screen.queryByText("Nobody does this")).not.toBeInTheDocument();
    });

    it("skips the location and dentist steps when only one fits the treatment", async () => {
        serve();
        renderAt("");

        fireEvent.click(await screen.findByText("Whitening"));

        // Only Dr. Ana whitens, and only in Zürich: straight to the time.
        expect(await screen.findByText("chooseTime")).toBeInTheDocument();
        expect(screen.getByText("Dr. Ana")).toBeInTheDocument();
        await waitFor(() => expect(apiClientMock).toHaveBeenCalledWith(expect.objectContaining({
            url: "/api/dentalClinic/clinicStorefront/slots",
            data: expect.objectContaining({service: "s2", location: "l1", practitioner: "p1"}),
        })));
    });

    it("asks for the location, then offers anyone or each dentist working there", async () => {
        serve();
        renderAt("?service=s1");

        fireEvent.click(await screen.findByText("Zürich"));

        expect(await screen.findByText("choosePractitioner")).toBeInTheDocument();
        expect(screen.getByText("anyone")).toBeInTheDocument();
        expect(screen.getByText("Dr. Ana")).toBeInTheDocument();
        expect(screen.getByText("Dr. Ben")).toBeInTheDocument();
    });

    it("picks the only dentist at a location without asking", async () => {
        serve();
        renderAt("?service=s1");

        // Only Dr. Ben works in Bern.
        fireEvent.click(await screen.findByText("Bern"));

        expect(await screen.findByText("chooseTime")).toBeInTheDocument();
        expect(screen.getByText("Dr. Ben")).toBeInTheDocument();
        expect(screen.queryByText("Dr. Ana")).not.toBeInTheDocument();
    });

    it("clears every later choice when an earlier one is changed", async () => {
        serve();
        renderAt(DETAILS);
        expect(await screen.findByText("yourDetails")).toBeInTheDocument();

        // The first "change" link belongs to the treatment row of the summary.
        fireEvent.click(screen.getAllByRole("button", {name: "change"})[0]!);

        expect(await screen.findByText("chooseService")).toBeInTheDocument();
        expect(screen.queryByText("when")).not.toBeInTheDocument();
    });

    it("books with the patient, the trimmed note and no dentist for 'anyone', then opens the manage page", async () => {
        serve();
        renderAt(DETAILS);
        await screen.findByText("yourDetails");

        fillPatient();
        fireEvent.change(screen.getByLabelText(/^note/), {target: {value: "  Wheelchair access please  "}});
        acceptPrivacy();
        submit();

        expect(await screen.findByTestId("manage")).toHaveTextContent("?token=tok-1&booked=1");
        const [body] = booked();
        expect(body).toMatchObject({
            service: "s1",
            location: "l1",
            date: "2099-01-05",
            time: "09:30",
            patient: {firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", phone: "+41 79 000 00 00"},
            note: "Wheelchair access please",
            acceptPrivacy: true,
        });
        expect(body?.practitioner).toBeUndefined();
        expect(body?.idempotencyKey).toEqual(expect.any(String));
    });

    it("leaves the note out when the clinic does not take notes", async () => {
        serve({...baseConfig, patientNoteEnabled: false});
        renderAt(DETAILS);
        await screen.findByText("yourDetails");

        expect(screen.queryByLabelText(/^note/)).not.toBeInTheDocument();
        fillPatient();
        acceptPrivacy();
        submit();

        await screen.findByTestId("manage");
        expect(booked()[0]).not.toHaveProperty("note");
    });

    it("sends nothing until the patient details are valid and the privacy notice is accepted", async () => {
        serve();
        renderAt(DETAILS);
        await screen.findByText("yourDetails");

        submit();
        expect(screen.getByLabelText(/^patient\.firstName/)).toHaveAttribute("aria-invalid", "true");

        fillPatient();
        submit();
        expect(await screen.findByRole("alert")).toHaveTextContent("acceptPrivacyRequired");
        expect(booked()).toEqual([]);
    });

    it("sends staff-confirmed clinics a request rather than a booking", async () => {
        serve({...baseConfig, requireStaffConfirmation: true});
        renderAt(DETAILS);

        expect(await screen.findByRole("button", {name: "requestAppointment"})).toBeInTheDocument();
        expect(screen.getByText("reviewedHint")).toBeInTheDocument();
    });

    it("sends the patient back to the times when the slot was just taken, and books the retry as a new appointment", async () => {
        const book = vi.fn()
            .mockRejectedValueOnce({response: {status: 409, data: {error_code: "appointment_slot_unavailable", message: "That time was just taken."}}})
            .mockResolvedValueOnce({data: {data: {manageToken: "tok-2"}}});
        serve(baseConfig, {book});
        renderAt(DETAILS);
        await screen.findByText("yourDetails");
        fillPatient();
        acceptPrivacy();
        submit();

        expect(await screen.findByText("chooseTime")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("That time was just taken.");

        fireEvent.click(await screen.findByRole("button", {name: "09:30"}));
        await screen.findByText("yourDetails");
        // The details and the consent are kept; only the time was asked again.
        expect(screen.getByRole("checkbox")).toBeChecked();
        submit();

        expect(await screen.findByTestId("manage")).toHaveTextContent("?token=tok-2&booked=1");
        const [first, retry] = booked();
        expect(retry?.patient.firstName).toBe("Ada");
        expect(retry?.idempotencyKey).not.toBe(first?.idempotencyKey);
    });

    it("retries a booking whose response was lost (server error) with the same key", async () => {
        const book = vi.fn()
            .mockRejectedValueOnce({response: {status: 503, data: {message: "Try again"}}})
            .mockResolvedValueOnce({data: {data: {manageToken: "tok-3"}}});
        serve(baseConfig, {book});
        renderAt(DETAILS);
        await screen.findByText("yourDetails");
        fillPatient();
        acceptPrivacy();
        submit();

        expect(await screen.findByRole("alert")).toHaveTextContent("Try again");
        expect(screen.getByText("yourDetails")).toBeInTheDocument();
        submit();

        await screen.findByTestId("manage");
        const [first, retry] = booked();
        expect(retry?.idempotencyKey).toBe(first?.idempotencyKey);
    });
});
