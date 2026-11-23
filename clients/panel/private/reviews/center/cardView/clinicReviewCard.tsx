import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarEvent, IconStar} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicReview} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicReview/clinicReview.dto.ts";
import ClinicReviewSheetView from "@dentalClinicModule/clients/panel/private/reviews/center/sheetView/clinicReviewSheetView.tsx";
import {clinicReviewEditPath} from "@dentalClinicModule/clients/panel/private/reviews/index.tsx";
import PublishClinicReview from "@dentalClinicModule/clients/panel/private/reviews/center/actions/publishClinicReview.tsx";
import UnpublishClinicReview from "@dentalClinicModule/clients/panel/private/reviews/center/actions/unpublishClinicReview.tsx";
import PublishClinicReviewDialog from "@dentalClinicModule/clients/panel/private/reviews/center/dialogs/publishClinicReviewDialog.tsx";
import UnpublishClinicReviewDialog from "@dentalClinicModule/clients/panel/private/reviews/center/dialogs/unpublishClinicReviewDialog.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";

type ClinicReviewCardProps = WithLanguageType & {
    clinicReview: ClinicReview;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ClinicReview, response?: DeletedData) => void;
    onRestore?: () => void;
    onPublishedChanged?: (isPublished: boolean) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ClinicReview> | null>;
};

function ClinicReviewCard({
    clinicReview,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onPublishedChanged,
    sheetOnly = false,
    innerRef,
}: ClinicReviewCardProps) {
    return (
        <EntityCard
            resource="clinicreviews"
            entity={clinicReview}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/clinicReview/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={clinicReviewEditPath}
            Sheet={ClinicReviewSheetView}
            sheetEntityProp="clinicReview"
            deleteUrl="/api/dentalClinic/clinicReview"
            restoreUrl="/api/dentalClinic/clinicReview/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="authorName"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onPublishedChanged: (isPublished: boolean) => {
                    setEntity({...entity, isPublished});
                    onPublishedChanged?.(isPublished);
                },
                onSheetRowPatched: (row: Partial<ClinicReview>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isPublished === "boolean") onPublishedChanged?.(row.isPublished);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "publishClinicReview" && (
                        <PublishClinicReviewDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isPublished: true});
                                onPublishedChanged?.(true);
                            }}
                        />
                    )}
                    {action === "unpublishClinicReview" && (
                        <UnpublishClinicReviewDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isPublished: false});
                                onPublishedChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="authorName"
                        title={row.authorName}
                        badgesBesideTitle
                        badges={!row.isPublished ? <Badge variant="outline" className="text-xs">{String(resolveLanguageKey("notPublished"))}</Badge> : null}>
                        <PublishClinicReview entity={row} onAction={setAction} />
                        <UnpublishClinicReview entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconStar}
                            label={resolveLanguageKey("rating")}
                            tooltip={resolveLanguageKey("rating")}
                            path="rating"
                            value={"★".repeat(Math.round(row.rating)) + "☆".repeat(Math.max(0, 5 - Math.round(row.rating)))}
                        />
                        {row.appointment ? (
                            <EntityCardRow
                                icon={IconCalendarEvent}
                                label={resolveLanguageKey("appointment")}
                                tooltip={resolveLanguageKey("appointment")}
                                path="appointment"
                                value={row.appointment.number}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/reviews/center/cardView/clinicReviewCard.tsx"),
    withDebug(true, true, "clinicreviews"),
)(ClinicReviewCard);
