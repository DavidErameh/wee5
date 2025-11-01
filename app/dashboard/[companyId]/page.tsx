import { Button } from "@whop/react/components";
import { headers } from "next/headers";
import Link from "next/link";
import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from '@/lib/db';

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;
	// Ensure the user is logged in on whop.
	const { userId } = await whopsdk.verifyUserToken(await headers());

	// Fetch the neccessary data we want from whop.
	const [company, user, access] = await Promise.all([
		whopsdk.companies.retrieve(companyId),
		whopsdk.users.retrieve(userId),
		whopsdk.users.checkAccess(companyId, { id: userId }),
	]);

	// Check if this company has premium features enabled
	const { data: userRecord } = await supabaseAdmin
		.from('users')
		.select('tier')
		.eq('user_id', userId)
		.eq('experience_id', companyId)
		.single();

	const userTier = userRecord?.tier || 'free';
	const displayName = user.name || `@${user.username}`;

	return (
		<div className="flex flex-col p-8 gap-6">
			<div className="flex justify-between items-center gap-4">
				<div>
					<h1 className="text-9">
						Hi <strong>{displayName}</strong>!
					</h1>
					<p className="text-4 text-gray-10 mt-1">Community: {company.name}</p>
					<p className="text-3 text-gray-9 mt-1">Tier: <span className={userTier === 'premium' || userTier === 'enterprise' ? 'text-blue-600 font-medium' : 'text-gray-700'}>{userTier.charAt(0).toUpperCase() + userTier.slice(1)}</span></p>
				</div>
				<div className="flex gap-3">
					<Link href="https://docs.whop.com/apps" target="_blank">
						<Button variant="classic" size="3">
							Developer Docs
						</Button>
					</Link>
					{userTier === 'free' && (
						<Link href={`/dashboard/${companyId}/upgrade`}>
							<Button variant="classic" color="blue" size="3">
								Upgrade to Premium
							</Button>
						</Link>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Link href={`/experiences/${companyId}`} className="block">
					<div className="border border-gray-a4 rounded-xl p-6 bg-gray-a2 hover:bg-gray-a3 transition-colors h-full">
						<h3 className="text-5 font-bold mb-2">Community Leaderboard</h3>
						<p className="text-3 text-gray-10">View and manage your community's leaderboard</p>
					</div>
				</Link>

				{userTier !== 'free' && (
					<>
						<Link href={`/dashboard/${companyId}/xp-config`} className="block">
							<div className="border border-gray-a4 rounded-xl p-6 bg-blue-1 hover:bg-blue-2 transition-colors h-full">
								<h3 className="text-5 font-bold mb-2">XP Configuration</h3>
								<p className="text-3 text-gray-10">Customize XP rewards for activities</p>
							</div>
						</Link>

						<Link href={`/dashboard/${companyId}/analytics`} className="block">
							<div className="border border-gray-a4 rounded-xl p-6 bg-green-1 hover:bg-green-2 transition-colors h-full">
								<h3 className="text-5 font-bold mb-2">Analytics</h3>
								<p className="text-3 text-gray-10">Track engagement and growth metrics</p>
							</div>
						</Link>
					</>
				)}

				<div className="border border-gray-a4 rounded-xl p-6 bg-gray-a2 h-full">
					<h3 className="text-5 font-bold mb-2">About WEE5</h3>
					<p className="text-3 text-gray-10">WEE5 gamifies your Whop community with XP, levels, and rewards.</p>
					<p className="text-3 text-gray-10 mt-2">Users earn XP for messages, posts, and reactions, and receive rewards when they level up!</p>
				</div>
			</div>

			{userTier === 'free' && (
				<div className="border border-yellow-500 rounded-xl p-6 bg-yellow-50 mt-6">
					<h3 className="text-5 font-bold mb-2">Upgrade to Premium</h3>
					<p className="text-3 text-gray-10 mb-3">Unlock advanced features like custom XP rates, detailed analytics, and anti-cheat measures.</p>
					<Link href={`/dashboard/${companyId}/upgrade`}>
						<Button variant="classic" color="blue">Learn More & Upgrade</Button>
					</Link>
				</div>
			)}
		</div>
	);
}
