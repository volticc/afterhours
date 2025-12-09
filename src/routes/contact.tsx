import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";

export const Route = createFileRoute("/contact")({
	component: ContactPage,
});

function ContactPage() {
	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('contact')) {
			initializePageBlocks('contact', [
				{ id: 'page-title', type: BlockType.Heading, content: 'Contact Us', order: 0 },
			]);
		}
	}, []);

	// Unified blocks - ALL editable content comes from this single source
	const allBlocks = usePageBlocks('contact');

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-2xl mx-auto">
				{/* Dynamic editable content from blocks */}
				<div className="text-center mb-8 space-y-4">
					{renderBlocks(allBlocks)}
				</div>

				{/* Contact information - functional component, not editable text */}
				<Card>
					<CardContent className="pt-6 space-y-6">
						<div>
							<h3 className="font-semibold mb-2 flex items-center gap-2">
								<Mail className="h-5 w-5 text-primary" />
								General Inquiries
							</h3>
							<a href="mailto:contact@afterhoursstudio.com" className="text-primary hover:underline">
								contact@afterhoursstudio.com
							</a>
						</div>
						<div>
							<h3 className="font-semibold mb-2 flex items-center gap-2">
								<MessageCircle className="h-5 w-5 text-accent" />
								Community
							</h3>
							<a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
								Join our Discord Server
							</a>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
