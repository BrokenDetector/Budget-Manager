import Providers from "@/components/Providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Budget Manager",
	description: "- Track your income and expenses effortlessly. Visualize transactions, monitor spending by category.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body>
				<Providers> {children}</Providers>
			</body>
		</html>
	);
}
