"use server";

import { db } from "@/lib/db";

// Define the Transaction type if not defined elsewhere
interface Transaction {
	id: string;
	type: string;
	category: string;
	amount: number;
	date: string;
}

const API_URL = "http://localhost:3001/transactions";
const useRedis = process.env.USE_REDIS === "true";

const performTransactionOperation = async (
	method: "GET" | "POST" | "PUT" | "DELETE",
	transaction?: Transaction | { id: string }
): Promise<Transaction[] | Transaction | { message: string }> => {
	if (useRedis) {
		// Handle operations using Redis
		let transactions = ((await db.get("transactions")) as Transaction[]) || [];

		switch (method) {
			case "GET":
				return transactions;

			case "POST":
				if (!transaction) throw new Error("Transaction data is required for POST.");
				transactions.push(transaction as Transaction);
				await db.set("transactions", JSON.stringify(transactions));
				return transaction as Transaction;

			case "DELETE":
				if (!transaction || typeof transaction.id !== "string")
					throw new Error("Transaction ID is required for DELETE.");
				transactions = transactions.filter((tx: Transaction) => tx.id !== transaction.id);
				await db.set("transactions", JSON.stringify(transactions));
				return { message: `Transaction with ID ${transaction.id} deleted successfully.` };

			case "PUT":
				if (!transaction) throw new Error("Transaction data is required for PUT.");
				transactions = transactions.map((tx: Transaction) =>
					tx.id === transaction!.id ? (transaction as Transaction) : tx
				);
				await db.set("transactions", JSON.stringify(transactions));
				return transaction as Transaction;

			default:
				throw new Error("Invalid method for Redis operations");
		}
	} else {
		// Handle requests to JSON server
		let requestOptions: RequestInit | undefined;
		switch (method) {
			case "GET":
				requestOptions = {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				};
				break;

			case "POST":
				if (!transaction) throw new Error("Transaction data is required for POST.");
				requestOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(transaction),
				};
				break;

			case "PUT":
				if (!transaction) throw new Error("Transaction data is required for PUT.");
				requestOptions = {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(transaction),
				};
				break;

			case "DELETE":
				if (!transaction || typeof transaction.id !== "string")
					throw new Error("Transaction ID is required for DELETE.");
				requestOptions = {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
				};
				break;

			default:
				throw new Error("Invalid method for JSON server");
		}

		// Determine the URL for the fetch request
		const url = method === "DELETE" ? `${API_URL}/${transaction!.id}` : API_URL;
		console.log(url);
		try {
			const response = await fetch(url, requestOptions);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Error ${response.status}: ${errorText}`);
			}

			const responseData = await response.json();

			switch (method) {
				case "GET":
					return responseData;

				case "POST":
				case "PUT":
					return responseData;

				case "DELETE":
					return { message: `Transaction with ID ${transaction!.id} deleted successfully.` };

				default:
					throw new Error("Invalid method for JSON server");
			}
		} catch (error) {
			console.error("Error during transaction operation:", error);
			throw error;
		}
	}
};

export const getTransactions = async (): Promise<Transaction[]> => {
	return (await performTransactionOperation("GET")) as Transaction[];
};

export const addTransaction = async (transaction: Transaction): Promise<Transaction> => {
	return (await performTransactionOperation("POST", transaction)) as Transaction;
};

export const deleteTransaction = async (id: string): Promise<{ message: string }> => {
	return (await performTransactionOperation("DELETE", { id })) as { message: string };
};

export const updateTransaction = async (id: string, updatedTransaction: Transaction): Promise<Transaction> => {
	return (await performTransactionOperation("PUT", { ...updatedTransaction, id })) as Transaction;
};

export const getCategories = async (): Promise<Category[]> => {
	if (useRedis) {
		const categories = ((await db.get("categories")) as Category[]) || [];
		return categories.length > 0 ? categories : [];
	} else {
		const response = await fetch("http://localhost:3001/categories");
		if (!response.ok) throw new Error(`Error: ${response.statusText}`);
		return await response.json();
	}
};
