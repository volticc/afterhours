import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { calculateCountdown, formatCountdown, shouldShowCountdown } from "@/lib/countdown-utils";
import { Badge } from "@/components/ui/badge";

interface GameCountdownProps {
	releaseDate: string | null | undefined;
	showCountdown: boolean | null | undefined;
	variant?: "card" | "detail";
	className?: string;
}

/**
 * Live countdown component for game release dates
 * Automatically updates every second and hides when date has passed
 */
export function GameCountdown({ releaseDate, showCountdown, variant = "card", className = "" }: GameCountdownProps) {
	const [countdown, setCountdown] = useState(() => calculateCountdown(releaseDate));

	// Update countdown every second
	useEffect(() => {
		if (!shouldShowCountdown(releaseDate, showCountdown)) {
			return;
		}

		const timer = setInterval(() => {
			setCountdown(calculateCountdown(releaseDate));
		}, 1000);

		return () => clearInterval(timer);
	}, [releaseDate, showCountdown]);

	// Don't render if countdown shouldn't be shown or has expired
	if (!shouldShowCountdown(releaseDate, showCountdown) || countdown.isExpired) {
		return null;
	}

	// Card variant - compact countdown for game showcase cards
	if (variant === "card") {
		return (
			<Badge variant="outline" className={`flex items-center gap-1 text-xs border-blue-500/50 bg-blue-500/10 text-blue-400 ${className}`}>
				<Clock className="h-3 w-3" />
				<span>Releasing in: {formatCountdown(countdown, 'compact')}</span>
			</Badge>
		);
	}

	// Detail variant - larger countdown for detail view
	return (
		<div className={`flex items-center gap-3 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 ${className}`}>
			<Clock className="h-6 w-6 text-blue-400" />
			<div>
				<p className="text-sm font-medium text-blue-400">Releasing in</p>
				<p className="text-xl font-bold text-foreground">{formatCountdown(countdown, 'full')}</p>
			</div>
		</div>
	);
}
