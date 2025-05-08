import { Alert, AlertTitle } from "@/components/alert";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/dialog";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { useEffect, useState } from "react";

export type AlertSourceDialogData = {
	name: string;
	thresholdPercent: number;
	repeatMinutes: number | null;
};

export type AlertSourceDialogSubmitHandler = (
	data: AlertSourceDialogData,
) => void;

export type AlertSourceDialogProps = {
	isOpen: boolean;
	title: string;
	submitText: string;
	isLoading: boolean;
	defaultValues?: AlertSourceDialogData;
	onClose: () => void;
	onSubmit: AlertSourceDialogSubmitHandler;
};

export const AlertSourceDialog = ({
	isOpen,
	title,
	submitText,
	isLoading,
	defaultValues,
	onClose,
	onSubmit,
}: AlertSourceDialogProps) => {
	const [name, setName] = useState("");
	const [thresholdPercent, setThresholdPercent] = useState(50);
	const [repeatMinutes, setRepeatMinutes] = useState<number | null>(null);
	const [error, setError] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (!isOpen) return;

		setName("");
		setThresholdPercent(50);
		setRepeatMinutes(null);
	}, [isOpen]);

	useEffect(() => {
		if (!defaultValues) return;

		setName(defaultValues.name);
		setThresholdPercent(defaultValues.thresholdPercent);
		setRepeatMinutes(defaultValues.repeatMinutes);
	}, [defaultValues]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedName = name.trim();

		if (trimmedName.length < 1) {
			setError("Name cannot be empty");
			return;
		}

		if (thresholdPercent < 0 || thresholdPercent > 100) {
			setError("Threshold must be a number between 0 and 100");
			return;
		}

		if (repeatMinutes !== null && repeatMinutes <= 0) {
			setError("Repeat value must be greater than 0");
			return;
		}

		setError(undefined);

		onSubmit({ name: trimmedName, thresholdPercent, repeatMinutes });
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						{error && (
							<Alert variant={"destructive"}>
								<AlertTitle>{error}</AlertTitle>
							</Alert>
						)}

						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="tresholdPercent">Threshold in percents</Label>
							<Input
								id="tresholdPercent"
								type="number"
								value={thresholdPercent}
								onChange={(e) => setThresholdPercent(+e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="repeatMinutes">
								Repeat until under threshold every x minutes
							</Label>
							<div className="flex gap-2 items-center">
								<Checkbox
									checked={repeatMinutes !== null}
									onCheckedChange={(checked) =>
										setRepeatMinutes(checked ? 10 : null)
									}
								/>
								<Input
									id="repeatMinutes"
									type="number"
									value={repeatMinutes ?? "0"}
									disabled={repeatMinutes === null}
									onChange={(e) => setRepeatMinutes(+e.target.value)}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button isLoading={isLoading}>{submitText}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
