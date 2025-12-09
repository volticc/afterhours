import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Mail, Lock, AlertCircle, LogIn, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { login, isAuthenticated } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Redirect to home if already logged in
	if (isAuthenticated) {
		navigate({ to: "/" });
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const success = await login(email, password);

			if (success) {
				// Redirect to home page after successful login
				navigate({ to: "/" });
			} else {
				setError("Invalid email or password. Please try again.");
			}
		} catch (err) {
			setError("An error occurred during login. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-card py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				{/* Back to Home Link */}
				<div>
					<Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</Link>
				</div>

				<div className="text-center">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
						Welcome Back
					</h1>
					<p className="text-muted-foreground">
						Sign in to your account
					</p>
				</div>

				<Card className="border-accent/20">
					<CardHeader>
						<CardTitle>Sign In</CardTitle>
						<CardDescription>
							Enter your credentials to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="email">
									<Mail className="h-4 w-4 inline mr-2" />
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									autoComplete="email"
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">
									<Lock className="h-4 w-4 inline mr-2" />
									Password
								</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									autoComplete="current-password"
									disabled={isLoading}
								/>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								<LogIn className="h-4 w-4 mr-2" />
								{isLoading ? "Signing in..." : "Sign In"}
							</Button>

							<div className="text-center text-sm text-muted-foreground">
								Don't have an account?{" "}
								<Link to="/signup" className="text-primary hover:underline">
									Sign up
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>

				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>Preview Mode:</strong> Accounts are stored locally in your browser.
						Default admin: admin@afterhoursstudio.com / admin123
					</AlertDescription>
				</Alert>
			</div>
		</div>
	);
}
