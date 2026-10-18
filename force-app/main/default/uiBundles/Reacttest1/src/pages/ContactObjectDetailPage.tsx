import { useParams, useNavigate } from "react-router";
import { createDataSDK } from "@salesforce/platform-sdk";
import GET_CONTACT_DETAIL from "../api/contact/query/getContactDetail.graphql?raw";
import { Card, CardContent } from "../components/ui/card";
import { fieldValue, getAddressFieldLines, formatDateTimeField } from "../utils/objectFields";
import { Separator } from "../components/ui/separator";
import { useAsyncData } from "../hooks/useAsyncData";
import { ObjectBreadcrumb } from "../components/ObjectBreadcrumb";
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
 */
type FieldValue = { value?: unknown; displayValue?: string | null } | null;
type NameHolder = { Name?: FieldValue } | null;

interface ContactNode {
	Id?: string;
	Name?: FieldValue;
	Title?: FieldValue;
	Email?: FieldValue;
	Phone?: FieldValue;
	MobilePhone?: FieldValue;
	Account?: NameHolder;
	Owner?: NameHolder;
	MailingStreet?: FieldValue;
	MailingCity?: FieldValue;
	MailingState?: FieldValue;
	MailingPostalCode?: FieldValue;
	MailingCountry?: FieldValue;
	Description?: FieldValue;
	CreatedBy?: NameHolder;
	CreatedDate?: FieldValue;
	LastModifiedBy?: NameHolder;
	LastModifiedDate?: FieldValue;
}

interface GetContactDetailResponse {
	uiapi?: {
		query?: {
			Contact?: {
				edges?: Array<{ node?: ContactNode } | null> | null;
			} | null;
		} | null;
	} | null;
}

async function fetchContactDetail(recordId: string): Promise<ContactNode | null | undefined> {
	const data = await createDataSDK();
	const result = await data.graphql!.query<GetContactDetailResponse, { id: string }>({
		query: GET_CONTACT_DETAIL,
		variables: { id: recordId },
	});

	if (result.errors?.length) {
		throw new Error(result.errors.map((e) => e.message).join("; "));
	}

	return result.data?.uiapi?.query?.Contact?.edges?.[0]?.node;
}

export default function ContactObjectDetail() {
	const { recordId } = useParams();
	const navigate = useNavigate();

	const {
		data: contact,
		loading,
		error,
	} = useAsyncData(() => fetchContactDetail(recordId!), [recordId]);

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<ObjectBreadcrumb
				listPath="/contacts"
				listLabel="Contacts"
				loading={loading}
				recordName={
					contact
						? (fieldValue(contact.Name) ?? "")
						: error
							? "Error"
							: loading
								? undefined
								: "Not Found"
				}
			/>

			{/* Loading state */}
			{loading && <ContactDetailSkeleton />}

			{/* Error state */}
			{error && <DetailError label="Contact" onBack={() => navigate(-1)} />}

			{/* Not found state */}
			{!loading && !error && !contact && (
				<DetailNotFound label="Contact" onBack={() => navigate(-1)} />
			)}

			{/* Content */}
			{contact && <ContactDetailContent contact={contact} />}
		</div>
	);
}

function ContactDetailContent({ contact }: { contact: ContactNode }) {
	const mailingAddress = getAddressFieldLines({
		street: fieldValue(contact.MailingStreet),
		city: fieldValue(contact.MailingCity),
		state: fieldValue(contact.MailingState),
		postalCode: fieldValue(contact.MailingPostalCode),
		country: fieldValue(contact.MailingCountry),
	});

	const dateTimeOptions = { dateStyle: "medium", timeStyle: "short" } as const;
	const createdDate = formatDateTimeField(
		fieldValue(contact.CreatedDate),
		undefined,
		dateTimeOptions,
	);
	const lastModifiedDate = formatDateTimeField(
		fieldValue(contact.LastModifiedDate),
		undefined,
		dateTimeOptions,
	);

	return (
		<>
			<h1 className="text-2xl font-bold mb-4">Contact: {fieldValue(contact.Name)}</h1>

			<Card>
				<CardContent className="space-y-8 pt-6">
					{/* Top section */}
					<div>
						<div className="space-y-4">
							<FieldRow>
								<FieldItem label="Contact Name">{fieldValue(contact.Name)}</FieldItem>
								<FieldItem label="Account Name">{fieldValue(contact.Account?.Name)}</FieldItem>
							</FieldRow>
							<FieldRow>
								<FieldItem label="Title">{fieldValue(contact.Title)}</FieldItem>
								<FieldItem label="Contact Owner">{fieldValue(contact.Owner?.Name)}</FieldItem>
							</FieldRow>
							<FieldRow>
								<FieldItem label="Phone">
									<TelephoneField value={fieldValue(contact.Phone)} />
								</FieldItem>
								<FieldItem label="Mobile">
									<TelephoneField value={fieldValue(contact.MobilePhone)} />
								</FieldItem>
							</FieldRow>
							<FieldRow>
								<FieldItem label="Email">{fieldValue(contact.Email)}</FieldItem>
							</FieldRow>
						</div>
					</div>

					<Separator />

					{/* Address Information */}
					<Section title="Address Information">
						<FieldRow>
							<FieldItem label="Mailing Address">
								{mailingAddress ? mailingAddress.map((line, i) => <div key={i}>{line}</div>) : null}
							</FieldItem>
						</FieldRow>
					</Section>

					<Separator />

					{/* Additional Information */}
					<Section title="Additional Information">
						<dl>
							<FieldItem label="Description">{fieldValue(contact.Description)}</FieldItem>
						</dl>
					</Section>

					<Separator />

					{/* System Information */}
					<Section title="System Information">
						<FieldRow>
							<FieldItem label="Created By">
								{[fieldValue(contact.CreatedBy?.Name), createdDate].filter(Boolean).join(" ") ||
									null}
							</FieldItem>
							<FieldItem label="Last Modified By">
								{[fieldValue(contact.LastModifiedBy?.Name), lastModifiedDate]
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

function ContactDetailSkeleton() {
	return (
		<DetailSkeleton>
			<div>
				<div className="space-y-4">
					<SkeletonFieldRow />
					<SkeletonFieldRow />
					<SkeletonFieldRow />
				</div>
			</div>

			<Separator />

			<SkeletonSection />

			<Separator />

			<SkeletonSection />
		</DetailSkeleton>
	);
}
