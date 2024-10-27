import { TransactionProvider, useTransactionContext } from "@/context/TransactionContext";
import * as transactionsService from "@/services/transactionsService";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import toast from "react-hot-toast";

jest.mock("@/services/transactionsService");
jest.mock("react-hot-toast");

describe("TransactionContext", () => {
	const TestComponent = () => {
		const {
			totalExpenses,
			totalIncome,
			balance,
			handleAddTransaction,
			handleUpdateTransaction,
			handleDeleteTransaction,
		} = useTransactionContext();
		return (
			<div>
				<p data-testid="income">{totalIncome}</p>
				<p data-testid="expenses">{totalExpenses}</p>
				<p data-testid="balance">{balance}</p>

				<button
					data-testid="add-transaction"
					onClick={() =>
						handleAddTransaction({
							id: "3",
							type: "income",
							amount: 400,
							date: "2023-10-23",
							category: "Freelance",
						})
					}
				>
					Add
				</button>
				<button
					data-testid="update-transaction"
					onClick={() =>
						handleUpdateTransaction({
							id: "1",
							type: "income",
							amount: 600,
							date: "2024-10-10",
							category: "Income",
						})
					}
				>
					Update
				</button>
				<button
					data-testid="delete-transaction"
					onClick={() =>
						handleDeleteTransaction({
							id: "2",
							type: "expense",
							amount: 200,
							date: "2023-10-22",
							category: "Groceries",
						})
					}
				>
					Delete
				</button>
			</div>
		);
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should handle initial state with no transactions", async () => {
		(transactionsService.getTransactions as jest.Mock).mockResolvedValueOnce([]);

		await act(async () => {
			render(
				<TransactionProvider>
					<TestComponent />
				</TransactionProvider>
			);
		});

		expect(screen.getByTestId("income").textContent).toBe("0");
		expect(screen.getByTestId("expenses").textContent).toBe("0");
		expect(screen.getByTestId("balance").textContent).toBe("0");
	});

	it("should fetch and set transactions on mount", async () => {
		const mockTransactions = [
			{ id: "1", type: "income", amount: 500, date: "2023-10-21", category: "Salary" },
			{ id: "2", type: "expense", amount: 200, date: "2023-10-22", category: "Groceries" },
		];

		(transactionsService.getTransactions as jest.Mock).mockResolvedValueOnce(mockTransactions);

		await act(async () => {
			render(
				<TransactionProvider>
					<TestComponent />
				</TransactionProvider>
			);
		});

		expect(screen.getByTestId("income").textContent).toBe("500");
		expect(screen.getByTestId("expenses").textContent).toBe("200");
		expect(screen.getByTestId("balance").textContent).toBe("300");
	});

	it("displays error when fetching transactions fails", async () => {
		(transactionsService.getTransactions as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

		await act(async () => {
			render(
				<TransactionProvider>
					<TestComponent />
				</TransactionProvider>
			);
		});

		expect(toast.error).toHaveBeenCalledWith("Network Error");
	});

	it("should handle adding a transaction", async () => {
		const mockTransaction = {
			id: "3",
			type: "income",
			amount: 400,
			date: "2023-10-23",
			category: "Freelance",
		};

		(transactionsService.getTransactions as jest.Mock).mockResolvedValueOnce([
			{ id: "1", type: "income", amount: 500, date: "2023-09-23", category: "Freelance" },
		]);
		(transactionsService.addTransaction as jest.Mock).mockResolvedValueOnce(mockTransaction);

		await act(async () => {
			render(
				<TransactionProvider>
					<TestComponent />
				</TransactionProvider>
			);
		});

		await act(async () => {
			screen.getByTestId("add-transaction").click();
		});

		expect(transactionsService.addTransaction).toHaveBeenCalledWith(mockTransaction);
		expect(screen.getByTestId("income").textContent).toBe("900"); // 500 + 400
	});

	it("should handle updating a transaction", async () => {
		const initialTransactions = [{ id: "1", type: "income", amount: 500, date: "2023-10-21", category: "Salary" }];
		const updatedTransaction = {
			id: "1",
			type: "income",
			amount: 600,
			date: "2024-10-10",
			category: "Income",
		};

		(transactionsService.getTransactions as jest.Mock).mockResolvedValueOnce(initialTransactions);
		(transactionsService.updateTransaction as jest.Mock).mockResolvedValueOnce(updatedTransaction);

		await act(async () => {
			render(
				<TransactionProvider>
					<TestComponent />
				</TransactionProvider>
			);
		});

		await act(async () => {
			screen.getByTestId("update-transaction").click();
		});

		expect(transactionsService.updateTransaction).toHaveBeenCalledWith(expect.objectContaining(updatedTransaction));
		expect(screen.getByTestId("income").textContent).toBe("600");
	});

	it("should handle deleting a transaction", async () => {
		const initialTransactions = [
			{ id: "1", type: "income", amount: 500, date: "2023-10-21", category: "Salary" },
			{ id: "2", type: "expense", amount: 200, date: "2023-10-22", category: "Groceries" },
		];

		// Mock the service to return initial transactions
		(transactionsService.getTransactions as jest.Mock).mockResolvedValueOnce(initialTransactions);
		(transactionsService.deleteTransaction as jest.Mock).mockResolvedValueOnce(undefined);

		await act(async () => {
			render(
				<TransactionProvider>
					<TestComponent />
				</TransactionProvider>
			);
		});

		await act(async () => {
			screen.getByTestId("delete-transaction").click();
		});

		expect(transactionsService.deleteTransaction).toHaveBeenCalledWith({
			id: "2",
			type: "expense",
			amount: 200,
			date: "2023-10-22",
			category: "Groceries",
		});

		expect(screen.getByTestId("income").textContent).toBe("500");
		expect(screen.getByTestId("expenses").textContent).toBe("0");
		expect(screen.getByTestId("balance").textContent).toBe("500");
	});
});
