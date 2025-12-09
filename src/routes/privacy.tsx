import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
});

function PrivacyPage() {
	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('privacy')) {
			initializePageBlocks('privacy', [
				{ id: 'page-title', type: BlockType.Heading, content: 'Privacy Policy', order: 0 },
				{ id: 'last-updated', type: BlockType.Caption, content: `Last updated: ${new Date().toLocaleDateString()}`, order: 1 },
				{ id: 'intro-heading', type: BlockType.Subtitle, content: 'Introduction', order: 2 },
				{ id: 'intro-paragraph', type: BlockType.Paragraph, content: 'After Hours Studio respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information.', order: 3 },
				{ id: 'info-heading', type: BlockType.Subtitle, content: 'Information We Collect', order: 4 },
				{ id: 'info-paragraph', type: BlockType.Paragraph, content: 'We may collect personal information such as name, email address, and other data you provide when contacting us or subscribing to our newsletter.', order: 5 },
				{ id: 'usage-heading', type: BlockType.Subtitle, content: 'How We Use Your Information', order: 6 },
				{ id: 'usage-paragraph', type: BlockType.Paragraph, content: 'We use collected information to respond to inquiries, send updates about our games, and improve our services.', order: 7 },
				{ id: 'contact-heading', type: BlockType.Subtitle, content: 'Contact', order: 8 },
				{ id: 'contact-paragraph', type: BlockType.Paragraph, content: 'For privacy-related questions, contact us at privacy@afterhoursstudio.com', order: 9 },
			]);
		}
	}, []);

	// Unified blocks - ALL content comes from this single source
	const allBlocks = usePageBlocks('privacy');

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto">
				<Card>
					<CardContent className="pt-6 space-y-6">
						{renderBlocks(allBlocks)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
