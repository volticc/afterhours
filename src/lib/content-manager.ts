/**
 * Content Manager - Preview Mode
 *
 * Manages editable page content and theme settings in localStorage.
 * No server communication - all data stored locally for preview.
 */

// ===== TYPES =====

export interface EditableContent {
	pageSlug: string;
	blockId: string;
	content: string;
	label?: string; // User-friendly label for the block
}

export interface ThemeSettings {
	primary: string;
	accent: string;
	background: string;
	foreground: string;
	card: string;
	cardForeground: string;
}

// ===== STORAGE KEYS =====

const CONTENT_STORAGE_KEY = 'admin_editable_content';
const THEME_STORAGE_KEY = 'admin_theme_settings';

// ===== DEFAULT VALUES =====

export const DEFAULT_THEME: ThemeSettings = {
	primary: 'oklch(0.21 0.006 285.885)',
	accent: 'oklch(0.967 0.001 286.375)',
	background: 'oklch(1 0 0)',
	foreground: 'oklch(0.141 0.005 285.823)',
	card: 'oklch(1 0 0)',
	cardForeground: 'oklch(0.141 0.005 285.823)',
};

// ===== CONTENT MANAGEMENT =====

export function getAllContent(): EditableContent[] {
	try {
		const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error('Error loading content:', error);
		return [];
	}
}

export function getContentByPage(pageSlug: string): EditableContent[] {
	return getAllContent().filter(item => item.pageSlug === pageSlug);
}

export function getContentByBlock(pageSlug: string, blockId: string): EditableContent | undefined {
	return getAllContent().find(
		item => item.pageSlug === pageSlug && item.blockId === blockId
	);
}

export function saveContent(content: EditableContent): void {
	const allContent = getAllContent();
	const existingIndex = allContent.findIndex(
		item => item.pageSlug === content.pageSlug && item.blockId === content.blockId
	);

	if (existingIndex >= 0) {
		allContent[existingIndex] = content;
	} else {
		allContent.push(content);
	}

	localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(allContent));
}

export function deleteContent(pageSlug: string, blockId: string): void {
	const allContent = getAllContent();
	const filtered = allContent.filter(
		item => !(item.pageSlug === pageSlug && item.blockId === blockId)
	);
	localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(filtered));
}

export function resetContent(): void {
	localStorage.removeItem(CONTENT_STORAGE_KEY);
}

// ===== THEME MANAGEMENT =====

export function getThemeSettings(): ThemeSettings {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return stored ? JSON.parse(stored) : DEFAULT_THEME;
	} catch (error) {
		console.error('Error loading theme:', error);
		return DEFAULT_THEME;
	}
}

export function saveThemeSettings(theme: ThemeSettings): void {
	localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
	applyThemeToDOM(theme);
}

export function resetThemeSettings(): void {
	localStorage.removeItem(THEME_STORAGE_KEY);
	applyThemeToDOM(DEFAULT_THEME);
}

export function applyThemeToDOM(theme: ThemeSettings): void {
	const root = document.documentElement;

	root.style.setProperty('--primary', theme.primary);
	root.style.setProperty('--accent', theme.accent);
	root.style.setProperty('--background', theme.background);
	root.style.setProperty('--foreground', theme.foreground);
	root.style.setProperty('--card', theme.card);
	root.style.setProperty('--card-foreground', theme.cardForeground);
}

// ===== INITIALIZATION =====

export function initializeTheme(): void {
	const theme = getThemeSettings();
	applyThemeToDOM(theme);
}

// ===== PAGE DISCOVERY =====

export interface PageInfo {
	slug: string;
	name: string;
	path: string;
}

export const AVAILABLE_PAGES: PageInfo[] = [
	{ slug: 'home', name: 'Home Page', path: '/' },
	{ slug: 'about', name: 'About', path: '/about' },
	{ slug: 'games', name: 'Games', path: '/games' },
	{ slug: 'press', name: 'Press Kit', path: '/press' },
	{ slug: 'support', name: 'Support', path: '/support' },
	{ slug: 'contact', name: 'Contact', path: '/contact' },
	{ slug: 'suggestions', name: 'Suggestions', path: '/suggestions' },
	{ slug: 'privacy', name: 'Privacy Policy', path: '/privacy' },
	{ slug: 'terms', name: 'Terms of Service', path: '/terms' },
];

// ===== PREDEFINED EDITABLE BLOCKS =====

