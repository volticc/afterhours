/**
 * Hook for accessing editable content
 * Allows components to read content from the content manager
 */

import { useState, useEffect } from 'react';
import { getContentByBlock, type EditableContent, EDITABLE_BLOCKS } from '@/lib/content-manager';

export function useEditableContent(pageSlug: string, blockId: string): string {
	const [content, setContent] = useState<string>('');

	useEffect(() => {
		// Try to load custom content from storage
		const storedContent = getContentByBlock(pageSlug, blockId);

		if (storedContent) {
			setContent(storedContent.content);
		} else {
			// Fall back to default content
			const pageBlocks = EDITABLE_BLOCKS[pageSlug] || [];
			const defaultBlock = pageBlocks.find(block => block.id === blockId);
			setContent(defaultBlock?.defaultContent || '');
		}

		// Listen for storage changes (for live updates)
		const handleStorageChange = () => {
			const updatedContent = getContentByBlock(pageSlug, blockId);
			if (updatedContent) {
				setContent(updatedContent.content);
			}
		};

		window.addEventListener('storage', handleStorageChange);
		window.addEventListener('content-updated', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('content-updated', handleStorageChange);
		};
	}, [pageSlug, blockId]);

	return content;
}
