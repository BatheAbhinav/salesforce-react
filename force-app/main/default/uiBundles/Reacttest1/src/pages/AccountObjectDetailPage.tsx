import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { createDataSDK } from "@salesforce/platform-sdk";
import GET_ACCOUNT_DETAIL from "../api/account/query/getAccountDetail.graphql?raw";
import { updateSObject } from "../api/sobject/querySObject";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
	fieldValue,
	editableValue,
	getAddressFieldLines,
	formatDateTimeField,
} from "../utils/objectFields";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { useAsyncData } from "../hooks/useAsyncData";
import { ObjectBreadcrumb } from "../components/ObjectBreadcrumb";
import { EditRecordDialog, type EditableFieldConfig } from "../components/EditRecordDialog";
import {
	FieldItem,
	FieldRow,
	Section,
	TelephoneField,
	DetailError,
	DetailNotFound,
	DetailSkeleton,
	SkeletonFieldRow,
	SkeletonSection,
} from "../components/ObjectDetail";

/**
 * A uiapi scalar field as returned with `@optional { value displayValue }`.
 * Typed locally so this page no longer depends on the generated
 * `graphql-operations-types` that shipped with feature-react-object-search.
 */
type FieldValue = { value?: unknown; displayValue?: string | null } | null;
type NameHolder = { Name?: FieldValue } | null;

interface AccountNode {
	Id?: string;
	Name?: FieldValue;
	Owner?: NameHolder;
	Phone?: FieldValue;
	Fax?: FieldValue;
	Parent?: NameHolder;
	Website?: FieldValue;
	Type?: FieldValue;
	NumberOfEmployees?: FieldValue;
	Industry?: FieldValue;
	AnnualRevenue?: FieldValue;
	Description?: FieldValue;
	BillingStreet?: FieldValue;
	BillingCity?: FieldValue;
	BillingState?: FieldValue;
	BillingPostalCode?: FieldValue;
	BillingCountry?: FieldValue;
	ShippingStreet?: FieldValue;
	ShippingCity?: FieldValue;
	ShippingState?: FieldValue;
	ShippingPostalCode?: FieldValue;
	ShippingCountry?: FieldValue;
	CreatedBy?: NameHolder;
	CreatedDate?: FieldValue;
	LastModifiedBy?: NameHolder;
	LastModifiedDate?: FieldValue;
}

interface GetAccountDetailResponse {
	uiapi?: {
		query?: {
			Account?: {
				edges?: Array<{ node?: AccountNode } | null> | null;
			} | null;
		} | null;
	} | null;
}

const ACCOUNT_EDIT_FIELDS: EditableFieldConfig[] = [
	{ key: "Name", label: "Account Name" },
	{ key: "Phone", label: "Phone" },
	{ key: "Website", label: "Website" },
	{ key: "Industry", label: "Industry" },
	{ key: "Type", label: "Type" },
	{ key: "AnnualRevenue", label: "Annual Revenue", type: "number" },
	{ key: "NumberOfEmployees", label: "Employees", type: "number" },
	{ key: "Description", label: "Description" },
];

async function fetchAccountDetail(recordId: string): Promise<AccountNode | null | undefined> {
	const data = await createDataSDK();
	const result = await data.graphql!.query<GetAccountDetailResponse, { id: string }>({
		query: GET_ACCOUNT_DETAIL,
		variables: { id: recordId },
	});

	if (result.errors?.length) {
		throw new Error(result.errors.map((e) => e.message).join("; "));
	}

	return result.data?.uiapi?.query?.Account?.edges?.[0]?.node;
}

export default function AccountObjectDetail() {
	const { recordId } = useParams();
	const navigate = useNavigate();
	const [isEditOpen, setIsEditOpen] = useState(false);

	const {
		data: account,
		loading,
		error,
		refetch,
	} = useAsyncData(() => fetchAccountDetail(recordId!), [recordId]);

	async function handleSave(values: Record<string, unknown>) {
		await updateSObject({ object: "Account", id: recordId!, fields: values });
		refetch();
	}

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<ObjectBreadcrumb
				listPath="/accounts"
				listLabel="Accounts"
				loading={loading}
				recordName={
					account
						? (fieldValue(account.Name) ?? "")
						: error
							? "Error"
							: loading
								? undefined
								: "Not Found"
				}
			/>

			{/* Loading state */}
			{loading && <AccountDetailSkeleton />}

			{/* Error state */}
			{error && <DetailError label="Account" onBack={() => navigate(-1)} />}

			{/* Not found state */}
			{!loading && !error && !account && (
				<DetailNotFound label="Account" onBack={() => navigate(-1)} />
			)}

			{/* Content */}
			{account && (
				<>
					<AccountDetailContent account={account} onEdit={() => setIsEditOpen(true)} />
					<EditRecordDialog
						open={isEditOpen}
						onOpenChange={setIsEditOpen}
						title="Edit Account"
						fields={ACCOUNT_EDIT_FIELDS}
						values={Object.fromEntries(
							ACCOUNT_EDIT_FIELDS.map((field) => [
								field.key,
								editableValue(account[field.key as keyof AccountNode] as FieldValue),
							]),
						)}
						onSubmit={handleSave}
					/>
				</>
			)}
		</div>
	);
}

