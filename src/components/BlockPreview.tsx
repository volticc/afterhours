import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/useAdminGuard";
import {
	type ContentBlock,
	BlockType,
	BlockAlignment,
	BlockWidth,
	getBlocksByPage,
} from "@/lib/block-manager";

interface BlockPreviewProps {
	pageSlug: string;
}

export function BlockPreview({ pageSlug }: BlockPreviewProps) {
	// Admin-only protection - don't render preview for non-admins
	const { isAdmin } = useIsAdmin();

	const [blocks, setBlocks] = useState<ContentBlock[]>([]);

	// Load blocks function - memoized to prevent infinite loops
	const loadBlocks = useCallback(() => {
		const pageBlocks = getBlocksByPage(pageSlug);
		setBlocks(pageBlocks);
	}, [pageSlug]);

	// Load blocks on mount and when pageSlug changes
	useEffect(() => {
		loadBlocks();
	}, [loadBlocks]);

	// Listen for updates
	useEffect(() => {
		const handleUpdate = () => {
			loadBlocks();
		};

		window.addEventListener('blocks-updated', handleUpdate);
		return () => window.removeEventListener('blocks-updated', handleUpdate);
	}, [loadBlocks]);

	// Don't render the preview for non-admin users
	if (!isAdmin) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<p className="text-muted-foreground">
						Admin access required to preview blocks.
					</p>
				</CardContent>
			</Card>
		);
	}

	if (blocks.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					No blocks to preview. Add blocks using the editor.
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="border rounded-lg bg-background p-8 min-h-[400px]">
			<h3 className="text-lg font-semibold mb-6 text-center">Live Preview</h3>
			<div className="space-y-0">
				{blocks.map(block => (
					<BlockRenderer key={block.id} block={block} />
				))}
			</div>
		</div>
	);
}

// ===== BLOCK RENDERER =====

interface BlockRendererProps {
	block: ContentBlock;
}

function BlockRenderer({ block }: BlockRendererProps) {
	// Get alignment class
	const getAlignmentClass = () => {
		switch (block.alignment) {
			case BlockAlignment.Center:
				return 'text-center mx-auto';
			case BlockAlignment.Right:
				return 'text-right ml-auto';
			default:
				return 'text-left';
		}
	};

	// Get width class
	const getWidthClass = () => {
		switch (block.width) {
			case BlockWidth.Half:
				return 'max-w-[50%]';
			case BlockWidth.Third:
				return 'max-w-[33.333%]';
			default:
				return 'w-full';
		}
	};

	// Container styles
	const containerStyle = {
		paddingTop: `${block.paddingTop}px`,
		paddingBottom: `${block.paddingBottom}px`,
	};

	// Render based on block type
	const renderContent = () => {
		switch (block.type) {
			case BlockType.Heading:
				return (
					<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
						{block.content}
					</h1>
				);

			case BlockType.Paragraph:
				return (
					<p className="text-base text-foreground/80 leading-relaxed">
						{block.content}
					</p>
				);

			case BlockType.Subtitle:
				return (
					<h2 className="text-2xl font-semibold text-foreground">
						{block.content}
					</h2>
				);

			case BlockType.List:
				const listItems = block.content.split('\n').filter(item => item.trim());
				return (
					<ul className="space-y-2">
						{listItems.map((item, index) => (
							<li key={index} className="text-foreground/80">
								{item.replace(/^[•\-*]\s*/, '')}
							</li>
						))}
					</ul>
				);

			case BlockType.Caption:
				return (
					<p className="text-sm text-muted-foreground italic">
						{block.content}
					</p>
				);

			case BlockType.ButtonLabel:
				return (
					<Button variant="default" disabled>
						{block.content}
					</Button>
				);

			default:
				return <p className="text-foreground">{block.content}</p>;
		}
	};

	return (
		<div
			style={containerStyle}
			className={cn(
				getWidthClass(),
				getAlignmentClass()
			)}
		>
			{renderContent()}
		</div>
	);
}
