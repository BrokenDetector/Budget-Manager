"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { FC } from "react";
import TransactionCharts from "./TransactionCharts";
import TransactionList from "./TransactionList";

interface TransactionContainerProps {
	categories: Category[];
}

const TransactionContainer: FC<TransactionContainerProps> = ({ categories }) => {
	const { transactions } = useTransactionContext();

	return (
		<>
			<TransactionList
				categories={categories}
				transactions={transactions}
			/>
			<TransactionCharts />
		</>
	);
};

export default TransactionContainer;
