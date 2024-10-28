"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Chart } from "chart.js/auto";
import { FC, useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const TransactionCharts: FC = () => {
	const [timePeriod, setTimePeriod] = useState<"This Week" | "This Month" | "This Year">("This Month");
	const { transactions } = useTransactionContext();

	const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

	Chart.defaults.responsive = true;
	Chart.defaults.maintainAspectRatio = false;

	useEffect(() => {
		filterTransactionsByTimePeriod(timePeriod);
	}, [transactions, timePeriod]);

	const filterTransactionsByTimePeriod = (period: string) => {
		const now = new Date();
		let filtered: Transaction[];

		switch (period) {
			case "This Week":
				const startOfWeek = new Date(now);
				const dayOfWeek = startOfWeek.getDay();

				if (dayOfWeek === 0) {
					// If it's Sunday, go back to the previous Monday
					startOfWeek.setDate(startOfWeek.getDate() - 6);
				} else {
					// For other days, go back to the most recent Monday
					startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1));
				}
				startOfWeek.setHours(0, 0, 0, 0);

				const endOfWeek = new Date(startOfWeek);
				endOfWeek.setDate(endOfWeek.getDate() + 7);
				endOfWeek.setHours(0, 0, 0, 0);

				filtered = transactions.filter((transaction) => {
					const transactionDate = new Date(transaction.date);
					return transactionDate >= startOfWeek && transactionDate < endOfWeek;
				});

				break;

			case "This Month":
				const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
				startOfMonth.setHours(0, 0, 0, 0);
				filtered = transactions.filter((transaction) => {
					const transactionDate = new Date(transaction.date);
					return transactionDate >= startOfMonth && transactionDate <= now;
				});
				break;

			case "This Year":
				const startOfYear = new Date(now.getFullYear(), 0, 1);
				startOfYear.setHours(0, 0, 0, 0);
				filtered = transactions.filter((transaction) => {
					const transactionDate = new Date(transaction.date);
					return transactionDate >= startOfYear && transactionDate <= now;
				});
				break;
			default:
				filtered = transactions;
				break;
		}
		setFilteredTransactions(filtered);
	};

	const handleTimePeriodChange = (value: "This Week" | "This Month" | "This Year") => {
		setTimePeriod(value);
	};

	const aggregateByCategory = (type: "income" | "expense") => {
		return filteredTransactions
			.filter((transaction) => transaction.type === type)
			.reduce((acc: { [key: string]: number }, transaction) => {
				const category = transaction.category;
				acc[category] = (acc[category] || 0) + transaction.amount;
				return acc;
			}, {});
	};

	const aggregatedExpenses = aggregateByCategory("expense");
	const aggregatedIncome = aggregateByCategory("income");

	const expenseLabels = Object.keys(aggregatedExpenses);
	const incomeLabels = Object.keys(aggregatedIncome);
	const combinedLabels = [...new Set([...expenseLabels, ...incomeLabels])];

	const expenseData = combinedLabels.map((label) => aggregatedExpenses[label] || 0);
	const incomeData = combinedLabels.map((label) => aggregatedIncome[label] || 0);

	return (
		<Card className="col-span-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Financial Statistics</CardTitle>
					<CardDescription>Your income and expenses over time</CardDescription>
				</div>
				<div className="flex items-center">
					<CalendarIcon className="mr-2 h-4 w-4" />
					<Select
						value={timePeriod}
						onValueChange={handleTimePeriodChange}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select time period" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="This Week">This Week</SelectItem>
							<SelectItem value="This Month">This Month</SelectItem>
							<SelectItem value="This Year">This Year</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col xl:flex-row w-full gap-2 justify-between">
					<div className="w-full h-[300px] p-2">
						<Line
							data={{
								labels: filteredTransactions.map((transaction) => transaction.date),
								datasets: [
									{
										label: "Income",
										data: filteredTransactions.map((transaction) => {
											return transaction.type === "income" ? transaction.amount : 0;
										}),
										borderColor: "#22c55e",
										backgroundColor: "rgba(34, 197, 94, 0.2)",
										tension: 0.1,
									},
									{
										label: "Expense",
										data: filteredTransactions.map((transaction) => {
											return transaction.type === "expense" ? transaction.amount : 0;
										}),
										borderColor: "#FF3030",
										backgroundColor: "rgba(255, 48, 48, 0.2)",
										tension: 0.1,
									},
								],
							}}
							options={{
								plugins: {
									title: {
										display: true,
										text: "Income vs. Expense",
									},
								},
							}}
						/>
					</div>

					<div className="w-full h-[300px] border-l p-2">
						<Bar
							data={{
								labels: combinedLabels,
								datasets: [
									{
										label: "Expense",
										data: expenseData,
										borderColor: "#FF3030",
										backgroundColor: "#FF3030",
									},
									{
										label: "Income",
										data: incomeData,
										borderColor: "#22c55e",
										backgroundColor: "#22c55e",
									},
								],
							}}
							options={{
								plugins: {
									title: {
										display: true,
										text: "Expenses vs Income by Category",
									},
								},
							}}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default TransactionCharts;
