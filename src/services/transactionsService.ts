"use server";

const API_URL = "http://localhost:3001/transactions";

export const getTransactions = async (): Promise<Transaction[]> => {
	const response = await fetch(API_URL);
	if (!response.ok) {
		throw new Error(`Error: ${response.statusText}`);
	}
	return await response.json();
};

export const addTransaction = async (transaction: Transaction): Promise<Transaction> => {
	const response = await fetch(API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(transaction),
	});
	if (!response.ok) {
		throw new Error(`Error: ${response.statusText}`);
	}
	return await response.json();
};

export const deleteTransaction = async (id: string): Promise<void> => {
	const response = await fetch(`${API_URL}/${id}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error(`Error: ${response.statusText}`);
	}
};

export const updateTransaction = async (id: string, updatedTransaction: Transaction): Promise<Transaction> => {
	const response = await fetch(`${API_URL}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(updatedTransaction),
	});
	if (!response.ok) {
		throw new Error(`Error: ${response.statusText}`);
	}
	return await response.json();
};

export const getCategories = async (): Promise<Category[]> => {
	const response = await fetch("http://localhost:3001/categories");
	if (!response.ok) {
		throw new Error(`Error: ${response.statusText}`);
	}
	return await response.json();
};
