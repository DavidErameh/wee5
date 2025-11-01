'use client';

import { useState, useEffect } from 'react';
import { Button, TextField, Heading, Text, Card, Flex, Box, TextFieldRoot, TextFieldInput, Label } from 'frosted-ui';
import { useParams } from 'next/navigation';

export default function XpConfiguration() {
  const { companyId } = useParams();
  const [config, setConfig] = useState({
    xp_per_message: 20,
    min_xp_per_post: 15,
    max_xp_per_post: 25,
    xp_per_reaction: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load current configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(`/api/xp-config?experienceId=${companyId}`);
        const data = await response.json();
        
        if (data.config) {
          setConfig(data.config);
        }
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      loadConfig();
    }
  }, [companyId]);

  const handleChange = (field: string, value: string) => {
    setConfig({
      ...config,
      [field]: parseInt(value) || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/xp-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experienceId: companyId,
          xpConfig: config,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Configuration saved successfully!');
      } else {
        setMessage(result.error || 'Failed to save configuration');
      }
    } catch (error) {
      setMessage('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Text>Loading configuration...</Text>;
  }

  return (
    <Box className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <Heading size="6" className="mb-4">XP Configuration</Heading>
        <Text className="mb-6">Customize XP rewards for activities in your community</Text>
        
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2">
              <Label htmlFor="xp_per_message">XP per message</Label>
              <TextFieldRoot id="xp_per_message">
                <TextFieldInput
                  type="number"
                  value={config.xp_per_message}
                  onChange={(e) => handleChange('xp_per_message', e.target.value)}
                  min="0"
                  max="1000"
                />
              </TextFieldRoot>
            </Flex>
            
            <Flex gap="4">
              <Flex direction="column" gap="2" flexBasis="50%">
                <Label htmlFor="min_xp_per_post">Min XP per post</Label>
                <TextFieldRoot id="min_xp_per_post">
                  <TextFieldInput
                    type="number"
                    value={config.min_xp_per_post}
                    onChange={(e) => handleChange('min_xp_per_post', e.target.value)}
                    min="0"
                    max="1000"
                  />
                </TextFieldRoot>
              </Flex>
              <Flex direction="column" gap="2" flexBasis="50%">
                <Label htmlFor="max_xp_per_post">Max XP per post</Label>
                <TextFieldRoot id="max_xp_per_post">
                  <TextFieldInput
                    type="number"
                    value={config.max_xp_per_post}
                    onChange={(e) => handleChange('max_xp_per_post', e.target.value)}
                    min="0"
                    max="1000"
                  />
                </TextFieldRoot>
              </Flex>
            </Flex>
            
            <Flex direction="column" gap="2">
              <Label htmlFor="xp_per_reaction">XP per reaction</Label>
              <TextFieldRoot id="xp_per_reaction">
                <TextFieldInput
                  type="number"
                  value={config.xp_per_reaction}
                  onChange={(e) => handleChange('xp_per_reaction', e.target.value)}
                  min="0"
                  max="1000"
                />
              </TextFieldRoot>
            </Flex>
          </Flex>
          
          <Flex justify="end" gap="3" mt="6">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Flex>
        </form>
        
        {message && (
          <Text color={message.includes('successfully') ? 'green' : 'red'} mt="3">
            {message}
          </Text>
        )}
      </Card>
    </Box>
  );
}