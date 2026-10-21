/**
 * Field helpers for reading uiapi GraphQL response nodes on object detail
 * pages (Account/Contact/Opportunity). Previously imported from
 * feature-react-object-search; inlined here so the app no longer depends on
 * that feature.
 */

/** Picks the user-facing string for a `{ value, displayValue }` field. */
export function fieldValue(
	field: { displayValue?: string | null; value?: unknown } | null | undefined,
): string | null {
	if (field?.displayValue != null) return field.displayValue;
	if (field?.value != null) return String(field.value);
	return null;
}

/**
 * Picks the raw underlying value for a `{ value, displayValue }` field —
 * for prefilling edit forms, where a formatted `displayValue` (e.g.
 * "$1,000,000.00") would round-trip badly through a number/date input.
 */
export function editableValue(
	field: { displayValue?: string | null; value?: unknown } | null | undefined,
): unknown {
	if (field?.value != null) return field.value;
	return field?.displayValue ?? null;
}

/** Builds the display lines for a Salesforce compound address, or null if empty. */
export function getAddressFieldLines(address: {
	street?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
}) {
	const cityStateZip = [address.city, address.state].filter(Boolean).join(", ");
	const cityStateZipLine = [cityStateZip, address.postalCode].filter(Boolean).join(" ");
	const lines = [address.street, cityStateZipLine, address.country].filter(Boolean);
	if (lines.length === 0) return null;
	return lines;
}

/** Formats an ISO datetime string with `toLocaleString`, or null if absent. */
export function formatDateTimeField(
	value?: string | null,
	...args: Parameters<Date["toLocaleString"]>
) {
	if (!value) return null;
	return new Date(value).toLocaleString(...args);
}
