"use client";
import { ThemeProvider } from "@/context/ThemeContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
	children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
	return (
		<>
			<Toaster
				position="top-center"
				reverseOrder={false}
			/>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<TransactionProvider>{children}</TransactionProvider>
			</ThemeProvider>
		</>
	);
};

export default Providers;
