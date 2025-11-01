'use client';

import { useState, useEffect } from 'react';
import { Heading, Text, Card, Flex, Box, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TextFieldRoot, TextFieldInput, Label } from 'frosted-ui';
import { useParams } from 'next/navigation';

export default function AnalyticsPage() {
  const { companyId } = useParams();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        let url = `/api/analytics?experienceId=${companyId}`;
        if (dateRange.startDate) url += `&startDate=${dateRange.startDate}`;
        if (dateRange.endDate) url += `&endDate=${dateRange.endDate}`;

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.analytics) {
          setAnalytics(data.analytics);
          setSummary(data.summary);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      loadAnalytics();
    }
  }, [companyId, dateRange]);

  const handleDateChange = (field: string, value: string) => {
    setDateRange({
      ...dateRange,
      [field]: value,
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    const loadAnalytics = async () => {
      try {
        let url = `/api/analytics?experienceId=${companyId}`;
        if (dateRange.startDate) url += `&startDate=${dateRange.startDate}`;
        if (dateRange.endDate) url += `&endDate=${dateRange.endDate}`;

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.analytics) {
          setAnalytics(data.analytics);
          setSummary(data.summary);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  };

  if (loading) {
    return <Text>Loading analytics...</Text>;
  }

  return (
    <Box className="max-w-6xl mx-auto p-6">
      <Heading size="7" className="mb-6">Engagement Analytics</Heading>
      
      <Card className="p-6 mb-6">
        <Flex direction="column" gap="4">
          <Flex gap="4" align="end">
            <Flex direction="column" gap="2">
              <Label htmlFor="start-date">Start Date</Label>
              <TextFieldRoot id="start-date">
                <TextFieldInput
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
              </TextFieldRoot>
            </Flex>
            <Flex direction="column" gap="2">
              <Label htmlFor="end-date">End Date</Label>
              <TextFieldRoot id="end-date">
                <TextFieldInput
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
              </TextFieldRoot>
            </Flex>
            <Box pt="4">
              <Button onClick={handleRefresh}>Refresh</Button>
            </Box>
          </Flex>
        </Flex>
      </Card>

      {summary && (
        <Card className="p-6 mb-6">
          <Heading size="5" className="mb-4">Summary</Heading>
          <Flex gap="6" wrap="wrap">
            <Box>
              <Text color="gray" size="2">Total XP Earned</Text>
              <Text size="5" weight="bold">{summary.totalXpEarned.toLocaleString()}</Text>
            </Box>
            <Box>
              <Text color="gray" size="2">Total Active Users</Text>
              <Text size="5" weight="bold">{summary.totalActiveUsers}</Text>
            </Box>
            <Box>
              <Text color="gray" size="2">Messages Sent</Text>
              <Text size="5" weight="bold">{summary.totalMessages}</Text>
            </Box>
            <Box>
              <Text color="gray" size="2">Posts Created</Text>
              <Text size="5" weight="bold">{summary.totalPosts}</Text>
            </Box>
            <Box>
              <Text color="gray" size="2">Reactions Given</Text>
              <Text size="5" weight="bold">{summary.totalReactions}</Text>
            </Box>
            <Box>
              <Text color="gray" size="2">Levels Achieved</Text>
              <Text size="5" weight="bold">{summary.totalLevelsAchieved}</Text>
            </Box>
          </Flex>
        </Card>
      )}

      <Card className="p-6">
        <Heading size="5" className="mb-4">Daily Analytics</Heading>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>XP Earned</TableHead>
              <TableHead>Active Users</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Reactions</TableHead>
              <TableHead>Levels Achieved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics.length > 0 ? (
              analytics.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.total_xp_earned || 0}</TableCell>
                  <TableCell>{record.total_users_active || 0}</TableCell>
                  <TableCell>{record.messages_sent || 0}</TableCell>
                  <TableCell>{record.posts_created || 0}</TableCell>
                  <TableCell>{record.reactions_given || 0}</TableCell>
                  <TableCell>{record.new_levels_achieved || 0}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No analytics data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}