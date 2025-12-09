import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	type ContentBlock,
	BlockType,
	BlockAlignment,
	BlockWidth,
	getBlocksByPage,
} from "@/lib/block-manager";

/**
 * Hook to load and render dynamic content blocks for a page
 */
export function usePageBlocks(pageSlug: string) {
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

	return blocks;
}

/**
 * Render blocks as React elements
 */
export function renderBlocks(blocks: ContentBlock[]) {
	if (blocks.length === 0) return null;

	return blocks.map(block => <BlockRenderer key={block.id} block={block} />);
}

/**
 * Block Renderer Component
 */
function BlockRenderer({ block }: { block: ContentBlock }) {
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
					<ul className="space-y-2 list-disc list-inside">
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
					<Button variant="default">
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
