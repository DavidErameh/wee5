import { Providers } from "@/components/Providers";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/db";

const inter = Inter({
	subsets: ["latin"],
	variable: '--font-inter',
});

export const metadata: Metadata = {
	title: "WEE5 - Whop Gamification",
	description: "Real-time XP, leveling, and rewards for your Whop community.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Fetch authenticated user
	const user = await getCurrentUser();

	let userName = "Guest";
	let currentXp = 0;
	let userAvatarUrl: string | undefined = undefined;
	let communityName = "WEE5 Community"; // Default fallback

	if (user) {
		// Fetch user profile from Whop
		try {
			const { whopSdk } = await import('@/lib/whop-sdk');
			const whopUser = await whopSdk.users.get({ id: user.userId });
			userName = whopUser.username || whopUser.email?.split('@')[0] || "Member";
			userAvatarUrl = whopUser.profile_pic_url || undefined;
		} catch (error) {
			console.error('Failed to fetch Whop user profile:', error);
			userName = "Member"; // Fallback
		}

		// Fetch community/experience name
		if (user.experienceId) {
			try {
				const { whopSdk } = await import('@/lib/whop-sdk');
				const experience = await whopSdk.experiences.get({ id: user.experienceId });
				communityName = experience.name || experience.title || communityName;
			} catch (error) {
				console.error('Failed to fetch experience data:', error);
				// Keep default community name
			}
		}

		// Fetch XP from database
		const { data: userData } = await supabase()
			.from('users')
			.select('xp')
			.eq('user_id', user.userId)
			.eq('experience_id', user.experienceId)
			.single();

		if (userData) {
			currentXp = userData.xp;
		}
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} font-sans antialiased bg-black text-white`}
			>
				<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-tooltip focus:bg-accent focus:text-white focus:p-3 focus:rounded-br-lg">
					Skip to main content
				</a>
				<Providers>
					<NavbarWrapper
						communityName={communityName}
						userName={userName}
						currentXp={currentXp}
						userAvatarUrl={userAvatarUrl}
					/>
					<main id="main-content">
						<div className="max-w-[1280px] mx-auto">
							{children}
						</div>
					</main>
				</Providers>
			</body>
		</html>
	);
}
