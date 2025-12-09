// Extended GameModel for preview mode with additional fields
// This extends the ORM-generated GameModel with preview-only fields

import { type GameModel } from "@/components/data/orm/orm_game";

/**
 * Extended GameModel for preview/localStorage mode
 * Includes additional fields not in the ORM schema
 */
export interface GameModelPreview extends GameModel {
	release_date?: string | null;
	show_countdown?: boolean | null;
}

/**
 * Type guard to check if a game is a preview game
 */
export function isPreviewGame(game: GameModel | GameModelPreview): game is GameModelPreview {
	return 'release_date' in game || 'show_countdown' in game;
}
