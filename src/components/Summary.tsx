"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionContext } from "@/context/TransactionContext";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

const SummaryCard = () => {
	const { balance, totalIncome, totalExpenses } = useTransactionContext();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Financial Summary</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-bold">${balance.toFixed(2)}</div>
				<p className="text-sm text-muted-foreground">Current Balance</p>

				<div className="mt-4 grid grid-cols-2 gap-4">
					<div className="flex items-center">
						<ArrowUpIcon className="mr-2 text-green-500" />
						<div>
							<p className="text-sm text-muted-foreground">Total Income</p>
							<p className="font-medium">${totalIncome.toFixed(2)}</p>
						</div>
					</div>
					<div className="flex items-center">
						<ArrowDownIcon className="mr-2 text-red-500" />
						<div>
							<p className="text-sm text-muted-foreground">Total Expenses</p>
							<p className="font-medium">${totalExpenses.toFixed(2)}</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SummaryCard;
