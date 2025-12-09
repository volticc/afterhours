/**
 * Block Manager - Dynamic Page Content Blocks
 *
 * Manages dynamic content blocks that admins can add, reorder, align, and delete.
 * Each block has type, content, order, alignment, spacing, and width properties.
 */

// ===== BLOCK TYPES =====

export enum BlockType {
	Heading = 'heading',
	Paragraph = 'paragraph',
	List = 'list',
	Subtitle = 'subtitle',
	Caption = 'caption',
	ButtonLabel = 'button-label',
}

export enum BlockAlignment {
	Left = 'left',
	Center = 'center',
	Right = 'right',
}

export enum BlockWidth {
	Full = 'full',
	Half = 'half',
	Third = 'third',
}

// ===== BLOCK INTERFACE =====

export interface ContentBlock {
	id: string;
	type: BlockType;
	content: string;
	order: number; // Position in the list (0-indexed)
	alignment: BlockAlignment;
	paddingTop: number; // in px
	paddingBottom: number; // in px
	width: BlockWidth;
	pageSlug: string;
}

// ===== STORAGE KEY =====

const BLOCKS_STORAGE_KEY = 'admin_content_blocks';

// ===== BLOCK TYPE LABELS =====

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
	[BlockType.Heading]: 'Heading',
	[BlockType.Paragraph]: 'Paragraph',
	[BlockType.List]: 'List',
	[BlockType.Subtitle]: 'Subtitle',
	[BlockType.Caption]: 'Caption',
	[BlockType.ButtonLabel]: 'Button Label',
};

// ===== DEFAULT CONTENT =====

export const DEFAULT_BLOCK_CONTENT: Record<BlockType, string> = {
	[BlockType.Heading]: 'New Heading',
	[BlockType.Paragraph]: 'Enter your paragraph text here...',
	[BlockType.List]: '• Item 1\n• Item 2\n• Item 3',
	[BlockType.Subtitle]: 'New Subtitle',
	[BlockType.Caption]: 'Caption text',
	[BlockType.ButtonLabel]: 'Button Text',
};

// ===== CRUD OPERATIONS =====

