import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";
import { getDevlogPosts, type DevlogPost } from "@/lib/devlog-storage";

export const Route = createFileRoute("/devlog")({
	component: DevlogPage,
});

function DevlogPage() {
	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('devlog')) {
			initializePageBlocks('devlog', [
				{ id: 'page-title', type: BlockType.Heading, content: 'Development Log', order: 0 },
				{ id: 'page-description', type: BlockType.Paragraph, content: 'Follow our journey as we craft unsettling experiences during the darkest hours', order: 1 },
			]);
		}
	}, []);

	// Unified blocks - ALL editable content comes from this single source
	const allBlocks = usePageBlocks('devlog');

	// Listen for devlog updates from admin panel
	const [refreshKey, setRefreshKey] = useState(0);
	const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

	useEffect(() => {
		const handleDevlogUpdate = () => {
			setRefreshKey(prev => prev + 1);
		};

		window.addEventListener('devlog-posts-updated', handleDevlogUpdate);
		return () => window.removeEventListener('devlog-posts-updated', handleDevlogUpdate);
	}, []);

	const { data: posts = [], isLoading } = useQuery({
		queryKey: ["devlog-posts", refreshKey],
		queryFn: async () => {
			// Load devlog posts from localStorage
			const allPosts = getDevlogPosts();
			// Sort by creation time (newest first)
			return allPosts.sort((a: DevlogPost, b: DevlogPost) => {
				return parseInt(b.create_time) - parseInt(a.create_time);
			});
		},
	});

	const toggleExpanded = (postId: string) => {
		setExpandedPosts(prev => {
			const next = new Set(prev);
			if (next.has(postId)) {
				next.delete(postId);
			} else {
				next.add(postId);
			}
			return next;
		});
	};

	const formatDate = (timestamp: string) => {
		const date = new Date(parseInt(timestamp) * 1000);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const shouldTruncate = (text: string, maxLength: number = 300) => {
		return text.length > maxLength;
	};

	const truncateText = (text: string, maxLength: number = 300) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + '...';
	};

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto">
				{/* Dynamic editable content from blocks */}
				<div className="text-center mb-12 space-y-4">
					{renderBlocks(allBlocks)}
				</div>

				{/* Devlog posts list */}
				{isLoading ? (
					<div className="space-y-6">
						{[...Array(3)].map((_, i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="h-6 bg-muted rounded w-3/4 mb-2" />
									<div className="h-4 bg-muted rounded w-1/2 mb-4" />
									<div className="h-48 bg-muted rounded-md" />
								</CardHeader>
							</Card>
						))}
					</div>
				) : posts.length === 0 ? (
					<Card className="text-center py-12">
						<CardContent>
							<p className="text-lg text-muted-foreground mb-4">
								No devlog posts yet. Check back soon for updates on our development progress!
							</p>
							<p className="text-sm text-muted-foreground">
								We're currently working on something special in the shadows...
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{posts.map((post: DevlogPost) => {
							const isExpanded = expandedPosts.has(post.id);
							const needsTruncation = shouldTruncate(post.body);
							const displayBody = isExpanded || !needsTruncation
								? post.body
								: truncateText(post.body);

							return (
								<Card
									key={post.id}
									className="border-primary/20 hover:border-primary/40 transition-all duration-200"
								>
									<CardHeader>
										<div className="flex items-start justify-between gap-4 mb-2">
											<CardTitle className="text-2xl">{post.title}</CardTitle>
										</div>

										<CardDescription className="flex flex-wrap items-center gap-3 text-sm">
											<span className="flex items-center gap-1">
												<User className="h-4 w-4" />
												{post.author_name || post.author_email}
											</span>
											<Separator orientation="vertical" className="h-4" />
											<span className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												{formatDate(post.create_time)}
											</span>
										</CardDescription>
									</CardHeader>

									<CardContent className="space-y-4">
										{/* Optional image */}
										{post.image_url && (
											<div className="relative w-full overflow-hidden rounded-md bg-muted">
												<img
													src={post.image_url}
													alt={post.title}
													className="w-full h-auto object-cover"
												/>
											</div>
										)}

										{/* Post body */}
										<div className="prose prose-sm dark:prose-invert max-w-none">
											<p className="text-foreground whitespace-pre-wrap leading-relaxed">
												{displayBody}
											</p>
										</div>

										{/* Expand/Collapse button if content is long */}
										{needsTruncation && (
											<div className="pt-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => toggleExpanded(post.id)}
													className="text-primary hover:text-primary/80"
												>
													{isExpanded ? (
														<>
															<ChevronUp className="h-4 w-4 mr-1" />
															Show Less
														</>
													) : (
														<>
															<ChevronDown className="h-4 w-4 mr-1" />
															Read More
														</>
													)}
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
