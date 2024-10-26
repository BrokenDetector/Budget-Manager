"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { PencilIcon, TrashIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";
import DateRangeSelector from "./DateRangeSelector";
import NewTransactionModal from "./NewTransactionModal";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TransactionListProps {
	categories: Category[];
	transactions: Transaction[];
}

const TransactionList: FC<TransactionListProps> = ({ categories, transactions }) => {
	const { handleDeleteTransaction } = useTransactionContext();
	const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	const filteredTransactions = useMemo(() => {
		const start = startDate ? new Date(startDate) : null;
		const end = endDate ? new Date(endDate) : null;
		return transactions.filter((transaction) => {
			const transactionDate = new Date(transaction.date);
			return (!start || transactionDate >= start) && (!end || transactionDate <= end);
		});
	}, [transactions, startDate, endDate]);

	const handleEditClick = (transaction: Transaction) => {
		setEditingTransaction(transaction);
	};

	const handleModalClose = () => {
		setEditingTransaction(null);
	};

	return (
		<Card className="col-span-full md:col-span-1 lg:col-span-2">
			<CardHeader className="flex flex-row items-center justify-between space-x-2">
				<CardTitle>Recent Transactions</CardTitle>
				<div className="flex flex-col lg:flex-row items-center gap-2">
					<DateRangeSelector
						onStartDateChange={setStartDate}
						onEndDateChange={setEndDate}
					/>
					<NewTransactionModal
						categories={categories}
						transactionToEdit={editingTransaction}
						clearState={handleModalClose}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col w-full p-4 space-y-4 overflow-y-auto max-h-60">
					<ul>
						{filteredTransactions
							.slice()
							.reverse()
							.map((transaction) => (
								<div
									key={transaction.id}
									className="flex items-center justify-between"
								>
									<div>
										<p className="font-medium">{transaction.category}</p>
										<p className="text-sm text-muted-foreground">
											{transaction.type === "income" ? "Income" : "Expense"}
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<div
											className={`font-bold ${
												transaction.type === "income" ? "text-green-500" : "text-red-500"
											}`}
										>
											{transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleEditClick(transaction)}
										>
											<PencilIcon className="h-4 w-4" />
											<span className="sr-only">Edit transaction</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDeleteTransaction(transaction.id)}
										>
											<TrashIcon className="h-4 w-4" />
											<span className="sr-only">Delete transaction</span>
										</Button>
									</div>
								</div>
							))}
					</ul>
				</div>
			</CardContent>
		</Card>
	);
};

export default TransactionList;
