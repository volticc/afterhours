import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useIsAdmin } from "@/hooks/useAdminGuard";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Plus,
	Trash2,
	ChevronUp,
	ChevronDown,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Save,
	Edit,
	Type,
	List as ListIcon,
	Heading as HeadingIcon,
	FileText,
	GripVertical,
} from "lucide-react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	type ContentBlock,
	BlockType,
	BlockAlignment,
	BlockWidth,
	BLOCK_TYPE_LABELS,
	getBlocksByPage,
	createBlock,
	updateBlock,
	deleteBlock,
	moveBlockUp,
	moveBlockDown,
	reorderBlocks,
} from "@/lib/block-manager";
import { AVAILABLE_PAGES } from "@/lib/content-manager";
import { BlockPreview } from "@/components/BlockPreview";

export function BlockEditor() {
	// Admin-only protection - don't render if not an admin
	const { isAdmin } = useIsAdmin();

	const [selectedPage, setSelectedPage] = useState<string>("");
	const [blocks, setBlocks] = useState<ContentBlock[]>([]);
	const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [insertAfterBlockId, setInsertAfterBlockId] = useState<string | null>(null);

	// Drag-and-drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Load blocks function - memoized to prevent infinite loops
	const loadBlocks = useCallback(() => {
		if (selectedPage) {
			const pageBlocks = getBlocksByPage(selectedPage);
			setBlocks(pageBlocks);
		}
	}, [selectedPage]);

	// Load blocks when page changes
	useEffect(() => {
		loadBlocks();
	}, [loadBlocks]);

	// Listen for block updates
	useEffect(() => {
		const handleUpdate = () => {
			loadBlocks();
		};

		window.addEventListener('blocks-updated', handleUpdate);
		return () => window.removeEventListener('blocks-updated', handleUpdate);
	}, [loadBlocks]);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = blocks.findIndex((block) => block.id === active.id);
			const newIndex = blocks.findIndex((block) => block.id === over.id);

			const newBlocks = arrayMove(blocks, oldIndex, newIndex);
			setBlocks(newBlocks);

			// Update backend with new order
			reorderBlocks(
				selectedPage,
				newBlocks.map(b => b.id)
			);
		}
	};

	const handleAddBlock = (type: BlockType) => {
		const insertAfterOrder = insertAfterBlockId
			? blocks.find(b => b.id === insertAfterBlockId)?.order ?? -1
			: -1;

		const newBlock = createBlock(selectedPage, type, insertAfterOrder);
		setShowAddDialog(false);
		setInsertAfterBlockId(null);
		loadBlocks();

		// Auto-select for editing
		setEditingBlock(newBlock);
	};

	const handleDeleteBlock = (blockId: string) => {
		if (confirm('Are you sure you want to delete this block?')) {
			deleteBlock(blockId);
			if (editingBlock?.id === blockId) {
				setEditingBlock(null);
			}
			loadBlocks();
		}
	};

	const handleMoveUp = (blockId: string) => {
		moveBlockUp(blockId);
		loadBlocks();
	};

	const handleMoveDown = (blockId: string) => {
		moveBlockDown(blockId);
		loadBlocks();
	};

	const handleSaveBlock = () => {
		if (editingBlock) {
			updateBlock(editingBlock.id, editingBlock);
			setEditingBlock(null);
			loadBlocks();
		}
	};

	const openAddDialog = (afterBlockId: string | null = null) => {
		setInsertAfterBlockId(afterBlockId);
		setShowAddDialog(true);
	};

	// Don't render the block editor for non-admin users
	if (!isAdmin) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<p className="text-muted-foreground">
						Admin access required to edit blocks.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Page Selection */}
			<div className="space-y-2">
				<Label>Select Page</Label>
				<Select value={selectedPage} onValueChange={setSelectedPage}>
					<SelectTrigger>
						<SelectValue placeholder="Choose a page to edit..." />
					</SelectTrigger>
					<SelectContent>
						{AVAILABLE_PAGES.map(page => (
							<SelectItem key={page.slug} value={page.slug}>
								{page.name} ({page.path})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{selectedPage && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Editor Panel */}
					<div className="space-y-4">
						{/* Add Block Button */}
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-semibold">Content Blocks ({blocks.length})</h3>
							<Button onClick={() => openAddDialog(null)} size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Add Block
							</Button>
						</div>

						{/* Blocks List */}
						{blocks.length === 0 ? (
							<Card>
								<CardContent className="py-12 text-center text-muted-foreground">
									No blocks yet. Click "Add Block" to get started.
								</CardContent>
							</Card>
						) : (
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={blocks.map(b => b.id)}
									strategy={verticalListSortingStrategy}
								>
									<div className="space-y-3">
										{blocks.map((block, index) => (
											<SortableBlockItem
												key={block.id}
												block={block}
												isFirst={index === 0}
												isLast={index === blocks.length - 1}
												isEditing={editingBlock?.id === block.id}
												onEdit={() => setEditingBlock(block)}
												onDelete={() => handleDeleteBlock(block.id)}
												onMoveUp={() => handleMoveUp(block.id)}
												onMoveDown={() => handleMoveDown(block.id)}
												onAddAfter={() => openAddDialog(block.id)}
											/>
										))}
									</div>
								</SortableContext>
							</DndContext>
						)}

						{/* Edit Block Panel */}
						{editingBlock && (
							<BlockEditPanel
								block={editingBlock}
								onUpdate={setEditingBlock}
								onSave={handleSaveBlock}
								onCancel={() => setEditingBlock(null)}
							/>
						)}
					</div>

					{/* Live Preview Panel */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Live Preview</h3>
						<BlockPreview pageSlug={selectedPage} />
					</div>
				</div>
			)}

			{/* Add Block Dialog */}
			<AddBlockDialog
				open={showAddDialog}
				onClose={() => {
					setShowAddDialog(false);
					setInsertAfterBlockId(null);
				}}
				onSelectType={handleAddBlock}
			/>
		</div>
	);
}

