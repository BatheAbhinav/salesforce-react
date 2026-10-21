import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { createDataSDK } from "@salesforce/platform-sdk";
import GET_OPPORTUNITY_DETAIL from "../api/opportunity/query/getOpportunityDetail.graphql?raw";
import { updateSObject } from "../api/sobject/querySObject";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { fieldValue, editableValue, formatDateTimeField } from "../utils/objectFields";
import { Separator } from "../components/ui/separator";
import { useAsyncData } from "../hooks/useAsyncData";
import { ObjectBreadcrumb } from "../components/ObjectBreadcrumb";
import { EditRecordDialog, type EditableFieldConfig } from "../components/EditRecordDialog";
import {
	FieldItem,
	FieldRow,
	Section,
	DetailError,
	DetailNotFound,
	DetailSkeleton,
	SkeletonFieldRow,
	SkeletonSection,
} from "../components/ObjectDetail";

/**
 * A uiapi scalar field as returned with `@optional { value displayValue }`.
 */
type FieldValue = { value?: unknown; displayValue?: string | null } | null;
type NameHolder = { Name?: FieldValue } | null;

interface OpportunityNode {
	Id?: string;
	Name?: FieldValue;
	Account?: NameHolder;
	Owner?: NameHolder;
	Amount?: FieldValue;
	StageName?: FieldValue;
	CloseDate?: FieldValue;
	Probability?: FieldValue;
	Type?: FieldValue;
	LeadSource?: FieldValue;
	Description?: FieldValue;
	CreatedBy?: NameHolder;
	CreatedDate?: FieldValue;
	LastModifiedBy?: NameHolder;
	LastModifiedDate?: FieldValue;
}

interface GetOpportunityDetailResponse {
	uiapi?: {
		query?: {
			Opportunity?: {
				edges?: Array<{ node?: OpportunityNode } | null> | null;
			} | null;
		} | null;
	} | null;
}

const OPPORTUNITY_EDIT_FIELDS: EditableFieldConfig[] = [
	{ key: "Name", label: "Opportunity Name" },
	{ key: "Amount", label: "Amount", type: "number" },
	{ key: "StageName", label: "Stage" },
	{ key: "CloseDate", label: "Close Date", type: "date" },
];

async function fetchOpportunityDetail(
	recordId: string,
): Promise<OpportunityNode | null | undefined> {
	const data = await createDataSDK();
	const result = await data.graphql!.query<GetOpportunityDetailResponse, { id: string }>({
		query: GET_OPPORTUNITY_DETAIL,
		variables: { id: recordId },
	});

	if (result.errors?.length) {
		throw new Error(result.errors.map((e) => e.message).join("; "));
	}

	return result.data?.uiapi?.query?.Opportunity?.edges?.[0]?.node;
}

export default function OpportunityObjectDetail() {
	const { recordId } = useParams();
	const navigate = useNavigate();
	const [isEditOpen, setIsEditOpen] = useState(false);

	const {
		data: opportunity,
		loading,
		error,
		refetch,
	} = useAsyncData(() => fetchOpportunityDetail(recordId!), [recordId]);

	async function handleSave(values: Record<string, unknown>) {
		await updateSObject({ object: "Opportunity", id: recordId!, fields: values });
		refetch();
	}

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<ObjectBreadcrumb
				listPath="/opportunities"
				listLabel="Opportunities"
				loading={loading}
				recordName={
					opportunity
						? (fieldValue(opportunity.Name) ?? "")
						: error
							? "Error"
							: loading
								? undefined
								: "Not Found"
				}
			/>

			{/* Loading state */}
			{loading && <OpportunityDetailSkeleton />}

			{/* Error state */}
			{error && <DetailError label="Opportunity" onBack={() => navigate(-1)} />}

			{/* Not found state */}
			{!loading && !error && !opportunity && (
				<DetailNotFound label="Opportunity" onBack={() => navigate(-1)} />
			)}

			{/* Content */}
			{opportunity && (
				<>
					<OpportunityDetailContent
						opportunity={opportunity}
						onEdit={() => setIsEditOpen(true)}
					/>
					<EditRecordDialog
						open={isEditOpen}
						onOpenChange={setIsEditOpen}
						title="Edit Opportunity"
						fields={OPPORTUNITY_EDIT_FIELDS}
						values={Object.fromEntries(
							OPPORTUNITY_EDIT_FIELDS.map((field) => [
								field.key,
								editableValue(opportunity[field.key as keyof OpportunityNode] as FieldValue),
							]),
						)}
						onSubmit={handleSave}
					/>
				</>
			)}
		</div>
	);
}

