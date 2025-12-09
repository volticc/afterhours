import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Calendar, Tag, AlertCircle, LogIn, User, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SupportTicketORM, { SupportTicketStatus, SupportTicketInquiryType, type SupportTicketModel } from "@/components/data/orm/orm_support_ticket";
import { Button } from "@/components/ui/button";
import { getTicketReplies, addTicketReply, type TicketReply } from "@/routes/admin";

export const Route = createFileRoute("/my-tickets")({
	component: MyTicketsPage,
});

function MyTicketsPage() {
	const { currentUser, isAuthenticated } = useAuth();
	const [tickets, setTickets] = useState<SupportTicketModel[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [ticketReplies, setTicketReplies] = useState<Record<string, TicketReply[]>>({});
	const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

	useEffect(() => {
		const loadTickets = async () => {
			if (!currentUser) {
				setIsLoading(false);
				return;
			}

			try {
				const orm = SupportTicketORM.getInstance();
				// Use the getSupportTicketByEmail method which is more efficient
				const userTickets = await orm.getSupportTicketByEmail(currentUser.email);

				setTickets(userTickets);

				// Load replies for each ticket
				const replies: Record<string, TicketReply[]> = {};
				userTickets.forEach(ticket => {
					replies[ticket.id] = getTicketReplies(ticket.id);
				});
				setTicketReplies(replies);
			} catch (error) {
				console.error("Error loading tickets:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadTickets();

		// Listen for reply updates
		const handleReplyUpdate = (event: Event) => {
			const customEvent = event as CustomEvent;
			const updatedReplies = customEvent.detail as Record<string, TicketReply[]>;
			setTicketReplies(updatedReplies);
		};

		window.addEventListener('ticket-replies-updated', handleReplyUpdate);

		return () => {
			window.removeEventListener('ticket-replies-updated', handleReplyUpdate);
		};
	}, [currentUser]);

	// Handle user reply
	const handleUserReply = (ticketId: string) => {
		const replyText = replyTexts[ticketId]?.trim();
		if (!replyText || !currentUser) return;

		// Create new reply object
		const newReply: TicketReply = {
			text: replyText,
			timestamp: Math.floor(Date.now() / 1000).toString(),
			authorName: currentUser.email,
			authorType: 'user',
		};

		// Add reply using the shared function
		addTicketReply(ticketId, newReply);

		// Update local state
		setTicketReplies(prev => ({
			...prev,
			[ticketId]: [...(prev[ticketId] || []), newReply],
		}));

		// Clear the text input for this ticket
		setReplyTexts(prev => ({
			...prev,
			[ticketId]: '',
		}));
	};

	// If user is not logged in, show login prompt
	if (!isAuthenticated || !currentUser) {
		return (
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					<Card className="border-primary/20">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<LogIn className="h-6 w-6 text-primary" />
								Login Required
							</CardTitle>
							<CardDescription>
								You need to be logged in to view your support tickets
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								Please sign up or log in to view and manage your support tickets.
							</p>
							<div className="flex gap-3">
								<Button asChild>
									<Link to="/login">
										<LogIn className="h-4 w-4 mr-2" />
										Login
									</Link>
								</Button>
								<Button asChild variant="outline">
									<Link to="/signup">
										Sign Up
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// Show loading state
	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto text-center">
					<p className="text-muted-foreground">Loading your tickets...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto">
				{/* Page Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
						My Support Tickets
					</h1>
					<p className="text-muted-foreground">
						View and track all your support requests
					</p>
				</div>

				{/* Tickets List */}
				{tickets.length === 0 ? (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							You have no open support tickets.
						</AlertDescription>
					</Alert>
				) : (
					<div className="space-y-4">
						{tickets.map((ticket) => {
							const replies = ticketReplies[ticket.id] || [];
							return (
								<Card key={ticket.id} className="border-primary/20 hover:border-primary/40 transition-colors">
									<CardHeader>
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<CardTitle className="text-xl mb-2">
													{getCategoryLabel(ticket.inquiry_type)}
												</CardTitle>
												<CardDescription className="flex items-center gap-2 text-sm">
													<Calendar className="h-4 w-4" />
													Submitted on {formatDate(ticket.create_time)}
												</CardDescription>
											</div>
											<Badge variant={getStatusVariant(ticket.status)}>
												{getStatusLabel(ticket.status)}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
												<MessageSquare className="h-4 w-4" />
												Your Message
											</div>
											<p className="text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
												{ticket.message}
											</p>
										</div>

										{/* Replies Section */}
										{replies.length > 0 && (
											<>
												<Separator />
												<div className="space-y-3">
													<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
														<MessageSquare className="h-4 w-4" />
														Conversation ({replies.length} {replies.length === 1 ? 'reply' : 'replies'})
													</div>
													<div className="space-y-3 max-h-96 overflow-y-auto">
														{replies.map((reply, index) => {
															// Determine if this reply is from an admin
															// Check authorType field first, then fall back to checking if authorName matches current user
															const isAdminReply = reply.authorType === 'admin' ||
																(reply.authorType !== 'user' && reply.authorName !== currentUser.email);

															return (
																<div
																	key={index}
																	className={isAdminReply
																		? "bg-primary/5 p-4 rounded-md border border-primary/10"
																		: "bg-accent/5 p-4 rounded-md border border-accent/10"
																	}
																>
																	<div className="flex justify-between items-start mb-2">
																		<Badge variant="outline" className="text-xs">
																			{isAdminReply ? 'Admin Reply' : 'Your Reply'}
																		</Badge>
																		<span className="text-xs text-muted-foreground">
																			{new Date(parseInt(reply.timestamp) * 1000).toLocaleString()}
																		</span>
																	</div>
																	<p className="text-sm whitespace-pre-wrap text-foreground">
																		{reply.text}
																	</p>
																	<p className="text-xs text-muted-foreground mt-2">
																		— {reply.authorName}
																	</p>
																</div>
															);
														})}
													</div>
												</div>
											</>
										)}

										{/* User Reply Section */}
										<Separator />
										<div className="space-y-3">
											<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
												<Send className="h-4 w-4" />
												Send a Reply
											</div>
											<Textarea
												placeholder="Type your reply here..."
												rows={4}
												value={replyTexts[ticket.id] || ''}
												onChange={(e) => setReplyTexts(prev => ({
													...prev,
													[ticket.id]: e.target.value,
												}))}
												className="resize-none"
											/>
											<Button
												onClick={() => handleUserReply(ticket.id)}
												disabled={!replyTexts[ticket.id]?.trim()}
												className="w-full"
												size="sm"
											>
												<Send className="h-4 w-4 mr-2" />
												Send Reply
											</Button>
											<p className="text-xs text-muted-foreground">
												Your reply will be visible to support staff immediately
											</p>
										</div>

										<Separator />

										<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-2">
												<Tag className="h-4 w-4" />
												<span>Category: <span className="text-foreground font-medium">{getCategoryLabel(ticket.inquiry_type)}</span></span>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Help Message */}
				{tickets.length > 0 && (
					<div className="mt-8 text-center">
						<p className="text-sm text-muted-foreground">
							Need to submit a new ticket?{" "}
							<Link to="/support" className="text-primary hover:underline">
								Visit our Support page
							</Link>
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

// Helper function to format date
function formatDate(dateString: string): string {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return dateString;
	}
}

// Helper function to get status label
function getStatusLabel(status: SupportTicketStatus): string {
	switch (status) {
		case SupportTicketStatus.Open:
			return "Open";
		case SupportTicketStatus.InProgress:
			return "In Progress";
		case SupportTicketStatus.Resolved:
			return "Resolved";
		case SupportTicketStatus.Unspecified:
			return "New";
		default:
			return "Unknown";
	}
}

// Helper function to get status badge variant
function getStatusVariant(status: SupportTicketStatus): "default" | "secondary" | "destructive" | "outline" {
	switch (status) {
		case SupportTicketStatus.Unspecified:
			return "default";
		case SupportTicketStatus.Open:
			return "secondary";
		case SupportTicketStatus.InProgress:
			return "outline";
		case SupportTicketStatus.Resolved:
			return "destructive";
		default:
			return "default";
	}
}

// Helper function to get category label
function getCategoryLabel(category: SupportTicketInquiryType): string {
	// Map the inquiry_type enum values to readable labels
	switch (category) {
		case SupportTicketInquiryType.Technical:
			return "Technical Support";
		case SupportTicketInquiryType.Business:
			return "Business Inquiry";
		case SupportTicketInquiryType.General:
			return "General Support";
		case SupportTicketInquiryType.Unspecified:
			return "General";
		default:
			return "Other";
	}
}
