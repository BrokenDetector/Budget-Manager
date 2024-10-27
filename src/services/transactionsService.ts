"use server";

import { db } from "@/lib/db";

const API_URL = "http://localhost:3001/transactions";
const useRedis = process.env.USE_REDIS === "true";

const performTransactionOperation = async (
	method: "GET" | "POST" | "PUT" | "DELETE",
	transaction?: Transaction
): Promise<Transaction[] | Transaction | { message: string }> => {
	if (useRedis) {
		let transactions = ((await db.get("transactions")) as Transaction[]) || null;
		transactions = transactions || [];

		switch (method) {
			case "GET":
				return transactions;

			case "POST":
				transactions.push(transaction!);
				await db.set("transactions", JSON.stringify(transactions));
				return transaction!;

			case "DELETE":
				// Remove transaction by ID
				transactions = transactions.filter((tx: Transaction) => tx.id !== transaction!.id);
				await db.set("transactions", JSON.stringify(transactions));
				return { message: `Transaction with ID ${transaction} deleted successfully.` };

			case "PUT":
				// Update transaction by ID
				transactions = transactions.map((tx: Transaction) => (tx.id === transaction!.id ? transaction! : tx));
				await db.set("transactions", JSON.stringify(transactions));
				return transaction!;
		}
	} else {
		// Handle requests to JSON server
		const requestOptions: RequestInit = {
			method,
			headers: { "Content-Type": "application/json" },
			body: method === "GET" ? undefined : JSON.stringify(transaction),
		};

		const response = await fetch(method === "DELETE" ? `${API_URL}/${transaction!.id}` : API_URL, requestOptions);

		if (!response.ok) {
			const errorResponse = await response.json();
			throw new Error(`Error ${response.status}: ${errorResponse.message || response.statusText}`);
		}

		const responseData = await response.json();
		return method === "GET"
			? responseData
			: method === "POST"
			? responseData
			: { message: `Transaction with ID ${transaction!.id} deleted successfully.` };
	}
};

export const getTransactions = async () => {
	return await performTransactionOperation("GET");
};

export const addTransaction = async (transaction: Transaction) => {
	return await performTransactionOperation("POST", transaction);
};

export const deleteTransaction = async (transaction: Transaction) => {
	return await performTransactionOperation("DELETE", transaction);
};

export const updateTransaction = async (updatedTransaction: Transaction) => {
	return await performTransactionOperation("PUT", updatedTransaction);
};

export const getCategories = async (): Promise<Category[]> => {
	if (useRedis) {
		const categories = ((await db.get("categories")) as Category[]) || [];
		return categories.length > 0 ? categories : [];
	} else {
		const response = await fetch(`${API_URL}/categories`);
		if (!response.ok) throw new Error(`Error: ${response.statusText}`);
		return await response.json();
	}
};
