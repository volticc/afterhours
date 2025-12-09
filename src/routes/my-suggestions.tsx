import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Calendar, AlertCircle, LogIn, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GameSuggestionORM, { GameSuggestionStatus, type GameSuggestionModel } from "@/components/data/orm/orm_game_suggestion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/my-suggestions")({
	component: MySuggestionsPage,
});

function MySuggestionsPage() {
	const { currentUser, isAuthenticated } = useAuth();
	const [suggestions, setSuggestions] = useState<GameSuggestionModel[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Load suggestions function
	const loadSuggestions = useCallback(async () => {
		if (!currentUser) {
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const orm = GameSuggestionORM.getInstance();

			// Query suggestions by BOTH data_creator (user ID) AND email to catch all user submissions
			const [suggestionsByCreator, suggestionsByEmail] = await Promise.all([
				orm.getGameSuggestionByDataCreator(currentUser.id),
				currentUser.email ? orm.getGameSuggestionByEmail(currentUser.email) : Promise.resolve([])
			]);

			// Combine and deduplicate suggestions (use a Map to ensure unique by ID)
			const suggestionMap = new Map<string, GameSuggestionModel>();

			[...suggestionsByCreator, ...suggestionsByEmail].forEach(suggestion => {
				suggestionMap.set(suggestion.id, suggestion);
			});

			const userSuggestions = Array.from(suggestionMap.values());

			// Sort by date (newest first)
			userSuggestions.sort((a, b) => parseInt(b.create_time) - parseInt(a.create_time));
			setSuggestions(userSuggestions);
		} catch (error) {
			console.error("Error loading suggestions:", error);
		} finally {
			setIsLoading(false);
		}
	}, [currentUser]);

	// Load suggestions when component mounts or currentUser changes
	useEffect(() => {
		loadSuggestions();
	}, [loadSuggestions, refreshTrigger]);

	// Listen for suggestion-submitted event to refresh the list
	useEffect(() => {
		const handleSuggestionSubmitted = () => {
			setRefreshTrigger(prev => prev + 1);
		};

		window.addEventListener('suggestion-submitted', handleSuggestionSubmitted);

		return () => {
			window.removeEventListener('suggestion-submitted', handleSuggestionSubmitted);
		};
	}, []);

	// If user is not logged in, show login prompt
	if (!isAuthenticated || !currentUser) {
		return (
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-2xl mx-auto text-center">
					<Alert>
						<LogIn className="h-4 w-4" />
						<AlertDescription>
							<p className="font-semibold mb-2">Please log in to view your suggestions</p>
							<p className="text-sm mb-4">
								You need to be logged in to view and manage your game suggestions.
							</p>
							<div className="flex gap-2 justify-center">
								<Link to="/login">
									<Button size="sm">
										<LogIn className="h-4 w-4 mr-2" />
										Log In
									</Button>
								</Link>
								<Link to="/signup">
									<Button variant="outline" size="sm">
										Sign Up
									</Button>
								</Link>
							</div>
						</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
					<p className="text-muted-foreground mt-4">Loading your suggestions...</p>
				</div>
			</div>
		);
	}

	// Format status label
	const getStatusLabel = (status: GameSuggestionStatus) => {
		switch (status) {
			case GameSuggestionStatus.New: return "New";
			case GameSuggestionStatus.UnderReview: return "Under Review";
			case GameSuggestionStatus.Accepted: return "Accepted";
			case GameSuggestionStatus.Rejected: return "Rejected";
			default: return "Unknown";
		}
	};

	// Get status badge variant
	const getStatusVariant = (status: GameSuggestionStatus): "default" | "secondary" | "destructive" | "outline" => {
		switch (status) {
			case GameSuggestionStatus.New: return "default";
			case GameSuggestionStatus.UnderReview: return "secondary";
			case GameSuggestionStatus.Accepted: return "default";
			case GameSuggestionStatus.Rejected: return "destructive";
			default: return "outline";
		}
	};

	// Get status color for accepted
	const getStatusColor = (status: GameSuggestionStatus): string => {
		if (status === GameSuggestionStatus.Accepted) {
			return "bg-green-500 text-white hover:bg-green-600";
		}
		return "";
	};

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
						My Game Suggestions
					</h1>
					<p className="text-muted-foreground">
						View the status of all your submitted game ideas
					</p>
				</div>

				{/* Suggestions List */}
				{suggestions.length === 0 ? (
					<Card>
						<CardContent className="pt-12 pb-12 text-center">
							<Lightbulb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-xl font-semibold mb-2">No suggestions yet</h3>
							<p className="text-muted-foreground mb-6">
								You haven't submitted any game suggestions yet. Share your ideas with us!
							</p>
							<Link to="/suggestions">
								<Button>
									<Lightbulb className="h-4 w-4 mr-2" />
									Submit a Suggestion
								</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{suggestions.map((suggestion) => (
							<Card key={suggestion.id} className="hover:border-primary/50 transition-colors">
								<CardHeader>
									<div className="flex justify-between items-start gap-4">
										<div className="flex-1">
											<CardTitle className="text-xl mb-2">{suggestion.title}</CardTitle>
											<div className="flex gap-2 items-center flex-wrap">
												<Badge
													variant={getStatusVariant(suggestion.status)}
													className={getStatusColor(suggestion.status)}
												>
													{getStatusLabel(suggestion.status)}
												</Badge>
												<div className="flex items-center text-sm text-muted-foreground">
													<Calendar className="h-4 w-4 mr-1" />
													{new Date(parseInt(suggestion.create_time) * 1000).toLocaleDateString()}
												</div>
											</div>
										</div>
									</div>
								</CardHeader>
								{suggestion.description && (
									<CardContent>
										<CardDescription className="whitespace-pre-wrap">
											{suggestion.description}
										</CardDescription>
									</CardContent>
								)}
							</Card>
						))}
					</div>
				)}

				{/* Footer hint */}
				{suggestions.length > 0 && (
					<div className="mt-8 text-center">
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<p className="text-sm">
									Our team reviews all suggestions. If your idea is accepted, we may reach out to you for more details!
								</p>
							</AlertDescription>
						</Alert>
					</div>
				)}
			</div>
		</div>
	);
}
