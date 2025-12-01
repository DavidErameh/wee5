import Link from "next/link";

/**
 * WEE5 Landing Page
 * Per IMPLEMENTATION_PLAN.md Phase 2 Day 5 - Root Page Customization
 * Replaces default Whop template with WEE5 branding and features
 */

export default function Page() {
	return (
		<div className="min-h-screen bg-black">
			{/* Hero Section */}
			<div className="py-10 px-4 lg:px-6">
				<div className="mx-auto">
					<div className="text-center">
						<h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
							WEE5
						</h1>
						<p className="text-xl md:text-2xl text-text-muted mb-4">
							Community Gamification for Whop
						</p>
						<p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
							Boost engagement with XP, levels, and rewards. Inspired by MEE6, built for Whop communities.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/discover"
								className="inline-block bg-accent hover:bg-accent-light text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
							>
								Get Started
							</Link>
							<Link
								href="#features"
								className="inline-block bg-dark hover:bg-dark-hover text-accent font-semibold py-3 px-8 rounded-lg border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
							>
								Learn More
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div id="features" className="py-10 px-4 lg:px-6 bg-dark">
				<div className="mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
						Powerful Features
					</h2>
					<div className="grid md:grid-cols-3 gap-8">
						{/* Feature 1 */}
						<div className="p-6 rounded-xl bg-dark-hover border border-border">
							<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								XP & Leveling System
							</h3>
							<p className="text-text-muted">
								Award XP for messages, posts, and reactions. Members level up and unlock rewards automatically.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="p-6 rounded-xl bg-dark-hover border border-border">
							<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Real-time Leaderboards
							</h3>
							<p className="text-text-muted">
								Live leaderboards with instant updates. Track top members and boost healthy competition.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="p-6 rounded-xl bg-dark-hover border border-border">
							<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Automated Rewards
							</h3>
							<p className="text-text-muted">
								Free membership days and discounts at milestone levels. Reward your most engaged members.
							</p>
						</div>

						{/* Feature 4 */}
						<div className="p-6 rounded-xl bg-dark-hover border border-border">
							<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Anti-Spam Protection
							</h3>
							<p className="text-text-muted">
								60-second cooldowns and rate limiting prevent abuse while keeping engagement genuine.
							</p>
						</div>

						{/* Feature 5 */}
						<div className="p-6 rounded-xl bg-dark-hover border border-border">
							<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Engagement Analytics
							</h3>
							<p className="text-text-muted">
								Track activity trends, top contributors, and engagement metrics with beautiful dashboards.
							</p>
						</div>

						{/* Feature 6 */}
						<div className="p-6 rounded-xl bg-dark-hover border border-border">
							<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Custom XP Rates
							</h3 >
							<p className="text-text-muted">
								Premium users can customize XP rates per activity type to match their community's needs.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Pricing Section */}
			<div className="py-10 px-4 lg:px-6">
				<div className="mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
						Simple, Transparent Pricing
					</h2>
					<p className="text-center text-text-muted mb-12 max-w-2xl mx-auto">
						Choose the plan that fits your community size and needs
					</p>
					<div className="grid md:grid-cols-3 gap-8">
						{/* Free Tier */}
						<div className="p-8 rounded-xl bg-dark border border-border transition-all duration-200">
							<h3 className="text-2xl font-bold text-white mb-2">Free</h3>
							<p className="text-text-muted mb-6">Perfect for getting started</p>
							<div className="mb-6">
								<span className="text-4xl font-bold text-white">$0</span>
								<span className="text-text-muted">/month</span>
							</div>
							<ul className="space-y-3 mb-8">
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">XP & Leveling System</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">Real-time Leaderboards</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">Rank Cards</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">Level-up Rewards</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">Anti-Spam Protection</span>
								</li>
							</ul>
							<Link
								href="/discover"
								className="block w-full text-center bg-dark-hover hover:bg-dark text-text-muted font-semibold py-3 px-6 rounded-lg transition-colors border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
							>
								Get Started
							</Link>
						</div>

						{/* Premium Tier */}
						<div className="p-8 rounded-xl bg-gradient-to-br from-accent to-accent-light text-white border-2 border-accent transform scale-105 shadow-glow">
							<div className="inline-block bg-warning text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
								POPULAR
							</div>
							<h3 className="text-2xl font-bold mb-2">Premium</h3>
							<p className="text-accent-light/80 mb-6">For growing communities</p>
							<div className="mb-6">
								<span className="text-4xl font-bold">$29</span>
								<span className="text-accent-light/80">/month</span>
							</div>
							<ul className="space-y-3 mb-8">
								<li className="flex items-start">
									<svg className="w-5 h-5 text-accent-light mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span>Everything in Free</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-accent-light mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span>Custom XP Rates</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-accent-light mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span>Engagement Analytics</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-accent-light mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span>Custom Badges</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-accent-light mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span>Priority Support</span>
								</li>
							</ul>
							<Link
								href="/discover"
								className="block w-full text-center bg-white hover:bg-accent text-accent font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
							>
								Start Free Trial
							</Link>
						</div>

						{/* Enterprise Tier */}
						<div className="p-8 rounded-xl bg-dark border border-border transition-all duration-200 hover:border-accent">
							<h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
							<p className="text-text-muted mb-6">For large organizations</p>
							<div className="mb-6">
								<span className="text-4xl font-bold text-white">Custom</span>
							</div>
							<ul className="space-y-3 mb-8">
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">Everything in Premium</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">Multi-Community Dashboard</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">API Access</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">Dedicated Support</span>
								</li>
								<li className="flex items-start">
									<svg className="w-5 h-5 text-success mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<span className="text-text-muted">Custom Integrations</span>
								</li>
							</ul>
							<Link
								href="/discover"
								className="block w-full text-center bg-accent hover:bg-accent-light text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
							>
								Contact Sales
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="py-10 px-4 lg:px-6 bg-gradient-to-r from-accent to-accent-light">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Ready to Boost Your Community Engagement?
					</h2>
					<p className="text-xl text-white/90 mb-8">
						Join hundreds of communities using WEE5 to increase member activity and retention
					</p>
					<Link
						href="/discover"
						className="inline-block bg-white hover:bg-accent text-accent font-semibold py-4 px-10 rounded-lg text-lg transition-colors"
					>
						Get Started Free
					</Link>
				</div>
			</div>

			{/* Footer */}
			<div className="py-4 px-4 lg:px-6 bg-black text-text-muted">
				<div className="mx-auto text-center">
					<p className="mb-2">
						Built for <a href="https://whop.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light">Whop</a> communities
					</p>
					<p className="text-sm">
						© 2025 WEE5. Inspired by MEE6, designed for Whop.
					</p>
				</div>
			</div>
		</div>
	);
}
