import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Gamepad2, Users, Mail, MessageCircle, Shield, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";
import { HeroSection } from "@/components/HeroSection";
import { loadHeroSectionFromStorage, initializeDefaultHeroSection } from "@/lib/hero-section-storage";
import { getPreviewGames } from "@/routes/admin";
import { type GameModelPreview } from "@/lib/game-preview-types";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const [email, setEmail] = useState("");
	const { currentAdmin, isAuthenticated } = useAuth();

	// Only show admin test banner if user is an admin
	const isAdmin = isAuthenticated && currentAdmin !== null;

	// Hero Section state
	const [heroConfig, setHeroConfig] = useState(() => {
		const config = loadHeroSectionFromStorage();
		return config || initializeDefaultHeroSection();
	});
	const [featuredGame, setFeaturedGame] = useState<GameModelPreview | null>(null);

	// Listen for hero section updates from admin panel
	useEffect(() => {
		const handleHeroUpdate = (event: Event) => {
			const customEvent = event as CustomEvent;
			const updatedConfig = customEvent.detail;
			if (updatedConfig) {
				setHeroConfig(updatedConfig);
			}
		};

		window.addEventListener('hero-section-updated', handleHeroUpdate);
		return () => window.removeEventListener('hero-section-updated', handleHeroUpdate);
	}, []);

	// Load featured game when hero config changes
	useEffect(() => {
		if (heroConfig.featured_game_id) {
			const allGames = getPreviewGames();
			const game = allGames.find((g: GameModelPreview) => g.id === heroConfig.featured_game_id);
			setFeaturedGame(game || null);
		} else {
			setFeaturedGame(null);
		}
	}, [heroConfig.featured_game_id]);

	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('home')) {
			initializePageBlocks('home', [
				{ id: 'hero-title', type: BlockType.Heading, content: 'After Hours Studio', order: 0 },
				{ id: 'hero-subtitle', type: BlockType.Subtitle, content: 'Creating unsettling experiences that live After Hours', order: 1 },
				{ id: 'hero-description', type: BlockType.Paragraph, content: 'Independent video game development studio specializing in indie horror and immersive storytelling. Where creativity meets darkness, and every game tells a haunting tale.', order: 2 },
				{ id: 'section-newsletter-title', type: BlockType.Heading, content: 'Stay Updated', order: 3 },
				{ id: 'section-philosophy-title', type: BlockType.Heading, content: 'Our Philosophy', order: 4 },
				{ id: 'card-horror-title', type: BlockType.Subtitle, content: 'Indie Horror', order: 5 },
				{ id: 'card-horror-description', type: BlockType.Paragraph, content: 'Crafting psychological experiences that challenge perceptions and linger in memory long after the game ends.', order: 6 },
				{ id: 'card-storytelling-title', type: BlockType.Subtitle, content: 'Immersive Storytelling', order: 7 },
				{ id: 'card-storytelling-description', type: BlockType.Paragraph, content: 'Every detail matters. We build worlds that feel alive, with narratives that draw you deeper into the darkness.', order: 8 },
				{ id: 'card-creativity-title', type: BlockType.Subtitle, content: 'Night-Shift Creativity', order: 9 },
				{ id: 'card-creativity-description', type: BlockType.Paragraph, content: 'Born from the quiet hours of the night, where creativity flows freely and unsettling ideas take shape.', order: 10 },
			]);
		}
	}, []);

	// Unified blocks - ALL content comes from this single source
	const allBlocks = usePageBlocks('home');

	const handleNewsletterSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Newsletter signup will be handled by the database
		console.log("Newsletter signup:", email);
		setEmail("");
	};

	return (
		<div className="flex flex-col">
			{/* Hero Section */}
			<HeroSection
				title={heroConfig.hero_title}
				tagline={heroConfig.hero_tagline}
				backgroundImage={heroConfig.hero_background_image}
				featuredGame={featuredGame}
			/>

			{/* Admin Test Access Banner - Only visible to admins */}
			{isAdmin && (
				<section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
						<div className="max-w-4xl mx-auto">
							<Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Shield className="h-5 w-5 text-accent" />
										Admin Access - Testing Mode
									</CardTitle>
									<CardDescription>
										Click below to access the admin dashboard and test all administrative features
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex flex-col sm:flex-row gap-4">
										<Button asChild size="lg" variant="default" className="flex-1">
											<Link to="/admin">
												<KeyRound className="mr-2 h-5 w-5" />
												Access Admin Panel
											</Link>
										</Button>
									</div>
									<div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm">
										<p className="font-semibold text-green-600 dark:text-green-400">
											✓ Logged in as admin
										</p>
										<p className="text-muted-foreground mt-1">
											Click the button above to access your admin dashboard
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>
			)}

			{/* Dynamic Content Section - ALL page content rendered from blocks */}
			<section className="py-20">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto space-y-4">
						{renderBlocks(allBlocks)}
					</div>
				</div>
			</section>

			{/* Newsletter Section - Kept as functional component, not editable text */}
			<section className="py-20 bg-card/50">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-2xl mx-auto">
						<Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Mail className="h-5 w-5 text-accent" />
									Early Access Newsletter
								</CardTitle>
								<CardDescription>
									Sign up to become an early access tester and get exclusive updates
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
									<Input
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="flex-1"
									/>
									<Button type="submit" className="sm:w-auto">
										Subscribe
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Action Buttons Section */}
			<section className="py-12 bg-gradient-to-b from-background via-background/95 to-card">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Button asChild size="lg" className="min-w-[160px]">
							<Link to="/games">
								<Gamepad2 className="mr-2 h-5 w-5" />
								View Games
							</Link>
						</Button>
						<Button asChild size="lg" variant="secondary" className="min-w-[160px]">
							<Link to="/support">
								<MessageCircle className="mr-2 h-5 w-5" />
								Support Chat
							</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
