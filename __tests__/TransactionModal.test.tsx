import TransactionModal from "@/components/NewTransactionModal";
import { TransactionProvider } from "@/context/TransactionContext";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";

const mockCategories = [
	{ id: "1", name: "Groceries" },
	{ id: "2", name: "Salary" },
];

const mockTransactionToEdit: Transaction = {
	id: "123",
	category: "Salary",
	type: "income",
	amount: 1000,
	date: "2024-10-20",
};


describe("TransactionModal Component", () => {
	const clearState = jest.fn();


	const renderModal = async (transactionToEdit: Transaction | null = null) => {
		await act(async () => {
			render(
				<TransactionProvider>
					<TransactionModal
						categories={mockCategories}
						transactionToEdit={transactionToEdit}
						clearState={clearState}
					/>
				</TransactionProvider>
			);
		});
	};

	it("renders add transaction form correctly", async () => {
		await renderModal();
		expect(screen.getByText("Add New Transaction")).toBeInTheDocument();
	});

	it("renders edit transaction form when transactionToEdit is provided", async () => {
		await renderModal(mockTransactionToEdit);
		expect(screen.getByDisplayValue("Salary")).toBeInTheDocument();
		expect(screen.getByDisplayValue("1000")).toBeInTheDocument();
	});

	it("validates form fields", async () => {
		await renderModal();

		await act(async () => {
			fireEvent.click(screen.getByText("Add New Transaction"));
		});

		await act(async () => {
			fireEvent.change(screen.getByPlaceholderText("Enter amount"), { target: { value: -50 } });
			fireEvent.click(screen.getByText("Add Transaction"));
		});

		expect(await screen.findByText("Amount must be a positive number")).toBeInTheDocument();

		await act(async () => {
			fireEvent.change(screen.getByPlaceholderText("Enter amount"), { target: { value: 50 } });
		});
		expect(screen.queryByText("Amount must be a positive number")).not.toBeInTheDocument();
	});

	it("submits the form for adding a transaction", async () => {
		await renderModal();

		await act(async () => {
			fireEvent.click(screen.getByText("Add New Transaction"));
		});

		await act(async () => {
			fireEvent.change(screen.getByPlaceholderText("Enter amount"), { target: { value: "500" } });
			fireEvent.click(screen.getByRole("button", { name: /Add Transaction/i }));
		});
	});

	it("submits the form for editing a transaction", async () => {
		await renderModal(mockTransactionToEdit);

		await act(async () => {
			fireEvent.change(screen.getByPlaceholderText("Enter amount"), { target: { value: "1500" } });
			fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));
		});
	});
});
