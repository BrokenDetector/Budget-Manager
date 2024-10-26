"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Chart } from "chart.js/auto";
import { FC, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface TransactionChartsProps {
	categories: Category[];
}

const TransactionCharts: FC<TransactionChartsProps> = ({ categories }) => {
	const [timePeriod, setTimePeriod] = useState<"This Week" | "This Mouth" | "This Year">("This Mouth");
	const { transactions } = useTransactionContext();

	const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);

	Chart.defaults.responsive = true;
	Chart.defaults.maintainAspectRatio = false;

	const filterTransactionsByTimePeriod = (period: string) => {
		const now = new Date();
		let filtered: Transaction[];

		switch (period) {
			case "This Week":
				const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
				filtered = transactions.filter((transaction) => {
					const transactionDate = new Date(transaction.date);
					return transactionDate >= startOfWeek;
				});
				break;
			case "This Month":
				const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
				filtered = transactions.filter((transaction) => {
					const transactionDate = new Date(transaction.date);
					return transactionDate >= startOfMonth;
				});
				break;
			case "This Year":
				const startOfYear = new Date(now.getFullYear(), 0, 1);
				filtered = transactions.filter((transaction) => {
					const transactionDate = new Date(transaction.date);
					return transactionDate >= startOfYear;
				});
				break;
			default:
				filtered = transactions;
				break;
		}
		setFilteredTransactions(filtered);
	};

	const handleTimePeriodChange = (value: "This Week" | "This Mouth" | "This Year") => {
		setTimePeriod(value);
		filterTransactionsByTimePeriod(value);
	};

	const incomeChart = filteredTransactions.filter((transaction) => transaction.type === "income");
	const expenseChart = filteredTransactions.filter((transaction) => transaction.type === "expense");

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
										data: incomeChart.map((transaction) => transaction.amount),
										borderColor: "#22c55e",
										backgroundColor: "rgba(34, 197, 94, 0.2)",
									},
									{
										label: "Expense",
										data: expenseChart.map((transaction) => transaction.amount),
										borderColor: "#FF3030",
										backgroundColor: "rgba(255, 48, 48, 0.2)",
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
								labels: categories.map((category) => category.name),
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