export function getAllBlocks(): ContentBlock[] {
	try {
		const stored = localStorage.getItem(BLOCKS_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error('Error loading blocks:', error);
		return [];
	}
}

export function getBlocksByPage(pageSlug: string): ContentBlock[] {
	return getAllBlocks()
		.filter(block => block.pageSlug === pageSlug)
		.sort((a, b) => a.order - b.order);
}

export function getBlockById(blockId: string): ContentBlock | undefined {
	return getAllBlocks().find(block => block.id === blockId);
}

export function createBlock(
	pageSlug: string,
	type: BlockType,
	insertAfterOrder: number = -1
): ContentBlock {
	const allBlocks = getAllBlocks();
	const pageBlocks = getBlocksByPage(pageSlug);

	// Generate unique ID
	const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	// Determine order
	let order: number;
	if (insertAfterOrder === -1) {
		// Append at end
		order = pageBlocks.length > 0 ? Math.max(...pageBlocks.map(b => b.order)) + 1 : 0;
	} else {
		// Insert after specific block
		order = insertAfterOrder + 1;
		// Shift all blocks after this position
		allBlocks.forEach(block => {
			if (block.pageSlug === pageSlug && block.order >= order) {
				block.order += 1;
			}
		});
	}

	const newBlock: ContentBlock = {
		id,
		type,
		content: DEFAULT_BLOCK_CONTENT[type],
		order,
		alignment: BlockAlignment.Left,
		paddingTop: 16,
		paddingBottom: 16,
		width: BlockWidth.Full,
		pageSlug,
	};

	allBlocks.push(newBlock);
	saveAllBlocks(allBlocks);

	return newBlock;
}

export function updateBlock(blockId: string, updates: Partial<ContentBlock>): void {
	const allBlocks = getAllBlocks();
	const index = allBlocks.findIndex(block => block.id === blockId);

	if (index >= 0) {
		allBlocks[index] = { ...allBlocks[index], ...updates };
		saveAllBlocks(allBlocks);
	}
}

export function deleteBlock(blockId: string): void {
	const allBlocks = getAllBlocks();
	const block = allBlocks.find(b => b.id === blockId);

	if (!block) return;

	const filtered = allBlocks.filter(b => b.id !== blockId);

	// Reorder remaining blocks on the same page
	filtered.forEach(b => {
		if (b.pageSlug === block.pageSlug && b.order > block.order) {
			b.order -= 1;
		}
	});

	saveAllBlocks(filtered);
}

export function moveBlockUp(blockId: string): void {
	const allBlocks = getAllBlocks();
	const block = allBlocks.find(b => b.id === blockId);

	if (!block || block.order === 0) return;

	const pageBlocks = getBlocksByPage(block.pageSlug);
	const currentIndex = pageBlocks.findIndex(b => b.id === blockId);

	if (currentIndex > 0) {
		const previousBlock = pageBlocks[currentIndex - 1];

		// Swap orders
		const tempOrder = block.order;
		block.order = previousBlock.order;
		previousBlock.order = tempOrder;

		saveAllBlocks(allBlocks);
	}
}

export function moveBlockDown(blockId: string): void {
	const allBlocks = getAllBlocks();
	const block = allBlocks.find(b => b.id === blockId);

	if (!block) return;

	const pageBlocks = getBlocksByPage(block.pageSlug);
	const currentIndex = pageBlocks.findIndex(b => b.id === blockId);

	if (currentIndex < pageBlocks.length - 1) {
		const nextBlock = pageBlocks[currentIndex + 1];

		// Swap orders
		const tempOrder = block.order;
		block.order = nextBlock.order;
		nextBlock.order = tempOrder;

		saveAllBlocks(allBlocks);
	}
}

export function reorderBlocks(pageSlug: string, blockIds: string[]): void {
	const allBlocks = getAllBlocks();

	// Update order for blocks in the new arrangement
	blockIds.forEach((blockId, index) => {
		const block = allBlocks.find(b => b.id === blockId);
		if (block && block.pageSlug === pageSlug) {
			block.order = index;
		}
	});

	saveAllBlocks(allBlocks);
}

function saveAllBlocks(blocks: ContentBlock[]): void {
	localStorage.setItem(BLOCKS_STORAGE_KEY, JSON.stringify(blocks));

	// Trigger update event
	window.dispatchEvent(new Event('blocks-updated'));
}

export function resetBlocks(): void {
	localStorage.removeItem(BLOCKS_STORAGE_KEY);
	window.dispatchEvent(new Event('blocks-updated'));
}

// ===== UNIFIED BLOCK INITIALIZATION =====

/**
 * Initialize unified blocks for a page from existing editable content
 * Converts static content blocks into ContentBlock objects
 * This is called automatically when a page loads if no blocks exist yet
 */
export function initializePageBlocks(pageSlug: string, editableBlocks: Array<{
	id: string;
	type: BlockType;
	content: string;
	order: number;
}>): void {
	const existingBlocks = getBlocksByPage(pageSlug);

	// Only initialize if no blocks exist for this page
	if (existingBlocks.length > 0) {
		return;
	}

	const allBlocks = getAllBlocks();

	// Convert editable blocks to ContentBlocks
	editableBlocks.forEach((block) => {
		const newBlock: ContentBlock = {
			id: `${pageSlug}-${block.id}`,
			type: block.type,
			content: block.content,
			order: block.order,
			alignment: BlockAlignment.Left,
			paddingTop: 16,
			paddingBottom: 16,
			width: BlockWidth.Full,
			pageSlug,
		};
		allBlocks.push(newBlock);
	});

	saveAllBlocks(allBlocks);
}

/**
 * Check if a page has been initialized with unified blocks
 */
export function isPageInitialized(pageSlug: string): boolean {
	return getBlocksByPage(pageSlug).length > 0;
}
