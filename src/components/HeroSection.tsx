import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { type GameModelPreview } from "@/lib/game-preview-types";
import { GameCountdown } from "@/components/GameCountdown";

interface HeroSectionProps {
	title: string;
	tagline: string;
	backgroundImage: string;
	featuredGame: GameModelPreview | null;
}

/**
 * Homepage Hero Section Component
 * Displays a large hero banner with customizable content and featured game
 */
export function HeroSection({ title, tagline, backgroundImage, featuredGame }: HeroSectionProps) {
	// Determine which CTA button to show based on game settings
	const getCtaButton = () => {
		if (!featuredGame) return null;

		// Show wishlist button if wishlist_link exists
		if (featuredGame.wishlist_link) {
			return (
				<Button
					asChild
					size="lg"
					className="text-lg px-8 py-6 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
				>
					<a href={featuredGame.wishlist_link} target="_blank" rel="noopener noreferrer">
						<ExternalLink className="mr-2 h-5 w-5" />
						Add to Wishlist
					</a>
				</Button>
			);
		}

		// Show steam/buy button if steam_link exists
		if (featuredGame.steam_link) {
			return (
				<Button
					asChild
					size="lg"
					className="text-lg px-8 py-6 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
				>
					<a href={featuredGame.steam_link} target="_blank" rel="noopener noreferrer">
						<ExternalLink className="mr-2 h-5 w-5" />
						Buy Now
					</a>
				</Button>
			);
		}

		return null;
	};

	return (
		<section
			className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
			style={{
				backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}
		>
			{/* Dark overlay for better text readability */}
			<div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />

			{/* Content */}
			<div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					{/* Hero Title */}
					<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
						{title}
					</h1>

					{/* Tagline */}
					<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
						{tagline}
					</p>

					{/* Featured Game Section */}
					{featuredGame && (
						<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
							{/* Game Title */}
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
									Featured Game
								</p>
								<h2 className="text-3xl md:text-4xl font-bold text-foreground">
									{featuredGame.title}
								</h2>
							</div>

							{/* Countdown (only if release date is set and in the future) */}
							<div className="flex justify-center">
								<GameCountdown
									releaseDate={featuredGame.release_date}
									showCountdown={featuredGame.show_countdown}
									variant="detail"
								/>
							</div>

							{/* CTA Button */}
							<div className="flex justify-center pt-4">
								{getCtaButton()}
							</div>
						</div>
					)}

					{/* Fallback CTA when no featured game */}
					{!featuredGame && (
						<div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
							<Button
								asChild
								size="lg"
								className="text-lg px-8 py-6 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
							>
								<a href="/games">
									Explore Our Games
								</a>
							</Button>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