function OpportunityDetailContent({
	opportunity,
	onEdit,
}: {
	opportunity: OpportunityNode;
	onEdit: () => void;
}) {
	const dateTimeOptions = { dateStyle: "medium", timeStyle: "short" } as const;
	const createdDate = formatDateTimeField(
		fieldValue(opportunity.CreatedDate),
		undefined,
		dateTimeOptions,
	);
	const lastModifiedDate = formatDateTimeField(
		fieldValue(opportunity.LastModifiedDate),
		undefined,
		dateTimeOptions,
	);

	return (
		<>
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Opportunity: {fieldValue(opportunity.Name)}</h1>
				<Button variant="outline" onClick={onEdit}>
					Edit
				</Button>
			</div>

			<Card>
				<CardContent className="space-y-8 pt-6">
					{/* Top section */}
					<div>
						<div className="space-y-4">
							<FieldRow>
								<FieldItem label="Opportunity Name">{fieldValue(opportunity.Name)}</FieldItem>
								<FieldItem label="Account Name">{fieldValue(opportunity.Account?.Name)}</FieldItem>
							</FieldRow>
							<FieldRow>
								<FieldItem label="Stage">{fieldValue(opportunity.StageName)}</FieldItem>
								<FieldItem label="Opportunity Owner">
									{fieldValue(opportunity.Owner?.Name)}
								</FieldItem>
							</FieldRow>
							<FieldRow>
								<FieldItem label="Amount">{fieldValue(opportunity.Amount)}</FieldItem>
								<FieldItem label="Close Date">{fieldValue(opportunity.CloseDate)}</FieldItem>
							</FieldRow>
							<FieldRow>
								<FieldItem label="Probability (%)">{fieldValue(opportunity.Probability)}</FieldItem>
								<FieldItem label="Type">{fieldValue(opportunity.Type)}</FieldItem>
							</FieldRow>
						</div>
					</div>

					<Separator />

					{/* Additional Information */}
					<Section title="Additional Information">
						<FieldRow>
							<FieldItem label="Lead Source">{fieldValue(opportunity.LeadSource)}</FieldItem>
						</FieldRow>
						<dl>
							<FieldItem label="Description">{fieldValue(opportunity.Description)}</FieldItem>
						</dl>
					</Section>

					<Separator />

					{/* System Information */}
					<Section title="System Information">
						<FieldRow>
							<FieldItem label="Created By">
								{[fieldValue(opportunity.CreatedBy?.Name), createdDate].filter(Boolean).join(" ") ||
									null}
							</FieldItem>
							<FieldItem label="Last Modified By">
								{[fieldValue(opportunity.LastModifiedBy?.Name), lastModifiedDate]
									.filter(Boolean)
									.join(" ") || null}
							</FieldItem>
						</FieldRow>
					</Section>
				</CardContent>
			</Card>
		</>
	);
}

function OpportunityDetailSkeleton() {
	return (
		<DetailSkeleton>
			<div>
				<div className="space-y-4">
					<SkeletonFieldRow />
					<SkeletonFieldRow />
					<SkeletonFieldRow />
					<SkeletonFieldRow />
				</div>
			</div>

			<Separator />

			<SkeletonSection />

			<Separator />

			<SkeletonFieldRow />
		</DetailSkeleton>
	);
}
