import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
});

function TermsPage() {
	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('terms')) {
			initializePageBlocks('terms', [
				{ id: 'page-title', type: BlockType.Heading, content: 'Terms of Service', order: 0 },
				{ id: 'last-updated', type: BlockType.Caption, content: `Last updated: ${new Date().toLocaleDateString()}`, order: 1 },
				{ id: 'acceptance-heading', type: BlockType.Subtitle, content: 'Acceptance of Terms', order: 2 },
				{ id: 'acceptance-paragraph', type: BlockType.Paragraph, content: 'By accessing and using the After Hours Studio website, you accept and agree to be bound by these Terms of Service.', order: 3 },
				{ id: 'use-heading', type: BlockType.Subtitle, content: 'Use of Website', order: 4 },
				{ id: 'use-paragraph', type: BlockType.Paragraph, content: 'This website is provided for informational purposes. You may not use this website for any illegal or unauthorized purpose.', order: 5 },
				{ id: 'ip-heading', type: BlockType.Subtitle, content: 'Intellectual Property', order: 6 },
				{ id: 'ip-paragraph', type: BlockType.Paragraph, content: 'All content on this website, including games, logos, and text, is the property of After Hours Studio and protected by copyright law.', order: 7 },
				{ id: 'contact-heading', type: BlockType.Subtitle, content: 'Contact', order: 8 },
				{ id: 'contact-paragraph', type: BlockType.Paragraph, content: 'For questions about these terms, contact us at legal@afterhoursstudio.com', order: 9 },
			]);
		}
	}, []);

	// Unified blocks - ALL content comes from this single source
	const allBlocks = usePageBlocks('terms');

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
