import { Button } from "@whop/react/components";
import { headers } from "next/headers";
import Link from "next/link";
import { whopsdk } from "@/lib/whop-sdk";
import { Heading, Text, Card, Flex, Box } from 'frosted-ui';

export default async function UpgradePage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;
	// Ensure the user is logged in on whop.
	const { userId } = await whopsdk.verifyUserToken(await headers());

	// Fetch user and company data
	const [company, user, access] = await Promise.all([
		whopsdk.companies.retrieve(companyId),
		whopsdk.users.retrieve(userId),
		whopsdk.users.checkAccess(companyId, { id: userId }),
	]);

	const displayName = user.name || `@${user.username}`;

	return (
		<Box className="flex flex-col p-8 max-w-4xl mx-auto">
			<Box className="text-center mb-8">
				<Heading size="8" className="mb-2">Upgrade Your WEE5 Experience</Heading>
				<Text size="4" color="gray">Enhance your community with premium features</Text>
			</Box>

			<Flex className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{/* Free Tier */}
				<Card className="p-6">
					<Heading size="6" className="mb-2">Free</Heading>
					<Text size="4" color="gray" className="mb-4">$0/month</Text>
					<Box className="space-y-2 mb-6">
						<Text size="3">✓ Core XP tracking</Text>
						<Text size="3">✓ Leveling system</Text>
						<Text size="3">✓ Basic rewards</Text>
						<Text size="3">✓ Public leaderboard</Text>
						<Text size="3" color="gray">✗ Custom XP rates</Text>
						<Text size="3" color="gray">✗ Advanced analytics</Text>
						<Text size="3" color="gray">✗ Enhanced anti-cheat</Text>
					</Box>
					<Button variant="outline" disabled className="w-full">
						Current Plan
					</Button>
				</Card>

				{/* Premium Tier */}
				<Card className="p-6 relative border-2 border-blue-500 bg-blue-1">
					<Box className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
						POPULAR
					</Box>
					<Heading size="6" className="mb-2">Premium</Heading>
					<Text size="4" color="gray" className="mb-4">$29/month</Text>
					<Box className="space-y-2 mb-6">
						<Text size="3">✓ All Free features</Text>
						<Text size="3">✓ Custom XP rates</Text>
						<Text size="3">✓ Engagement analytics</Text>
						<Text size="3">✓ Advanced anti-cheat</Text>
						<Text size="3">✓ Custom badges</Text>
						<Text size="3">✓ Priority support</Text>
						<Text size="3" color="gray">✗ Multi-community support</Text>
					</Box>
					<Box className="w-full">
						<Button variant="classic" color="blue" className="w-full">
							Get Premium
						</Button>
					</Box>
				</Card>

				{/* Enterprise Tier */}
				<Card className="p-6">
					<Heading size="6" className="mb-2">Enterprise</Heading>
					<Text size="4" color="gray" className="mb-4">$99/month</Text>
					<Box className="space-y-2 mb-6">
						<Text size="3">✓ All Premium features</Text>
						<Text size="3">✓ Multi-community support</Text>
						<Text size="3">✓ Custom badges</Text>
						<Text size="3">✓ API access</Text>
						<Text size="3">✓ Custom integrations</Text>
						<Text size="3">✓ Dedicated support</Text>
						<Text size="3">✓ SLA guarantee</Text>
					</Box>
					<Button variant="classic" className="w-full">
						Contact Sales
					</Button>
				</Card>
			</Flex>

			<Card className="p-6">
				<Heading size="6" className="mb-4">Frequently Asked Questions</Heading>
				<Box className="space-y-4">
					<Box>
						<Heading size="4" className="font-semibold mb-1">How do custom XP rates work?</Heading>
						<Text size="3" color="gray">Set your own XP values for messages, posts, and reactions to match your community's engagement goals.</Text>
					</Box>
					<Box>
						<Heading size="4" className="font-semibold mb-1">What analytics are included?</Heading>
						<Text size="3" color="gray">Track daily active users, engagement trends, XP distribution, and level progression over time.</Text>
					</Box>
					<Box>
						<Heading size="4" className="font-semibold mb-1">How does the anti-cheat system work?</Heading>
						<Text size="3" color="gray">Advanced algorithms detect spam behavior and automatically apply penalties to maintain fair play.</Text>
					</Box>
				</Box>
			</Card>
		</Box>
	);
}