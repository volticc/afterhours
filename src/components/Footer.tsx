import { Link } from "@tanstack/react-router";

export function Footer() {
	return (
		<footer className="border-t border-border bg-card">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Brand */}
					<div className="col-span-1">
						<h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
							After Hours Studio
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Creating unsettling experiences that live After Hours.
						</p>
					</div>

					{/* Links */}
					<div>
						<h4 className="font-semibold mb-4">Quick Links</h4>
						<ul className="space-y-2">
							<li>
								<Link to="/games" className="text-sm text-muted-foreground hover:text-primary">
									Games
								</Link>
							</li>
							<li>
								<Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
									About Us
								</Link>
							</li>
							<li>
								<Link to="/press" className="text-sm text-muted-foreground hover:text-primary">
									Press & Media
								</Link>
							</li>
						</ul>
					</div>

					{/* Support */}
					<div>
						<h4 className="font-semibold mb-4">Support</h4>
						<ul className="space-y-2">
							<li>
								<Link to="/support" className="text-sm text-muted-foreground hover:text-primary">
									Contact Support
								</Link>
							</li>
							<li>
								<Link to="/suggestions" className="text-sm text-muted-foreground hover:text-primary">
									Game Suggestions
								</Link>
							</li>
							<li>
								<a href="mailto:support@afterhoursstudio.com" className="text-sm text-muted-foreground hover:text-primary">
									support@afterhoursstudio.com
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
					<p className="text-sm text-muted-foreground">
						© {new Date().getFullYear()} After Hours Studio. All rights reserved.
					</p>
					<div className="flex space-x-6 mt-4 md:mt-0">
						<Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
							Privacy Policy
						</Link>
						<Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
