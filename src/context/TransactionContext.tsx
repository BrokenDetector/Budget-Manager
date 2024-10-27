"use client";

import { addTransaction, deleteTransaction, getTransactions, updateTransaction } from "@/services/transactionsService";
import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TransactionContextType {
	transactions: Transaction[];
	handleAddTransaction: (transaction: Transaction) => void;
	handleDeleteTransaction: (transaction: Transaction) => void;
	handleUpdateTransaction: (updatedTransaction: Transaction) => void;
	totalIncome: number;
	totalExpenses: number;
	balance: number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [totalIncome, setTotalIncome] = useState(0);
	const [totalExpenses, setTotalExpenses] = useState(0);
	const [balance, setBalance] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = (await getTransactions()) as Transaction[];

				setTransactions(data || []);
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("An unknown error occurred.");
				}
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		updateFinancialSummary();
	}, [transactions]);

	const updateFinancialSummary = () => {
		const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);

		const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

		setTotalIncome(income);
		setTotalExpenses(expenses);
		setBalance(income - expenses);
	};

	const handleAddTransaction = async (transaction: Transaction) => {
		setTransactions((prev) => [...prev, transaction]);
		try {
			await addTransaction(transaction);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred.");
			}
		}
	};

	const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
		setTransactions((prev) =>
			prev.map((transaction) =>
				transaction.id === updatedTransaction.id ? { ...transaction, ...updatedTransaction } : transaction
			)
		);
		try {
			await updateTransaction(updatedTransaction);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred.");
			}
		}
	};

	const handleDeleteTransaction = async (transaction: Transaction) => {
		setTransactions((prev) => prev.filter((tx) => tx.id !== transaction.id));
		try {
			await deleteTransaction(transaction);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred.");
			}
		}
	};

	return (
		<TransactionContext.Provider
			value={{
				transactions,
				handleAddTransaction,
				handleDeleteTransaction,
				handleUpdateTransaction,
				totalIncome,
				totalExpenses,
				balance,
			}}
		>
			{children}
		</TransactionContext.Provider>
	);
};

export const useTransactionContext = () => {
	const context = useContext(TransactionContext);
	if (context === undefined) {
		throw new Error("useTransactionContext must be used within a TransactionProvider");
	}
	return context;
};
