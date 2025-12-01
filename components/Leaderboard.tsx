import { Card, CardHeader, CardTitle, CardContent } from 'frosted-ui';
import { Trophy } from 'lucide-react'; // Assuming Lucide-react for iconography

interface LeaderboardEntry {
  rank: number;
  userName: string;
  level: number;
  xp: number;
}

interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
}

export const Leaderboard = ({ title, entries }: LeaderboardProps) => {
  return (
    <Card className="w-full max-w-lg font-inter bg-dark border-border text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-white">
          {title}
        </CardTitle>
        <Trophy className="h-5 w-5 text-text-muted" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.rank} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">#{entry.rank}</span>
                <span className="text-white">{entry.userName}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-text-muted">Level {entry.level}</span>
                <span className="font-medium text-white">{entry.xp} XP</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
