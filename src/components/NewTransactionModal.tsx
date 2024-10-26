"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactionContext } from "@/context/TransactionContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const transactionSchema = z.object({
	category: z.string().min(1, "Category is required"),
	type: z.enum(["income", "expense"], { required_error: "Type is required" }),
	amount: z.number().positive("Amount must be positive"),
});

interface TransactionModalProps {
	categories: Category[];
	transactionToEdit: Transaction | null;
	clearState: () => void;
}

const TransactionModal: FC<TransactionModalProps> = ({ categories, transactionToEdit, clearState }) => {
	const { handleAddTransaction, handleUpdateTransaction } = useTransactionContext();
	const [open, setOpen] = useState(false);

	const form = useForm<z.infer<typeof transactionSchema>>({
		resolver: zodResolver(transactionSchema),
		defaultValues: {
			category: "",
			type: "income",
			amount: 0,
		},
	});

	useEffect(() => {
		if (transactionToEdit) {
			setOpen(true);
			form.reset({
				category: transactionToEdit.category,
				type: transactionToEdit.type,
				amount: transactionToEdit.amount,
			});
		} else {
			form.reset({
				category: "",
				type: "income",
				amount: 0,
			});
		}
	}, [transactionToEdit, form]);

	const onSubmit = (data: z.infer<typeof transactionSchema>) => {
		if (transactionToEdit) {
			// Edit existing transaction
			const updatedTransaction: Transaction = {
				...transactionToEdit,
				...data,
			};
			handleUpdateTransaction(updatedTransaction);
		} else {
			// Add new transaction
			const newTransaction: Transaction = {
				...data,
				id: nanoid(),
				date: new Date().toISOString().split("T")[0],
			};
			handleAddTransaction(newTransaction);
		}
		form.reset();
		clearState();
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<Button
				onClick={() => setOpen(true)}
				className="rounded-xl"
			>
				Add New Transaction
			</Button>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{transactionToEdit ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
					<DialogDescription>
						{transactionToEdit
							? "Make changes to your transaction here. Click save when you're done."
							: "Enter the details of your new transaction here."}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className="max-h-[200px] overflow-y-auto">
											{categories.map((category) => (
												<SelectItem
													key={category.id}
													value={category.name}
												>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select transaction type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="income">Income</SelectItem>
											<SelectItem value="expense">Expense</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.01"
											placeholder="Enter amount"
											{...field}
											onChange={(e) => field.onChange(parseFloat(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">{transactionToEdit ? "Save Changes" : "Add Transaction"}</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default TransactionModal;
