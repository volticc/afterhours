import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";
import { useAuth } from "@/contexts/AuthContext";
import GameSuggestionORM, { GameSuggestionStatus } from "@/components/data/orm/orm_game_suggestion";

export const Route = createFileRoute("/suggestions")({
	component: SuggestionsPage,
});

function SuggestionsPage() {
	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('suggestions')) {
			initializePageBlocks('suggestions', [
				{ id: 'page-title', type: BlockType.Heading, content: 'Game Suggestions', order: 0 },
				{ id: 'page-description', type: BlockType.Paragraph, content: 'Share your ideas and help shape our future games', order: 1 },
			]);
		}
	}, []);

	// Unified blocks - ALL editable content comes from this single source
	const allBlocks = usePageBlocks('suggestions');

	const { currentUser, isAuthenticated } = useAuth();
	const [suggestion, setSuggestion] = useState({ title: "", description: "", email: "" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState("");

	// Pre-fill email if user is logged in
	useEffect(() => {
		if (isAuthenticated && currentUser?.email) {
			setSuggestion(prev => ({ ...prev, email: currentUser.email }));
		}
	}, [isAuthenticated, currentUser]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitError("");
		setSubmitSuccess(false);

		try {
			const orm = GameSuggestionORM.getInstance();
			await orm.insertGameSuggestion([{
				title: suggestion.title,
				description: suggestion.description || null,
				email: suggestion.email || null,
				status: GameSuggestionStatus.New,
			} as any]);

			setSubmitSuccess(true);
			setSuggestion({ title: "", description: "", email: isAuthenticated && currentUser?.email ? currentUser.email : "" });

			// Dispatch event to notify other components (like My Suggestions page)
			window.dispatchEvent(new CustomEvent('suggestion-submitted'));

			// Auto-hide success message after 5 seconds
			setTimeout(() => setSubmitSuccess(false), 5000);
		} catch (error) {
			console.error("Error submitting suggestion:", error);
			setSubmitError("Failed to submit suggestion. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto">
				{/* Dynamic editable content from blocks */}
				<div className="text-center mb-12 space-y-4">
					{renderBlocks(allBlocks)}
				</div>

				{/* Success Message */}
				{submitSuccess && (
					<Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
						<CheckCircle2 className="h-4 w-4 text-green-600" />
						<AlertDescription className="text-green-800 dark:text-green-200">
							Thank you! Your game suggestion has been submitted successfully.
						</AlertDescription>
					</Alert>
				)}

				{/* Error Message */}
				{submitError && (
					<Alert variant="destructive" className="mb-6">
						<AlertDescription>{submitError}</AlertDescription>
					</Alert>
				)}

				{/* Suggestion form - functional component, not editable text */}
				<Card className="border-primary/20 mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Lightbulb className="h-5 w-5 text-accent" />
							Submit Your Idea
						</CardTitle>
						<CardDescription>
							We value community input. Tell us about the horror game you'd like to see
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Game Title or Name Idea *</Label>
								<Input
									id="title"
									required
									value={suggestion.title}
									onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })}
									placeholder="Your game idea in a few words"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Short Description</Label>
								<Textarea
									id="description"
									rows={6}
									value={suggestion.description}
									onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })}
									placeholder="Describe your game idea, setting, mechanics, or story..."
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email (Optional)</Label>
								<Input
									id="email"
									type="email"
									value={suggestion.email}
									onChange={(e) => setSuggestion({ ...suggestion, email: e.target.value })}
									placeholder="your.email@example.com"
									disabled={isAuthenticated}
								/>
								{isAuthenticated && (
									<p className="text-xs text-muted-foreground">
										Email auto-filled from your account
									</p>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Submitting..." : "Submit Suggestion"}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Footer note - functional component */}
				<div className="text-center text-sm text-muted-foreground">
					<p>Suggestions are reviewed by our team. Popular ideas may influence future projects!</p>
				</div>
			</div>
		</div>
	);
}