export interface EditableBlock {
	id: string;
	label: string;
	defaultContent: string;
}

export const EDITABLE_BLOCKS: Record<string, EditableBlock[]> = {
	home: [
		{ id: 'hero-title', label: 'Hero Title', defaultContent: 'After Hours Studio' },
		{ id: 'hero-subtitle', label: 'Hero Subtitle', defaultContent: 'Creating unsettling experiences that live After Hours' },
		{ id: 'hero-description', label: 'Hero Description', defaultContent: 'Independent video game development studio specializing in indie horror and immersive storytelling. Where creativity meets darkness, and every game tells a haunting tale.' },
		{ id: 'section-newsletter-title', label: 'Newsletter Section Title', defaultContent: 'Stay Updated' },
		{ id: 'section-philosophy-title', label: 'Philosophy Section Title', defaultContent: 'Our Philosophy' },
		{ id: 'card-horror-title', label: 'Indie Horror Card Title', defaultContent: 'Indie Horror' },
		{ id: 'card-horror-description', label: 'Indie Horror Card Description', defaultContent: 'Crafting psychological experiences that challenge perceptions and linger in memory long after the game ends.' },
		{ id: 'card-storytelling-title', label: 'Storytelling Card Title', defaultContent: 'Immersive Storytelling' },
		{ id: 'card-storytelling-description', label: 'Storytelling Card Description', defaultContent: 'Every detail matters. We build worlds that feel alive, with narratives that draw you deeper into the darkness.' },
		{ id: 'card-creativity-title', label: 'Creativity Card Title', defaultContent: 'Night-Shift Creativity' },
		{ id: 'card-creativity-description', label: 'Creativity Card Description', defaultContent: 'Born from the quiet hours of the night, where creativity flows freely and unsettling ideas take shape.' },
	],
	about: [
		{ id: 'page-title', label: 'Page Title', defaultContent: 'About After Hours Studio' },
		{ id: 'page-subtitle', label: 'Page Subtitle', defaultContent: 'Born from the shadows, crafted in the quiet hours' },
		{ id: 'story-heading', label: 'Story Section Heading', defaultContent: 'Our Story' },
		{ id: 'story-paragraph-1', label: 'Story Paragraph 1', defaultContent: 'After Hours Studio emerged from a passion for creating atmospheric, unsettling gaming experiences that challenge conventional storytelling. Founded by indie developers who found their creative peak during the late-night hours, we specialize in psychological horror and immersive narratives.' },
		{ id: 'story-paragraph-2', label: 'Story Paragraph 2', defaultContent: 'Our name reflects our creative process: the best ideas come alive after hours, when the world is quiet and the mind is free to explore darker, more compelling themes. We believe in crafting games that aren\'t just played but experienced—stories that linger long after the screen goes dark.' },
		{ id: 'card-nightshift-title', label: 'Night-Shift Card Title', defaultContent: 'Night-Shift Creativity' },
		{ id: 'card-nightshift-description', label: 'Night-Shift Card Description', defaultContent: 'Our best work happens when the world sleeps. The quiet hours fuel our darkest ideas.' },
		{ id: 'card-indie-title', label: 'Indie Excellence Card Title', defaultContent: 'Indie Excellence' },
		{ id: 'card-indie-description', label: 'Indie Excellence Card Description', defaultContent: 'Small team, big ambitions. We craft every detail with care and precision.' },
		{ id: 'card-player-title', label: 'Player-Focused Card Title', defaultContent: 'Player-Focused' },
		{ id: 'card-player-description', label: 'Player-Focused Card Description', defaultContent: 'Every game is designed to create memorable, emotional experiences for our players.' },
		{ id: 'mission-heading', label: 'Mission Section Heading', defaultContent: 'Our Mission' },
		{ id: 'mission-paragraph-1', label: 'Mission Paragraph 1', defaultContent: 'We\'re dedicated to pushing the boundaries of indie horror gaming. Our focus is on creating atmospheric, psychologically engaging experiences that prioritize storytelling and player immersion over jump scares and gore.' },
		{ id: 'mission-paragraph-2', label: 'Mission Paragraph 2', defaultContent: 'Every project we undertake is an exploration of fear, emotion, and the human psyche. We believe the most terrifying experiences come from what\'s implied, not what\'s shown—and we\'re committed to proving that indie studios can deliver AAA-quality atmospheric horror.' },
	],
	games: [
		{ id: 'page-title', label: 'Page Title', defaultContent: 'Our Games' },
		{ id: 'page-description', label: 'Page Description', defaultContent: 'Explore our collection of unsettling experiences crafted during the darkest hours' },
		{ id: 'no-games-message', label: 'No Games Message (Primary)', defaultContent: 'No games available yet. Check back soon for our upcoming releases!' },
		{ id: 'no-games-subtitle', label: 'No Games Message (Subtitle)', defaultContent: 'We\'re currently working on something special in the shadows...' },
	],
	press: [
		{ id: 'page-title', label: 'Page Title', defaultContent: 'Press & Media' },
		{ id: 'page-description', label: 'Page Description', defaultContent: 'Download our press kit and media assets' },
		{ id: 'card-presskit-title', label: 'Press Kit Card Title', defaultContent: 'Press Kit' },
		{ id: 'card-presskit-description', label: 'Press Kit Card Description', defaultContent: 'Studio information and game details' },
		{ id: 'card-presskit-button', label: 'Press Kit Button Label', defaultContent: 'Download PDF' },
		{ id: 'card-logo-title', label: 'Logo & Assets Card Title', defaultContent: 'Logo & Assets' },
		{ id: 'card-logo-description', label: 'Logo & Assets Card Description', defaultContent: 'High-resolution studio logos and branding' },
		{ id: 'card-logo-button', label: 'Logo & Assets Button Label', defaultContent: 'Download ZIP' },
		{ id: 'card-trailer-title', label: 'Game Trailers Card Title', defaultContent: 'Game Trailers' },
		{ id: 'card-trailer-description', label: 'Game Trailers Card Description', defaultContent: 'Gameplay videos and trailers' },
		{ id: 'card-trailer-button', label: 'Game Trailers Button Label', defaultContent: 'View Gallery' },
		{ id: 'media-contact-heading', label: 'Media Contact Heading', defaultContent: 'Media Contact' },
		{ id: 'media-contact-text', label: 'Media Contact Text', defaultContent: 'For press inquiries, interviews, or review codes, please contact:' },
	],
	support: [
		{ id: 'page-title', label: 'Page Title', defaultContent: 'Support' },
		{ id: 'page-description', label: 'Page Description', defaultContent: 'We\'re here to help. Reach out with any questions or concerns' },
		{ id: 'card-email-title', label: 'Email Support Card Title', defaultContent: 'Email Support' },
		{ id: 'card-email-description', label: 'Email Support Card Description', defaultContent: 'Send us an email directly' },
		{ id: 'card-email-response', label: 'Email Support Response Time', defaultContent: 'We typically respond within 24-48 hours' },
		{ id: 'card-community-title', label: 'Community Support Card Title', defaultContent: 'Community Support' },
		{ id: 'card-community-description', label: 'Community Support Card Description', defaultContent: 'Get help from our community' },
		{ id: 'card-community-button', label: 'Community Button Label', defaultContent: 'Join Discord' },
		{ id: 'card-community-footer', label: 'Community Card Footer Text', defaultContent: 'Connect with players and developers' },
		{ id: 'contact-form-title', label: 'Contact Form Title', defaultContent: 'Contact Form' },
		{ id: 'contact-form-description', label: 'Contact Form Description', defaultContent: 'Fill out the form below and we\'ll get back to you as soon as possible' },
		{ id: 'contact-form-button', label: 'Contact Form Submit Button', defaultContent: 'Send Message' },
	],
	contact: [
		{ id: 'page-title', label: 'Page Title', defaultContent: 'Contact Us' },
		{ id: 'general-inquiries-heading', label: 'General Inquiries Heading', defaultContent: 'General Inquiries' },
		{ id: 'community-heading', label: 'Community Heading', defaultContent: 'Community' },
		{ id: 'discord-link-text', label: 'Discord Link Text', defaultContent: 'Join our Discord Server' },
	],
	suggestions: [
		{ id: 'page-title', label: 'Page Title', defaultContent: 'Game Suggestions' },
		{ id: 'page-description', label: 'Page Description', defaultContent: 'Submit your game ideas' },
	],
	privacy: [
		{ id: 'page-title', label: 'Page Title', defaultContent: 'Privacy Policy' },
	],
	terms: [
		{ id: 'page-title', label: 'Page Title', defaultContent: 'Terms of Service' },
	],
};