// ===== SORTABLE BLOCK ITEM COMPONENT =====

interface SortableBlockItemProps {
	block: ContentBlock;
	isFirst: boolean;
	isLast: boolean;
	isEditing: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onAddAfter: () => void;
}

function SortableBlockItem(props: SortableBlockItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: props.block.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<Card className={props.isEditing ? 'border-accent' : ''}>
				<CardContent className="py-4">
					<div className="flex items-start gap-4">
						{/* Drag Handle */}
						<button
							className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-accent/10 rounded"
							{...attributes}
							{...listeners}
							title="Drag to reorder"
						>
							<GripVertical className="h-5 w-5 text-muted-foreground" />
						</button>

						{/* Block Info */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-2">
								<span className="text-xs font-semibold text-muted-foreground uppercase">
									{BLOCK_TYPE_LABELS[props.block.type]}
								</span>
								<span className="text-xs text-muted-foreground">
									• Order: {props.block.order + 1}
								</span>
								<span className="text-xs text-muted-foreground">
									• Align: {props.block.alignment}
								</span>
								<span className="text-xs text-muted-foreground">
									• Width: {props.block.width}
								</span>
							</div>
							<p className="text-sm text-foreground truncate">{props.block.content}</p>
						</div>

						{/* Controls */}
						<div className="flex items-center gap-1">
							<Button
								size="sm"
								variant="ghost"
								onClick={props.onMoveUp}
								disabled={props.isFirst}
								title="Move Up"
							>
								<ChevronUp className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={props.onMoveDown}
								disabled={props.isLast}
								title="Move Down"
							>
								<ChevronDown className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={props.onEdit}
								title="Edit Block"
							>
								<Edit className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={props.onAddAfter}
								title="Add Block After"
							>
								<Plus className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={props.onDelete}
								title="Delete Block"
								className="text-destructive hover:text-destructive"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ===== BLOCK EDIT PANEL =====

interface BlockEditPanelProps {
	block: ContentBlock;
	onUpdate: (block: ContentBlock) => void;
	onSave: () => void;
	onCancel: () => void;
}

function BlockEditPanel({ block, onUpdate, onSave, onCancel }: BlockEditPanelProps) {
	return (
		<Card className="border-accent">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Edit className="h-5 w-5" />
					Edit {BLOCK_TYPE_LABELS[block.type]}
				</CardTitle>
				<CardDescription>
					Modify content, alignment, spacing, and width settings
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Content Editor */}
				<div className="space-y-2">
					<Label>Content</Label>
					<Textarea
						value={block.content}
						onChange={(e) => onUpdate({ ...block, content: e.target.value })}
						rows={6}
						placeholder="Enter block content..."
						className="font-mono"
					/>
				</div>

				<Separator />

				{/* Layout Controls */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Alignment */}
					<div className="space-y-2">
						<Label>Alignment</Label>
						<div className="flex gap-1">
							<Button
								size="sm"
								variant={block.alignment === BlockAlignment.Left ? 'default' : 'outline'}
								onClick={() => onUpdate({ ...block, alignment: BlockAlignment.Left })}
							>
								<AlignLeft className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant={block.alignment === BlockAlignment.Center ? 'default' : 'outline'}
								onClick={() => onUpdate({ ...block, alignment: BlockAlignment.Center })}
							>
								<AlignCenter className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant={block.alignment === BlockAlignment.Right ? 'default' : 'outline'}
								onClick={() => onUpdate({ ...block, alignment: BlockAlignment.Right })}
							>
								<AlignRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Width */}
					<div className="space-y-2">
						<Label>Width</Label>
						<Select
							value={block.width}
							onValueChange={(value) => onUpdate({ ...block, width: value as BlockWidth })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={BlockWidth.Full}>Full Width</SelectItem>
								<SelectItem value={BlockWidth.Half}>Half Width (1/2)</SelectItem>
								<SelectItem value={BlockWidth.Third}>Third Width (1/3)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Spacing placeholder */}
					<div className="space-y-2">
						<Label>Spacing</Label>
						<p className="text-xs text-muted-foreground">Use controls below</p>
					</div>
				</div>

				{/* Spacing Controls */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Padding Top (px)</Label>
						<Input
							type="number"
							value={block.paddingTop}
							onChange={(e) => onUpdate({ ...block, paddingTop: parseInt(e.target.value) || 0 })}
							min={0}
							max={200}
						/>
					</div>
					<div className="space-y-2">
						<Label>Padding Bottom (px)</Label>
						<Input
							type="number"
							value={block.paddingBottom}
							onChange={(e) => onUpdate({ ...block, paddingBottom: parseInt(e.target.value) || 0 })}
							min={0}
							max={200}
						/>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2 justify-end pt-4">
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button onClick={onSave}>
						<Save className="h-4 w-4 mr-2" />
						Save Changes
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// ===== ADD BLOCK DIALOG =====

interface AddBlockDialogProps {
	open: boolean;
	onClose: () => void;
	onSelectType: (type: BlockType) => void;
}

function AddBlockDialog({ open, onClose, onSelectType }: AddBlockDialogProps) {
	const blockTypes = [
		{ type: BlockType.Heading, icon: HeadingIcon, description: 'Large heading text' },
		{ type: BlockType.Paragraph, icon: FileText, description: 'Regular paragraph text' },
		{ type: BlockType.Subtitle, icon: Type, description: 'Subheading or section title' },
		{ type: BlockType.List, icon: ListIcon, description: 'Bulleted or numbered list' },
		{ type: BlockType.Caption, icon: Type, description: 'Small caption or note' },
		{ type: BlockType.ButtonLabel, icon: Type, description: 'Button text (text only)' },
	];

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Add New Block</DialogTitle>
					<DialogDescription>
						Choose a block type to add to your page
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-3 py-4">
					{blockTypes.map(({ type, icon: Icon, description }) => (
						<button
							key={type}
							onClick={() => onSelectType(type)}
							className="flex items-start gap-3 p-4 border rounded-lg hover:border-accent hover:bg-accent/10 transition-colors text-left"
						>
							<Icon className="h-6 w-6 text-accent mt-0.5" />
							<div>
								<p className="font-semibold">{BLOCK_TYPE_LABELS[type]}</p>
								<p className="text-sm text-muted-foreground">{description}</p>
							</div>
						</button>
					))}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
