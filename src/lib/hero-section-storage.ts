// Hero Section Storage Utilities
// LocalStorage-based persistence for homepage hero section configuration

export interface HeroSectionConfig {
	id: string;
	featured_game_id: string | null;
	hero_title: string;
	hero_tagline: string;
	hero_background_image: string;
	create_time: string;
	update_time: string;
}

const HERO_SECTION_STORAGE_KEY = "hero_section_config_v1";

/**
 * Load hero section configuration from localStorage
 */
export function loadHeroSectionFromStorage(): HeroSectionConfig | null {
	try {
		const stored = localStorage.getItem(HERO_SECTION_STORAGE_KEY);
		return stored ? JSON.parse(stored) : null;
	} catch (error) {
		console.error("Error loading hero section from storage:", error);
		return null;
	}
}

/**
 * Save hero section configuration to localStorage
 */
export function saveHeroSectionToStorage(config: HeroSectionConfig): void {
	try {
		localStorage.setItem(HERO_SECTION_STORAGE_KEY, JSON.stringify(config));
		// Dispatch event to notify other components (e.g., public homepage)
		window.dispatchEvent(new CustomEvent('hero-section-updated', { detail: config }));
	} catch (error) {
		console.error("Error saving hero section to storage:", error);
	}
}

/**
 * Create new hero section configuration
 */
export function createHeroSection(data: {
	featured_game_id: string | null;
	hero_title: string;
	hero_tagline: string;
	hero_background_image: string;
}): HeroSectionConfig {
	const now = Math.floor(Date.now() / 1000).toString();
	const config: HeroSectionConfig = {
		id: "hero-section-singleton",
		featured_game_id: data.featured_game_id,
		hero_title: data.hero_title,
		hero_tagline: data.hero_tagline,
		hero_background_image: data.hero_background_image,
		create_time: now,
		update_time: now,
	};
	saveHeroSectionToStorage(config);
	return config;
}

/**
 * Update existing hero section configuration
 */
export function updateHeroSection(updates: Partial<HeroSectionConfig>): HeroSectionConfig | null {
	const existing = loadHeroSectionFromStorage();
	if (!existing) {
		console.error("No hero section config found to update");
		return null;
	}

	const updated: HeroSectionConfig = {
		...existing,
		...updates,
		id: existing.id, // Keep original ID
		create_time: existing.create_time, // Keep original creation time
		update_time: Math.floor(Date.now() / 1000).toString(),
	};

	saveHeroSectionToStorage(updated);
	return updated;
}

/**
 * Delete hero section configuration
 */
export function deleteHeroSection(): void {
	try {
		localStorage.removeItem(HERO_SECTION_STORAGE_KEY);
		window.dispatchEvent(new CustomEvent('hero-section-updated', { detail: null }));
	} catch (error) {
		console.error("Error deleting hero section from storage:", error);
	}
}

/**
 * Initialize default hero section if none exists
 */
export function initializeDefaultHeroSection(): HeroSectionConfig {
	const existing = loadHeroSectionFromStorage();
	if (existing) {
		return existing;
	}

	// Create default hero section
	return createHeroSection({
		featured_game_id: null,
		hero_title: "Welcome to After Hours Studio",
		hero_tagline: "Creating unsettling experiences that live After Hours",
		hero_background_image: "",
	});
}
