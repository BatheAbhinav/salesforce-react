import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Field, FieldLabel, FieldGroup, FieldError } from "./ui/field";

export type EditableFieldType = "text" | "number" | "date";

export type EditableFieldConfig = {
	key: string;
	label: string;
	type?: EditableFieldType;
};

export type EditRecordDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	fields: EditableFieldConfig[];
	/** Current field values, keyed by field key — used to prefill the form each time it opens. */
	values: Record<string, unknown>;
	/** Called with the edited values (same keys as `fields`); rejecting keeps the dialog open and shows the error. */
	onSubmit: (values: Record<string, unknown>) => Promise<void>;
};

function toInputValue(value: unknown): string {
	if (value == null) return "";
	return String(value);
}


export function EditRecordDialog({
	open,
	onOpenChange,
	title,
	fields,
	values,
	onSubmit,
}: EditRecordDialogProps) {
	const [submitting, setSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (open) setError(null);
	}, [open]);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitting(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const payload: Record<string, unknown> = {};
		fields.forEach((field) => {
			const raw = String(formData.get(field.key) ?? "");
			payload[field.key] = raw === "" ? null : field.type === "number" ? Number(raw) : raw;
		});

		try {
			await onSubmit(payload);
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save changes.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>

					<FieldGroup className="py-4">
						{fields.map((field) => (
							<Field key={field.key}>
								<FieldLabel htmlFor={`edit-${field.key}`}>{field.label}</FieldLabel>
								<Input
									id={`edit-${field.key}`}
									name={field.key}
									type={
										field.type === "number" ? "number" : field.type === "date" ? "date" : "text"
									}
									defaultValue={toInputValue(values[field.key])}
								/>
							</Field>
						))}
						{error && <FieldError>{error}</FieldError>}
					</FieldGroup>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Saving…" : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
