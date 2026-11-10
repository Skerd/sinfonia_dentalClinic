import {render} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {ComponentType} from "react";
import {MemoryRouter} from "react-router-dom";

// Stable across renders, as the real hooks' results are: a fresh object each render would re-run the page's effects.
const {requests, access, answer} = vi.hoisted(() => ({
    requests: [] as {url: string; body: Record<string, unknown>; count: number}[],
    access: {read: {lines: {}}, create: true},
    answer: {data: {data: []}, loading: false, error: null},
}));

vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) =>
        (props: Record<string, unknown>) => <Wrapped {...props} resolveLanguageKey={(key: string) => key}/>,
}));
vi.mock("@coreModule/helpers/hooks/useAccess.ts", () => ({useAccess: () => access}));
vi.mock("@coreModule/helpers/hooks/useHttpRequest.ts", () => ({
    default: (request: {url: string}, body: Record<string, unknown>, count: number) => {
        requests.push({url: request.url, body, count});
        return answer;
    },
}));

import InquiryPlans from "../inquiryPlans.tsx";

describe("an inquiry's quotes", () => {
    // TD-F48: the list route reads `filter`; `filters` (the select route's key) was ignored, so every plan showed
    it("lists only the plans made for the inquiry, through the list route's `filter`", () => {
        render(<MemoryRouter><InquiryPlans inquiryId="inq-1" canQuote/></MemoryRouter>);

        const sent = requests.filter((request) => request.url === "/api/dentalClinic/treatmentPlan" && request.count > 0).at(-1);
        expect(sent?.body.filters).toBeUndefined();
        expect(sent?.body.filter).toMatchObject({rules: [{field: "inquiry", operator: "equals", value: "inq-1"}]});
    });
});
