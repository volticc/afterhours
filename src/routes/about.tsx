import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('about')) {
			initializePageBlocks('about', [
				{ id: 'page-title', type: BlockType.Heading, content: 'About After Hours Studio', order: 0 },
				{ id: 'page-subtitle', type: BlockType.Paragraph, content: 'Born from the shadows, crafted in the quiet hours', order: 1 },
				{ id: 'story-heading', type: BlockType.Subtitle, content: 'Our Story', order: 2 },
				{ id: 'story-paragraph-1', type: BlockType.Paragraph, content: 'After Hours Studio emerged from a passion for creating atmospheric, unsettling gaming experiences that challenge conventional storytelling. Founded by indie developers who found their creative peak during the late-night hours, we specialize in psychological horror and immersive narratives.', order: 3 },
				{ id: 'story-paragraph-2', type: BlockType.Paragraph, content: 'Our name reflects our creative process: the best ideas come alive after hours, when the world is quiet and the mind is free to explore darker, more compelling themes. We believe in crafting games that aren\'t just played but experienced—stories that linger long after the screen goes dark.', order: 4 },
				{ id: 'card-nightshift-title', type: BlockType.Subtitle, content: 'Night-Shift Creativity', order: 5 },
				{ id: 'card-nightshift-description', type: BlockType.Paragraph, content: 'Our best work happens when the world sleeps. The quiet hours fuel our darkest ideas.', order: 6 },
				{ id: 'card-indie-title', type: BlockType.Subtitle, content: 'Indie Excellence', order: 7 },
				{ id: 'card-indie-description', type: BlockType.Paragraph, content: 'Small team, big ambitions. We craft every detail with care and precision.', order: 8 },
				{ id: 'card-player-title', type: BlockType.Subtitle, content: 'Player-Focused', order: 9 },
				{ id: 'card-player-description', type: BlockType.Paragraph, content: 'Every game is designed to create memorable, emotional experiences for our players.', order: 10 },
				{ id: 'mission-heading', type: BlockType.Subtitle, content: 'Our Mission', order: 11 },
				{ id: 'mission-paragraph-1', type: BlockType.Paragraph, content: 'We\'re dedicated to pushing the boundaries of indie horror gaming. Our focus is on creating atmospheric, psychologically engaging experiences that prioritize storytelling and player immersion over jump scares and gore.', order: 12 },
				{ id: 'mission-paragraph-2', type: BlockType.Paragraph, content: 'Every project we undertake is an exploration of fear, emotion, and the human psyche. We believe the most terrifying experiences come from what\'s implied, not what\'s shown—and we\'re committed to proving that indie studios can deliver AAA-quality atmospheric horror.', order: 13 },
			]);
		}
	}, []);

	// Unified blocks - ALL content comes from this single source
	const allBlocks = usePageBlocks('about');

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto space-y-6">
				{renderBlocks(allBlocks)}
			</div>
		</div>
	);
}
