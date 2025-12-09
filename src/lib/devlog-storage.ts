/**
 * Devlog Post Storage Utilities
 * Preview mode storage using localStorage (same pattern as preview games)
 */

export interface DevlogPost {
	id: string;
	title: string;
	author_name: string;
	author_email: string;
	body: string;
	image_url?: string | null;
	create_time: string; // Unix timestamp (10-digit string)
	update_time: string; // Unix timestamp (10-digit string)
	display_order?: number | null;
}

const DEVLOG_STORAGE_KEY = "preview_devlogs_v1";

/**
 * Load all devlog posts from localStorage
 */
export function loadDevlogPostsFromStorage(): DevlogPost[] {
	try {
		const stored = localStorage.getItem(DEVLOG_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error("Error loading devlog posts from storage:", error);
		return [];
	}
}

/**
 * Save devlog posts to localStorage and dispatch update event
 */
export function saveDevlogPostsToStorage(posts: DevlogPost[]): void {
	try {
		localStorage.setItem(DEVLOG_STORAGE_KEY, JSON.stringify(posts));
		// Dispatch event to notify public page of updates
		window.dispatchEvent(new CustomEvent('devlog-posts-updated', { detail: posts }));
	} catch (error) {
		console.error("Error saving devlog posts to storage:", error);
	}
}

/**
 * Get all devlog posts (for public page consumption)
 */
export function getDevlogPosts(): DevlogPost[] {
	return loadDevlogPostsFromStorage();
}

/**
 * Get a single devlog post by ID
 */
export function getDevlogPostById(postId: string): DevlogPost | null {
	const posts = loadDevlogPostsFromStorage();
	return posts.find(post => post.id === postId) || null;
}

/**
 * Create a new devlog post
 */
export function createDevlogPost(
	postData: Omit<DevlogPost, 'id' | 'create_time' | 'update_time'>
): DevlogPost {
	const now = Math.floor(Date.now() / 1000).toString();
	const newPost: DevlogPost = {
		id: `preview-devlog-${Date.now()}-${Math.random().toString(36).substring(7)}`,
		...postData,
		create_time: now,
		update_time: now,
	};

	const posts = loadDevlogPostsFromStorage();
	saveDevlogPostsToStorage([...posts, newPost]);
	return newPost;
}

/**
 * Update an existing devlog post
 */
export function updateDevlogPost(postId: string, updates: Partial<DevlogPost>): DevlogPost | null {
	const posts = loadDevlogPostsFromStorage();
	const index = posts.findIndex(post => post.id === postId);

	if (index === -1) {
		return null;
	}

	const now = Math.floor(Date.now() / 1000).toString();
	const updatedPost: DevlogPost = {
		...posts[index],
		...updates,
		id: postId, // Ensure ID cannot be changed
		update_time: now,
	};

	posts[index] = updatedPost;
	saveDevlogPostsToStorage(posts);
	return updatedPost;
}

/**
 * Delete a devlog post
 */
export function deleteDevlogPost(postId: string): boolean {
	const posts = loadDevlogPostsFromStorage();
	const filtered = posts.filter(post => post.id !== postId);

	if (filtered.length === posts.length) {
		return false; // Post not found
	}

	saveDevlogPostsToStorage(filtered);
	return true;
}

/**
 * Reorder devlog posts by updating display_order
 */
export function reorderDevlogPost(postId: string, direction: "up" | "down"): boolean {
	const posts = loadDevlogPostsFromStorage();
	const sortedPosts = [...posts].sort((a, b) => {
		const orderA = a.display_order ?? 999999;
		const orderB = b.display_order ?? 999999;
		return orderA - orderB;
	});

	const currentIndex = sortedPosts.findIndex(p => p.id === postId);
	if (currentIndex === -1) return false;

	const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
	if (newIndex < 0 || newIndex >= sortedPosts.length) return false;

	const post1 = sortedPosts[currentIndex];
	const post2 = sortedPosts[newIndex];

	const order1 = post1.display_order ?? currentIndex;
	const order2 = post2.display_order ?? newIndex;

	// Swap display orders
	const updatedPosts = posts.map(p => {
		if (p.id === post1.id) return { ...p, display_order: order2 };
		if (p.id === post2.id) return { ...p, display_order: order1 };
		return p;
	});

	saveDevlogPostsToStorage(updatedPosts);
	return true;
}
