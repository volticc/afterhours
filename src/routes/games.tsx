import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import GameORM, { type GameModel, GameStatus } from "@/components/data/orm/orm_game";
import { useEffect, useState } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";
import { getPreviewGames } from "@/routes/admin";
import { GameCountdown } from "@/components/GameCountdown";
import { type GameModelPreview } from "@/lib/game-preview-types";

export const Route = createFileRoute("/games")({
	component: GamesPage,
});

function GamesPage() {
	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('games')) {
			initializePageBlocks('games', [
				{ id: 'page-title', type: BlockType.Heading, content: 'Our Games', order: 0 },
				{ id: 'page-description', type: BlockType.Paragraph, content: 'Explore our collection of unsettling experiences crafted during the darkest hours', order: 1 },
			]);
		}
	}, []);

	// Unified blocks - ALL editable content comes from this single source
	const allBlocks = usePageBlocks('games');

	// Listen for preview games updates from admin panel
	const [refreshKey, setRefreshKey] = useState(0);
	const [selectedGame, setSelectedGame] = useState<GameModelPreview | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	useEffect(() => {
		const handlePreviewGamesUpdate = () => {
			setRefreshKey(prev => prev + 1);
		};

		window.addEventListener('preview-games-updated', handlePreviewGamesUpdate);
		return () => window.removeEventListener('preview-games-updated', handlePreviewGamesUpdate);
	}, []);

	const handleViewDetails = (game: GameModelPreview) => {
		setSelectedGame(game);
		setIsDetailsOpen(true);
	};

	const { data: games = [], isLoading } = useQuery({
		queryKey: ["games", refreshKey],
		queryFn: async () => {
			// Load preview games from localStorage instead of ORM
			const allGames = getPreviewGames();
			// Filter out hidden games for public view, then sort by display_order
			const visibleGames = allGames
				.filter((game: GameModelPreview) => !game.is_hidden)
				.sort((a: GameModelPreview, b: GameModelPreview) => {
					const orderA = a.display_order ?? 999999;
					const orderB = b.display_order ?? 999999;
					return orderA - orderB;
				});
			return visibleGames;
		},
	});

	const getStatusColor = (status: GameStatus) => {
		switch (status) {
			case GameStatus.Released:
				return "bg-green-500/20 text-green-400 border-green-500/50";
			case GameStatus.InDevelopment:
				return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
			case GameStatus.ComingSoon:
				return "bg-blue-500/20 text-blue-400 border-blue-500/50";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const getStatusLabel = (status: GameStatus) => {
		switch (status) {
			case GameStatus.Released:
				return "Released";
			case GameStatus.InDevelopment:
				return "In Development";
			case GameStatus.ComingSoon:
				return "Coming Soon";
			default:
				return "Unknown";
		}
	};

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-6xl mx-auto">
				{/* Dynamic editable content from blocks */}
				<div className="text-center mb-12 space-y-4">
					{renderBlocks(allBlocks)}
				</div>

				{/* Game list - database-driven, not static text */}
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(3)].map((_, i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="h-48 bg-muted rounded-md mb-4" />
									<div className="h-6 bg-muted rounded w-3/4 mb-2" />
									<div className="h-4 bg-muted rounded w-1/2" />
								</CardHeader>
							</Card>
						))}
					</div>
				) : games.length === 0 ? (
					<Card className="text-center py-12">
						<CardContent>
							<p className="text-lg text-muted-foreground mb-4">
								No games available yet. Check back soon for our upcoming releases!
							</p>
							<p className="text-sm text-muted-foreground">
								We're currently working on something special in the shadows...
							</p>
						</CardContent>
					</Card>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{games.map((game: GameModelPreview) => (
								<Card
									key={game.id}
									className="group border-primary/20 hover:border-primary/60 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.03] hover:-translate-y-1 flex flex-col h-full cursor-pointer"
								>
									<CardHeader>
										{game.cover_image && (
											<div className="relative w-full h-48 mb-4 overflow-hidden rounded-md bg-muted">
												<img
													src={game.cover_image}
													alt={game.title}
													className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
												/>
											</div>
										)}
										<div className="flex items-start justify-between gap-2">
											<CardTitle className="text-xl transition-colors duration-200 group-hover:text-primary">{game.title}</CardTitle>
											<Badge className={getStatusColor(game.status)} variant="outline">
												{getStatusLabel(game.status)}
											</Badge>
										</div>
										{game.category && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<span className="font-medium">{game.category}</span>
											</div>
										)}
										{/* Countdown display for upcoming releases */}
										<GameCountdown
											releaseDate={game.release_date}
											showCountdown={game.show_countdown}
											variant="card"
											className="mt-2"
										/>
									</CardHeader>
									<CardContent className="flex-1">
										<CardDescription className="text-foreground/70 mb-4 line-clamp-3">
											{game.short_description}
										</CardDescription>
										{game.tags && game.tags.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{game.tags.slice(0, 3).map((tag: string, index: number) => (
													<Badge key={index} variant="secondary" className="text-xs">
														{tag}
													</Badge>
												))}
												{game.tags.length > 3 && (
													<Badge variant="secondary" className="text-xs">
														+{game.tags.length - 3} more
													</Badge>
												)}
											</div>
										)}
									</CardContent>
									<CardFooter className="flex flex-col gap-2">
										<Button
											className="w-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
											variant="default"
											onClick={() => handleViewDetails(game)}
										>
											View Details
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>

						{/* Game Details Dialog */}
						<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
							<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
								{selectedGame && (
									<>
										<DialogHeader>
											<div className="flex items-start justify-between gap-4">
												<DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
													{selectedGame.title}
												</DialogTitle>
												<Badge className={getStatusColor(selectedGame.status)} variant="outline">
													{getStatusLabel(selectedGame.status)}
												</Badge>
											</div>
											{selectedGame.category && (
												<p className="text-lg text-muted-foreground">
													Genre: <span className="font-medium text-foreground">{selectedGame.category}</span>
												</p>
											)}
										</DialogHeader>

										<div className="space-y-6 mt-4">
											{/* Cover Image */}
											{selectedGame.cover_image && (
												<div className="relative w-full h-64 overflow-hidden rounded-md bg-muted">
													<img
														src={selectedGame.cover_image}
														alt={selectedGame.title}
														className="w-full h-full object-cover"
													/>
												</div>
											)}

											{/* Countdown display for upcoming releases */}
											<GameCountdown
												releaseDate={selectedGame.release_date}
												showCountdown={selectedGame.show_countdown}
												variant="detail"
											/>

											{/* Description */}
											<div>
												<h3 className="text-xl font-semibold mb-3">About This Game</h3>
												<p className="text-foreground/80 whitespace-pre-wrap">
													{selectedGame.long_description || selectedGame.short_description}
												</p>
											</div>

											{/* Screenshots */}
											{selectedGame.screenshots && selectedGame.screenshots.length > 0 && (
												<div>
													<h3 className="text-xl font-semibold mb-3">Screenshots</h3>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{selectedGame.screenshots.map((screenshot: string, index: number) => (
															<div
																key={index}
																className="group relative w-full h-48 overflow-hidden rounded-md bg-muted border border-transparent hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
															>
																<img
																	src={screenshot}
																	alt={`${selectedGame.title} screenshot ${index + 1}`}
																	className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
																/>
															</div>
														))}
													</div>
												</div>
											)}

											{/* Tags */}
											{selectedGame.tags && selectedGame.tags.length > 0 && (
												<div>
													<h3 className="text-xl font-semibold mb-3">Tags</h3>
													<div className="flex flex-wrap gap-2">
														{selectedGame.tags.map((tag: string, index: number) => (
															<Badge key={index} variant="secondary">
																{tag}
															</Badge>
														))}
													</div>
												</div>
											)}

											{/* CTA Buttons */}
											{(selectedGame.wishlist_link || selectedGame.steam_link) && (
												<div className="pt-4 border-t border-border">
													<div className="flex flex-col sm:flex-row gap-3">
														{selectedGame.wishlist_link && (
															<Button
																asChild
																size="lg"
																className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/40"
															>
																<a href={selectedGame.wishlist_link} target="_blank" rel="noopener noreferrer">
																	<ExternalLink className="mr-2 h-5 w-5" />
																	Add to Wishlist
																</a>
															</Button>
														)}
														{selectedGame.steam_link && (
															<Button
																asChild
																size="lg"
																variant={selectedGame.wishlist_link ? "secondary" : "default"}
																className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/40"
															>
																<a href={selectedGame.steam_link} target="_blank" rel="noopener noreferrer">
																	<ExternalLink className="mr-2 h-5 w-5" />
																	View on Steam
																</a>
															</Button>
														)}
													</div>
												</div>
											)}

										</div>
									</>
								)}
							</DialogContent>
						</Dialog>
					</>
				)}
			</div>
		</div>
	);
}
