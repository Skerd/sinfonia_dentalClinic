import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCash, IconClock} from "@tabler/icons-react";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {AccessGatedGalleryCarousel} from "@coreModule/components/viewEngine/widgets/gallery/galleryCarousel.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {ClinicService} from "armonia/src/modules/dentalClinic/api/dentalClinic/private/clinicService/clinicService.dto.ts";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";
import {priceLabel} from "@dentalClinicModule/clients/client/public/shared/clinicFormat.ts";
import ClinicServiceSheetView from "@dentalClinicModule/clients/panel/private/services/center/sheetView/clinicServiceSheetView.tsx";
import {clinicServiceEditPath} from "@dentalClinicModule/clients/panel/private/services/index.tsx";
import ActivateClinicService from "@dentalClinicModule/clients/panel/private/services/center/actions/activateClinicService.tsx";
import DeactivateClinicService from "@dentalClinicModule/clients/panel/private/services/center/actions/deactivateClinicService.tsx";
import ActivateClinicServiceDialog from "@dentalClinicModule/clients/panel/private/services/center/dialogs/activateClinicServiceDialog.tsx";
import DeactivateClinicServiceDialog from "@dentalClinicModule/clients/panel/private/services/center/dialogs/deactivateClinicServiceDialog.tsx";
import PlatformHiddenBadge from "@coreModule/components/custom/report/platformHiddenBadge.tsx";

/** An amount in the clinic currency; a bare number only while the clinic has no currency set (never a guessed one). */
function clinicMoney(amount: number | undefined, currency: ClinicService["currency"]): string {
    if (amount == null) return "";
    if (!currency) return String(amount);
    return formatCurrency(amount, currency.abbreviation, {minimumFractionDigits: 0, maximumFractionDigits: currency.decimalPlaces ?? 2});
}

type ClinicServiceCardProps = WithLanguageType & {
    clinicService: ClinicService;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ClinicService, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<ClinicService> | null>;
};

function ClinicServiceCard({
    clinicService,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: ClinicServiceCardProps) {
    return (
        <EntityCard
            resource="clinicservices"
            entity={clinicService}
            fetchId={fetchId}
            singleUrl="/api/dentalClinic/clinicService/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={clinicServiceEditPath}
            Sheet={ClinicServiceSheetView}
            sheetEntityProp="clinicService"
            deleteUrl="/api/dentalClinic/clinicService"
            restoreUrl="/api/dentalClinic/clinicService/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onActiveChanged: (isActive: boolean) => {
                    setEntity({...entity, isActive});
                    onActiveChanged?.(isActive);
                },
                onSheetRowPatched: (row: Partial<ClinicService>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateClinicService" && (
                        <ActivateClinicServiceDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateClinicService" && (
                        <DeactivateClinicServiceDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, read, setAction}) => (
                <>
                    {/* The treatment's first photo is its cover, as on the clinic's site (UX-02). */}
                    {row.images?.length ? (
                        <div className="-mx-(--density-pad) -mt-(--density-pad) w-[calc(100%+2*var(--density-pad))]">
                            <AccessGatedGalleryCarousel
                                read={read}
                                imageGallery={row.images}
                                videoGallery={row.videos || []}
                                mainImagePath="images"
                                imageGalleryPath="images"
                                videoGalleryPath="videos"
                                showThumbnails={false}
                                allowFullScreen={false}
                                coverAfterFirst
                            />
                        </div>
                    ) : null}
                    <EntityCard.Header
                        titlePath="name"
                        title={row.name}
                        badgesBesideTitle
                        badges={
                            <>
                                <Badge variant="outline" className="text-xs">{String(resolveLanguageKey(`category.${row.category}`))}</Badge>
                                {/* Only the exception is shown: an active, bookable treatment needs no badge. */}
                                <PlatformHiddenBadge hidden={row.hiddenByPlatform} />
                                {!row.isActive ? <Badge variant="secondary" className="text-xs">{resolveLanguageKey("inactive")}</Badge> : null}
                                {row.isActive && !row.onlineBookable ? <Badge variant="secondary" className="text-xs">{resolveLanguageKey("notBookable")}</Badge> : null}
                            </>
                        }
                    >
                        <ActivateClinicService entity={row} onAction={setAction} />
                        <DeactivateClinicService entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconCash}
                            label={resolveLanguageKey("price")}
                            tooltip={resolveLanguageKey("price")}
                            path="price"
                            type="string"
                            value={priceLabel(row, (amount) => clinicMoney(amount, row.currency), resolveLanguageKey)}
                        />
                        <EntityCardRow
                            icon={IconClock}
                            label={resolveLanguageKey("duration")}
                            tooltip={resolveLanguageKey("duration")}
                            path="durationMinutes"
                            type="string"
                            value={String(resolveLanguageKey("durationValue")).replace("{minutes}", String(row.durationMinutes))}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/dentalClinic/clients/panel/private/services/center/cardView/clinicServiceCard.tsx"),
    withDebug(true, true, "clinicservices"),
)(ClinicServiceCard);
