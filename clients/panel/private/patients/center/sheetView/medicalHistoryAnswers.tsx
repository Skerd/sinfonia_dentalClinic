import {compose} from "redux";
import {IconAlertTriangle} from "@tabler/icons-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import type {MedicalHistory} from "armonia/src/modules/dentalClinic/dto/medicalHistory.dto.ts";

type Props = WithLanguageType & {history?: MedicalHistory};

/**
 * The patient's signed questionnaire, for the dentist: what they answered "yes" or "not sure"
 * to first, with their details, then everything they said "no" to on one line.
 */
function MedicalHistoryAnswers({history, resolveLanguageKey}: Props) {
    if (!history) {
        return (
            <section className="flex flex-col gap-1 px-4 pb-4">
                <h4 className="text-sm font-medium">{resolveLanguageKey("title")}</h4>
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("none")}</p>
            </section>
        );
    }
    const flagged = history.answers.filter((row) => row.answer !== "no");
    const clear = history.answers.filter((row) => row.answer === "no");
    return (
        <section className="flex flex-col gap-3 px-4 pb-4">
            <div className="flex flex-col">
                <h4 className="text-sm font-medium">{resolveLanguageKey("title")}</h4>
                <p className="text-xs text-muted-foreground">
                    {resolveLanguageKey("signed").replace("{name}", history.signedName).replace("{date}", new Date(history.submittedAt).toLocaleString())}
                </p>
            </div>
            {flagged.length ? (
                <ul className="flex flex-col divide-y rounded-md border border-amber-500/40 bg-amber-500/5 text-sm">
                    {flagged.map((row) => (
                        <li key={row.question} className="flex items-start gap-2 px-3 py-2">
                            <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                            <div className="flex flex-col">
                                <span className="flex items-center gap-2">
                                    {resolveLanguageKey(`question.${row.question}`)}
                                    <Badge variant="outline">{resolveLanguageKey(`answer.${row.answer}`)}</Badge>
                                </span>
                                {row.detail ? <span className="text-xs text-muted-foreground">{row.detail}</span> : null}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}
            {clear.length ? (
                <p className="text-xs text-muted-foreground">
                    {resolveLanguageKey("answeredNo")} {clear.map((row) => resolveLanguageKey(`question.${row.question}`)).join(", ")}
                </p>
            ) : null}
            {history.medications ? (
                <div className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium">{resolveLanguageKey("medications")}</span>
                    <span className="whitespace-pre-line">{history.medications}</span>
                </div>
            ) : null}
        </section>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/patients/center/sheetView/medicalHistoryAnswers.tsx"),
)(MedicalHistoryAnswers);
