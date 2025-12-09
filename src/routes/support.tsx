import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MessageCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePageBlocks, renderBlocks } from "@/hooks/usePageBlocks";
import { initializePageBlocks, isPageInitialized, BlockType } from "@/lib/block-manager";
import { useAuth } from "@/contexts/AuthContext";
import SupportTicketORM, { SupportTicketInquiryType, SupportTicketStatus, type SupportTicketModel } from "@/components/data/orm/orm_support_ticket";

export const Route = createFileRoute("/support")({
	component: SupportPage,
});

function SupportPage() {
	const { currentUser } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Initialize unified blocks from static content on first load
	useEffect(() => {
		if (!isPageInitialized('support')) {
			initializePageBlocks('support', [
				{ id: 'page-title', type: BlockType.Heading, content: 'Support', order: 0 },
				{ id: 'page-description', type: BlockType.Paragraph, content: 'We\'re here to help. Reach out with any questions or concerns', order: 1 },
			]);
		}
	}, []);

	// Unified blocks - ALL editable content comes from this single source
	const allBlocks = usePageBlocks('support');

	const [formData, setFormData] = useState({
		name: "",
		email: currentUser?.email || "",
		category: "",
		message: "",
	});

	// Update email if user logs in/out
	useEffect(() => {
		setFormData(prev => ({ ...prev, email: currentUser?.email || "" }));
	}, [currentUser]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitSuccess(false);
		setSubmitError(null);

		try {
			const orm = SupportTicketORM.getInstance();

			// Map category to enum
			let inquiryType = SupportTicketInquiryType.General;
			switch (formData.category) {
				case "bug_report":
					inquiryType = SupportTicketInquiryType.Technical;
					break;
				case "gameplay_issue":
					inquiryType = SupportTicketInquiryType.Technical;
					break;
				case "store_question":
					inquiryType = SupportTicketInquiryType.Business;
					break;
				case "general_support":
					inquiryType = SupportTicketInquiryType.General;
					break;
			}

			const newTicket: Partial<SupportTicketModel> = {
				sender_name: formData.name,
				email: formData.email,
				inquiry_type: inquiryType,
				message: formData.message,
				status: SupportTicketStatus.Open,
			};

			await orm.insertSupportTicket([newTicket as SupportTicketModel]);

			setSubmitSuccess(true);
			setFormData({ name: "", email: currentUser?.email || "", category: "", message: "" });

			// Hide success message after 5 seconds
			setTimeout(() => setSubmitSuccess(false), 5000);
		} catch (error) {
			console.error("Error submitting support ticket:", error);
			setSubmitError("Failed to submit ticket. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-4xl mx-auto">
				{/* Dynamic editable content from blocks */}
				<div className="text-center mb-12 space-y-4">
					{renderBlocks(allBlocks)}
				</div>

				{/* Support channels - functional components, not editable text */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
					<Card className="border-primary/20">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Mail className="h-5 w-5 text-primary" />
								Email Support
							</CardTitle>
							<CardDescription>
								Send us an email directly
							</CardDescription>
						</CardHeader>
						<CardContent>
							<a href="mailto:support@afterhoursstudio.com" className="text-primary hover:underline">
								support@afterhoursstudio.com
							</a>
							<p className="text-sm text-muted-foreground mt-2">
								We typically respond within 24-48 hours
							</p>
						</CardContent>
					</Card>

					<Card className="border-accent/20">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MessageCircle className="h-5 w-5 text-accent" />
								Community Support
							</CardTitle>
							<CardDescription>
								Get help from our community
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild variant="outline" className="w-full">
								<a href="https://discord.com" target="_blank" rel="noopener noreferrer">
									Join Discord
								</a>
							</Button>
							<p className="text-sm text-muted-foreground mt-2">
								Connect with players and developers
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Contact form - functional component, not editable text */}
				<Card className="border-primary/20">
					<CardHeader>
						<CardTitle>Submit a Support Ticket</CardTitle>
						<CardDescription>
							Fill out the form below and we'll get back to you as soon as possible
						</CardDescription>
					</CardHeader>
					<CardContent>
						{submitSuccess && (
							<Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<AlertDescription className="text-green-600 dark:text-green-400">
									Your support ticket has been submitted successfully! We'll get back to you soon.
								</AlertDescription>
							</Alert>
						)}

						{submitError && (
							<Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950">
								<AlertDescription className="text-red-600 dark:text-red-400">
									{submitError}
								</AlertDescription>
							</Alert>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name">Name *</Label>
									<Input
										id="name"
										required
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										placeholder="Your name"
										disabled={isSubmitting}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email *</Label>
									<Input
										id="email"
										type="email"
										required
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										placeholder="your@email.com"
										disabled={isSubmitting}
									/>
									{currentUser && (
										<p className="text-xs text-muted-foreground">
											Using your logged-in email
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">Issue Category *</Label>
								<Select
									value={formData.category}
									onValueChange={(value) => setFormData({ ...formData, category: value })}
									disabled={isSubmitting}
								>
									<SelectTrigger id="category">
										<SelectValue placeholder="Select issue category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="bug_report">Bug Report</SelectItem>
										<SelectItem value="gameplay_issue">Gameplay Issue</SelectItem>
										<SelectItem value="store_question">Store Question</SelectItem>
										<SelectItem value="general_support">General Support</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="message">Message *</Label>
								<Textarea
									id="message"
									required
									rows={6}
									value={formData.message}
									onChange={(e) => setFormData({ ...formData, message: e.target.value })}
									placeholder="Tell us how we can help..."
									disabled={isSubmitting}
								/>
							</div>

							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Submitting..." : "Submit Ticket"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