function AccountDetailContent({
	account,
	onEdit,
}: {
	account: AccountNode;
	onEdit: () => void;
}) {
	const billingAddress = getAddressFieldLines({
		street: fieldValue(account.BillingStreet),
		city: fieldValue(account.BillingCity),
		state: fieldValue(account.BillingState),
		postalCode: fieldValue(account.BillingPostalCode),
		country: fieldValue(account.BillingCountry),
	});

	const shippingAddress = getAddressFieldLines({
		street: fieldValue(account.ShippingStreet),
		city: fieldValue(account.ShippingCity),
		state: fieldValue(account.ShippingState),
		postalCode: fieldValue(account.ShippingPostalCode),
		country: fieldValue(account.ShippingCountry),
	});

	const dateTimeOptions = { dateStyle: "medium", timeStyle: "short" } as const;
	const createdDate = formatDateTimeField(
		fieldValue(account.CreatedDate),
		undefined,
		dateTimeOptions,
	);
	const lastModifiedDate = formatDateTimeField(
		fieldValue(account.LastModifiedDate),
		undefined,
		dateTimeOptions,
	);

	return (
		<>
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Account: {fieldValue(account.Name)}</h1>
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
								<FieldItem label="Account Owner">{fieldValue(account.Owner?.Name)}</FieldItem>
								<FieldItem label="Phone">
									<TelephoneField value={fieldValue(account.Phone)} />
								</FieldItem>
							</FieldRow>
							<FieldRow>
								<FieldItem label="Account Name">{fieldValue(account.Name)}</FieldItem>
								<FieldItem label="Fax">
									<TelephoneField value={fieldValue(account.Fax)} />
								</FieldItem>
							</FieldRow>
							<FieldRow>
								<FieldItem label="Parent Account">{fieldValue(account.Parent?.Name)}</FieldItem>
								<FieldItem label="Website">{fieldValue(account.Website)}</FieldItem>
							</FieldRow>
						</div>
					</div>

					<Separator />

					{/* Additional Information */}
					<Section title="Additional Information">
						<FieldRow>
							<FieldItem label="Type">{fieldValue(account.Type)}</FieldItem>
							<FieldItem label="Employees">{fieldValue(account.NumberOfEmployees)}</FieldItem>
						</FieldRow>
						<FieldRow>
							<FieldItem label="Industry">{fieldValue(account.Industry)}</FieldItem>
							<FieldItem label="Annual Revenue">{fieldValue(account.AnnualRevenue)}</FieldItem>
						</FieldRow>
						<dl>
							<FieldItem label="Description">{fieldValue(account.Description)}</FieldItem>
						</dl>
					</Section>

					<Separator />

					{/* Address Information */}
					<Section title="Address Information">
						<FieldRow>
							<FieldItem label="Billing Address">
								{billingAddress ? billingAddress.map((line, i) => <div key={i}>{line}</div>) : null}
							</FieldItem>
							<FieldItem label="Shipping Address">
								{shippingAddress
									? shippingAddress.map((line, i) => <div key={i}>{line}</div>)
									: null}
							</FieldItem>
						</FieldRow>
					</Section>

					<Separator />

					{/* System Information */}
					<Section title="System Information">
						<FieldRow>
							<FieldItem label="Created By">
								{[fieldValue(account.CreatedBy?.Name), createdDate].filter(Boolean).join(" ") ||
									null}
							</FieldItem>
							<FieldItem label="Last Modified By">
								{[fieldValue(account.LastModifiedBy?.Name), lastModifiedDate]
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

function AccountDetailSkeleton() {
	return (
		<DetailSkeleton>
			{/* Top section: field rows */}
			<div>
				<div className="space-y-4">
					<SkeletonFieldRow />
					<SkeletonFieldRow />
					<SkeletonFieldRow />
				</div>
			</div>

			<Separator />

			{/* Additional Information */}
			<SkeletonSection />

			<Separator />

			{/* Address Information */}
			<div className="space-y-4">
				<Skeleton className="h-7 w-48 py-2" />
				<div className="grid grid-cols-2 gap-x-8 gap-y-4">
					<div>
						<Skeleton className="h-4 w-28 mb-1.5" />
						<Skeleton className="h-5 w-44 mb-1" />
						<Skeleton className="h-5 w-36 mb-1" />
						<Skeleton className="h-5 w-28" />
					</div>
					<div>
						<Skeleton className="h-4 w-32 mb-1.5" />
						<Skeleton className="h-5 w-44 mb-1" />
						<Skeleton className="h-5 w-36 mb-1" />
						<Skeleton className="h-5 w-28" />
					</div>
				</div>
			</div>

			<Separator />

			{/* System Information */}
			<div className="space-y-4">
				<Skeleton className="h-7 w-48 py-2" />
				<SkeletonFieldRow />
			</div>
		</DetailSkeleton>
	);
}
