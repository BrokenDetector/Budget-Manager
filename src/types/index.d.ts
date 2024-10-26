interface Transaction {
	id: string;
	type: "income" | "expense";
	category: string;
	amount: number;
	date: string;
}

interface Category {
	id: number;
	name: string;
}
