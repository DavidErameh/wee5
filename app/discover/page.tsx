import { HeroSection } from "@/components/discover/HeroSection";
import { FeatureGrid } from "@/components/discover/FeatureGrid";
import { PricingTable } from "@/components/discover/PricingTable";

/**
 * WEE5 Discover Page
 * Marketing page shown in the Whop App Store / Discover section.
 * Designed to convert community owners into installing the app.
 */
export default function DiscoverPage() {
	return (
		<div className="min-h-screen bg-black text-white selection:bg-accent selection:text-white">
			<main>
				<HeroSection />
				<FeatureGrid />
				<PricingTable />
			</main>

			{/* Footer */}
			<footer className="py-12 border-t border-white/10 bg-black">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<p className="text-text-muted">
						© 2025 WEE5. Built for <span className="text-white">Whop</span> communities.
					</p>
				</div>
			</footer>
		</div>
	);
}
