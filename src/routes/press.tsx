import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image, Video, FileText } from "lucide-react";
import { useEffect } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";

export const Route = createFileRoute("/press")({
	component: PressPage,
});

function PressPage() {
	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('press')) {
			initializePageBlocks('press', [
				{ id: 'page-title', type: BlockType.Heading, content: 'Press & Media', order: 0 },
				{ id: 'page-description', type: BlockType.Paragraph, content: 'Download our press kit and media assets', order: 1 },
			]);
		}
	}, []);

	// Unified blocks - ALL editable content comes from this single source
	const allBlocks = usePageBlocks('press');

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-6xl mx-auto">
				{/* Dynamic editable content from blocks */}
				<div className="text-center mb-12 space-y-4">
					{renderBlocks(allBlocks)}
				</div>

				{/* Press resources - functional components, not editable text */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="border-primary/20">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-primary" />
								Press Kit
							</CardTitle>
							<CardDescription>
								Studio information and game details
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full" variant="outline">
								<Download className="mr-2 h-4 w-4" />
								Download PDF
							</Button>
						</CardContent>
					</Card>

					<Card className="border-accent/20">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Image className="h-5 w-5 text-accent" />
								Logo & Assets
							</CardTitle>
							<CardDescription>
								High-resolution studio logos and branding
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full" variant="outline">
								<Download className="mr-2 h-4 w-4" />
								Download ZIP
							</Button>
						</CardContent>
					</Card>

					<Card className="border-primary/20">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Video className="h-5 w-5 text-primary" />
								Game Trailers
							</CardTitle>
							<CardDescription>
								Gameplay videos and trailers
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full" variant="outline">
								<Download className="mr-2 h-4 w-4" />
								View Gallery
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Media contact - functional component */}
				<Card className="border-primary/20 mt-8">
					<CardHeader>
						<CardTitle>Media Contact</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							For press inquiries, interviews, or review codes, please contact:
						</p>
						<p className="text-foreground">
							<strong>Email:</strong> <a href="mailto:press@afterhoursstudio.com" className="text-primary hover:underline">press@afterhoursstudio.com</a>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
