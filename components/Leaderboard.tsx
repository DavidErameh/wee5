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
    <Card className="w-full max-w-lg font-inter">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          {title}
        </CardTitle>
        <Trophy className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.rank} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold">#{entry.rank}</span>
                <span>{entry.userName}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Level {entry.level}</span>
                <span className="font-medium">{entry.xp} XP</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
