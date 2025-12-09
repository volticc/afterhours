/**
 * Countdown utility functions for game release dates
 */

export interface CountdownData {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	isExpired: boolean;
	totalMilliseconds: number;
}

/**
 * Calculate countdown from current time to a target date
 * @param releaseDate ISO date string (YYYY-MM-DD or full ISO datetime)
 * @returns CountdownData object with time remaining
 */
export function calculateCountdown(releaseDate: string | null | undefined): CountdownData {
	if (!releaseDate) {
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			isExpired: true,
			totalMilliseconds: 0,
		};
	}

	const now = new Date().getTime();
	const targetDate = new Date(releaseDate).getTime();
	const difference = targetDate - now;

	// If the date has passed, return expired state
	if (difference <= 0) {
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			isExpired: true,
			totalMilliseconds: 0,
		};
	}

	// Calculate time units
	const days = Math.floor(difference / (1000 * 60 * 60 * 24));
	const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((difference % (1000 * 60)) / 1000);

	return {
		days,
		hours,
		minutes,
		seconds,
		isExpired: false,
		totalMilliseconds: difference,
	};
}

/**
 * Format countdown data into a human-readable string
 * @param countdown CountdownData object
 * @param format 'full' | 'compact' | 'days-only'
 * @returns Formatted countdown string
 */
export function formatCountdown(
	countdown: CountdownData,
	format: 'full' | 'compact' | 'days-only' = 'full'
): string {
	if (countdown.isExpired) {
		return '';
	}

	switch (format) {
		case 'days-only':
			if (countdown.days > 0) {
				return `${countdown.days} ${countdown.days === 1 ? 'day' : 'days'}`;
			}
			return 'Less than 1 day';

		case 'compact':
			if (countdown.days > 0) {
				return `${countdown.days}d ${countdown.hours}h`;
			}
			if (countdown.hours > 0) {
				return `${countdown.hours}h ${countdown.minutes}m`;
			}
			return `${countdown.minutes}m ${countdown.seconds}s`;

		case 'full':
		default:
			const parts: string[] = [];
			if (countdown.days > 0) {
				parts.push(`${countdown.days} ${countdown.days === 1 ? 'day' : 'days'}`);
			}
			if (countdown.hours > 0 || countdown.days > 0) {
				parts.push(`${countdown.hours} ${countdown.hours === 1 ? 'hour' : 'hours'}`);
			}
			if (countdown.minutes > 0 || countdown.hours > 0 || countdown.days > 0) {
				parts.push(`${countdown.minutes} ${countdown.minutes === 1 ? 'minute' : 'minutes'}`);
			}

			return parts.join(' ');
	}
}

/**
 * Check if a release date is in the future
 * @param releaseDate ISO date string
 * @returns true if the date is in the future
 */
export function isFutureDate(releaseDate: string | null | undefined): boolean {
	if (!releaseDate) return false;
	const targetDate = new Date(releaseDate).getTime();
	const now = new Date().getTime();
	return targetDate > now;
}

/**
 * Check if countdown should be shown based on game data
 * @param releaseDate ISO date string
 * @param showCountdown Boolean flag from game settings
 * @returns true if countdown should be displayed
 */
export function shouldShowCountdown(
	releaseDate: string | null | undefined,
	showCountdown: boolean | null | undefined
): boolean {
	// Default to showing countdown if not explicitly disabled
	const countdownEnabled = showCountdown !== false;
	return countdownEnabled && isFutureDate(releaseDate);
}
