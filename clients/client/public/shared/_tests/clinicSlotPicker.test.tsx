import {render} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import type {ComponentType} from "react";

// Stable across renders, as the real hooks' results are.
const {requests, answer, clinic} = vi.hoisted(() => ({
    requests: [] as {url: string; body: Record<string, unknown>; count: number}[],
    answer: {data: null, loading: true, error: null},
    clinic: {config: {locations: [{_id: "loc-akl", timezone: "Pacific/Auckland"}]}},
}));

vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) =>
        (props: Record<string, unknown>) => <Wrapped {...props} resolveLanguageKey={(key: string) => key} languageCode="en-GB"/>,
}));
vi.mock("@coreModule/helpers/hooks/useHttpRequest.ts", () => ({
    default: (request: {url: string}, body: Record<string, unknown>, count: number) => {
        requests.push({url: request.url, body, count});
        return answer;
    },
}));
vi.mock("../clinicConfigContext.tsx", () => ({useClinicConfig: () => clinic}));

import ClinicSlotPicker from "../clinicSlotPicker.tsx";

afterEach(() => {
    vi.useRealTimers();
});

describe("clinic slot picker", () => {
    // TD-B163: the first day shown was the browser's day, not the clinic's
    it("starts on today at the clinic location, not in the patient's browser", () => {
        // 12:00 UTC on 10 November is already 11 November in Auckland
        vi.useFakeTimers({toFake: ["Date"]});
        vi.setSystemTime(new Date("2026-11-10T12:00:00Z"));

        render(<ClinicSlotPicker service="svc" location="loc-akl" onPick={() => undefined}/>);

        const sent = requests.filter((request) => request.count > 0).at(-1);
        expect(sent?.body).toMatchObject({location: "loc-akl", fromDate: "2026-11-11", days: 7});
    });
});
