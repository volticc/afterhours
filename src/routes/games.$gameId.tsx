import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type GameModel, GameStatus } from "@/components/data/orm/orm_game";
import { getPreviewGames } from "@/routes/admin";

export const Route = createFileRoute("/games/$gameId")({
	component: GameDetailPage,
});

function GameDetailPage() {
	const { gameId } = Route.useParams();
	const navigate = useNavigate();

	const { data: game, isLoading } = useQuery({
		queryKey: ["game", gameId],
		queryFn: async () => {
			// Load preview games from localStorage instead of ORM
			const allGames = getPreviewGames();
			const game = allGames.find(g => g.id === gameId);

			if (!game) {
				return null;
			}
			// Check if game is hidden
			if (game.is_hidden) {
				return null;
			}
			return game;
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

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-muted rounded w-1/4" />
						<div className="h-96 bg-muted rounded" />
						<div className="h-32 bg-muted rounded" />
					</div>
				</div>
			</div>
		);
	}

	if (!game) {
		return (
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto text-center">
					<Card>
						<CardContent className="py-12">
							<h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
							<p className="text-muted-foreground mb-6">
								The game you're looking for doesn't exist or has been removed.
							</p>
							<Button onClick={() => navigate({ to: "/games" })}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Games
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto">
				{/* Back Button */}
				<Button
					variant="ghost"
					className="mb-6"
					onClick={() => navigate({ to: "/games" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Games
				</Button>

				{/* Game Header */}
				<div className="mb-8">
					<div className="flex items-start justify-between mb-4">
						<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							{game.title}
						</h1>
						<Badge className={getStatusColor(game.status)} variant="outline">
							{getStatusLabel(game.status)}
						</Badge>
					</div>
					{game.category && (
						<p className="text-lg text-muted-foreground">
							Genre: <span className="font-medium text-foreground">{game.category}</span>
						</p>
					)}
				</div>

				{/* Cover Image */}
				{game.cover_image && (
					<Card className="mb-8 overflow-hidden">
						<div className="relative w-full h-96 bg-muted">
							<img
								src={game.cover_image}
								alt={game.title}
								className="w-full h-full object-cover"
							/>
						</div>
					</Card>
				)}

				{/* Description */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>About This Game</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-foreground/80 whitespace-pre-wrap">
							{game.long_description || game.short_description}
						</p>
					</CardContent>
				</Card>

				{/* Screenshots */}
				{game.screenshots && game.screenshots.length > 0 && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Screenshots</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{game.screenshots.map((screenshot: string, index: number) => (
									<div key={index} className="relative w-full h-48 overflow-hidden rounded-md bg-muted">
										<img
											src={screenshot}
											alt={`${game.title} screenshot ${index + 1}`}
											className="w-full h-full object-cover transition-transform hover:scale-105"
										/>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Tags */}
				{game.tags && game.tags.length > 0 && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Tags</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{game.tags.map((tag: string, index: number) => (
									<Badge key={index} variant="secondary">
										{tag}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				)}

			</div>
		</div>
	);
}
