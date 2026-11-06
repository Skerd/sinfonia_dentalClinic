import {compose} from "redux";
import {useState} from "react";
import {IconHeartbeat} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {ToggleGroup, ToggleGroupItem} from "@coreModule/components/ui/toggle-group.tsx";
import {
    MEDICAL_HISTORY_ANSWERS,
    MEDICAL_HISTORY_DETAIL_MAX,
    MEDICAL_HISTORY_MEDICATIONS_MAX,
    MEDICAL_HISTORY_QUESTIONS,
    type MedicalHistoryAnswer,
    type MedicalHistoryQuestion,
} from "armonia/src/modules/dentalClinic/constants/index.ts";
import type {PatientCase, PatientCaseResponse} from "armonia/src/modules/dentalClinic/api/dentalClinic/public/patientPortal/patientPortal.response.types.ts";

const MEDICAL_HISTORY_REQUEST: HttpRequest = {method: "POST", url: "/api/dentalClinic/patientPortal/medicalHistory"};

type Props = WithLanguageType & {
    patientCase: PatientCase;
    /** The questionnaire was sent: the case comes back with it. */
    onSaved: (updated: PatientCase) => void;
};

type Row = {answer?: MedicalHistoryAnswer; detail: string};

/**
 * The medical history for this request, filled in once for every clinic of it: what a dentist
 * must know before quoting implants or surgery. Signed with the patient's typed name.
 */
function CaseMedicalHistory({patientCase, onSaved, resolveLanguageKey}: Props) {
    const sent = patientCase.medicalHistory;
    const [editing, setEditing] = useState(false);
    const [rows, setRows] = useState<Record<MedicalHistoryQuestion, Row>>(() => Object.fromEntries(
        MEDICAL_HISTORY_QUESTIONS.map((question) => {
            const previous = sent?.answers.find((row) => row.question === question);
            return [question, {answer: previous?.answer, detail: previous?.detail ?? ""}];
        }),
    ) as Record<MedicalHistoryQuestion, Row>);
    const [medications, setMedications] = useState(sent?.medications ?? "");
    const [signedName, setSignedName] = useState("");
    const [saveCount, setSaveCount] = useState(0);
    const complete = MEDICAL_HISTORY_QUESTIONS.every((question) => rows[question].answer) && signedName.trim().length >= 3;

    const historyBody = {
        requestGroup: patientCase.requestGroup,
        answers: MEDICAL_HISTORY_QUESTIONS.map((question) => ({
            question,
            answer: rows[question].answer,
            ...(rows[question].answer !== "no" && rows[question].detail.trim() ? {detail: rows[question].detail.trim()} : {}),
        })),
        ...(medications.trim() ? {medications: medications.trim()} : {}),
        signedName: signedName.trim(),
    };
    const saveRequest = useHttpRequest<PatientCaseResponse>(MEDICAL_HISTORY_REQUEST, historyBody, saveCount, true, {
        success: (response) => {
            onSaved(response.data);
            setEditing(false);
        },
    });
    const saving = saveRequest.loading;
    const failed = !!saveRequest.error;
    const save = () => setSaveCount((count) => count + 1);

    if (!editing) {
        return (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                    <IconHeartbeat size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col">
                        <p className="text-sm font-medium">{resolveLanguageKey("title")}</p>
                        <p className="text-xs text-muted-foreground">
                            {sent
                                ? resolveLanguageKey("sentOn").replace("{date}", new Date(sent.submittedAt).toLocaleDateString())
                                : resolveLanguageKey("prompt")}
                        </p>
                    </div>
                </div>
                <Button type="button" size="sm" variant={sent ? "outline" : "default"} onClick={() => setEditing(true)}>
                    {resolveLanguageKey(sent ? "update" : "fillIn")}
                </Button>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{resolveLanguageKey("title")}</p>
                <p className="text-xs text-muted-foreground">{resolveLanguageKey("intro")}</p>
            </div>
            <ul className="flex flex-col divide-y">
                {MEDICAL_HISTORY_QUESTIONS.map((question) => {
                    const row = rows[question];
                    return (
                        <li key={question} className="flex flex-col gap-2 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-sm">{resolveLanguageKey(`question.${question}`)}</span>
                                <ToggleGroup
                                    type="single"
                                    spacing={0}
                                    variant="outline"
                                    size="sm"
                                    value={row.answer ?? ""}
                                    onValueChange={(next) => {
                                        if (!next) return;
                                        setRows((current) => ({...current, [question]: {...current[question], answer: next as MedicalHistoryAnswer}}));
                                    }}
                                    aria-label={String(resolveLanguageKey(`question.${question}`))}
                                >
                                    {MEDICAL_HISTORY_ANSWERS.map((answer) => (
                                        <ToggleGroupItem key={answer} value={answer} className="px-3">{resolveLanguageKey(`answer.${answer}`)}</ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                            {row.answer && row.answer !== "no" ? (
                                <Input
                                    value={row.detail}
                                    maxLength={MEDICAL_HISTORY_DETAIL_MAX}
                                    placeholder={String(resolveLanguageKey("detailPlaceholder"))}
                                    onChange={(event) => setRows((current) => ({...current, [question]: {...current[question], detail: event.target.value}}))}
                                />
                            ) : null}
                        </li>
                    );
                })}
            </ul>
            <div className="flex flex-col gap-2">
                <Label htmlFor="medical-history-medications">{resolveLanguageKey("medications")}</Label>
                <Textarea
                    id="medical-history-medications"
                    value={medications}
                    maxLength={MEDICAL_HISTORY_MEDICATIONS_MAX}
                    placeholder={String(resolveLanguageKey("medicationsPlaceholder"))}
                    onChange={(event) => setMedications(event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="medical-history-signature">{resolveLanguageKey("signature")}</Label>
                <Input id="medical-history-signature" value={signedName} onChange={(event) => setSignedName(event.target.value)} placeholder={String(resolveLanguageKey("signaturePlaceholder"))} />
                <p className="text-xs text-muted-foreground">{resolveLanguageKey("signatureHint")}</p>
            </div>
            {failed ? <p className="text-sm text-destructive">{resolveLanguageKey("failed")}</p> : null}
            <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={!complete || saving} onClick={() => void save()}>{resolveLanguageKey("send")}</Button>
                <Button type="button" variant="ghost" disabled={saving} onClick={() => setEditing(false)}>{resolveLanguageKey("cancel")}</Button>
            </div>
        </section>
    );
}

export default compose(withLanguage("src/modules/dentalClinic/clients/portal/cases/caseMedicalHistory.tsx"))(CaseMedicalHistory);
