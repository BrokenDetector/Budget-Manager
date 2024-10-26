"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format, subDays } from "date-fns";
import { FC, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
}

const DateRangeSelector: FC<DateRangeSelectorProps> = ({ onStartDateChange, onEndDateChange }) => {
	const [date, setDate] = useState<DateRange | undefined>({ from: subDays(new Date(), 30), to: new Date() });

	// Sync the state with the parent component when date changes
	useEffect(() => {
		if (date?.from) {
			onStartDateChange(format(date.from, "yyyy-MM-dd"));
		}
		if (date?.to) {
			onEndDateChange(format(date.to, "yyyy-MM-dd"));
		}
	}, [date, onStartDateChange, onEndDateChange]);

	return (
		<div className="grid gap-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(" justify-start text-left font-normal", !date && "text-muted-foreground")}
					>
						<CalendarIcon />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
								</>
							) : (
								format(date.from, "LLL dd, y")
							)
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0"
					align="start"
				>
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default DateRangeSelector;
