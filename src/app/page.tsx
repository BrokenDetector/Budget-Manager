import ChangeThemeButton from "@/components/ChangeThemeButton";
import SummaryCard from "@/components/Summary";
import TransactionContainer from "@/components/TransactionContainer";
import { getCategories } from "@/services/transactionsService";

export default async function Home() {
	const fetchData = async () => {
		try {
			const categories = await getCategories();
			return categories;
		} catch (error) {
			console.error("❗ERROR: ", error);
			return [];
		}
	};
	const categories = await fetchData();

	return (
		<div className="min-h-screen">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<h1 className="text-2xl font-bold">Budget Manager</h1>
					<ChangeThemeButton />
				</div>
			</header>
			<main className="container mx-auto px-4 py-8">
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<SummaryCard />
					<TransactionContainer categories={categories as Category[]} />
				</div>
			</main>
		</div>
	);
}
