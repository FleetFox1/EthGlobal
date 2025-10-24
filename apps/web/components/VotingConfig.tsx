/**
 * Voting Configuration Component
 * Allows admin to adjust voting duration and toggle voting on/off
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Power, Save, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface VotingConfigProps {
  adminWallet: string;
}

export default function VotingConfig({ adminWallet }: VotingConfigProps) {
  const [config, setConfig] = useState({
    voting_duration_hours: 72,
    voting_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick presets for demos
  const presets = [
    { name: '5 minutes', hours: 0.083 },
    { name: '10 minutes', hours: 0.167 },
    { name: '30 minutes', hours: 0.5 },
    { name: '1 hour', hours: 1 },
    { name: '6 hours', hours: 6 },
    { name: '1 day', hours: 24 },
    { name: '3 days (default)', hours: 72 },
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/voting-config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      showMessage('error', 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/voting-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          admin_wallet: adminWallet,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Configuration updated successfully!');
        setConfig(data.data);
      } else {
        showMessage('error', data.error || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      showMessage('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  function applyPreset(hours: number) {
    setConfig({ ...config, voting_duration_hours: hours });
  }

  const durationText = config.voting_duration_hours >= 24 
    ? `${Math.floor(config.voting_duration_hours / 24)} day${Math.floor(config.voting_duration_hours / 24) > 1 ? 's' : ''}`
    : config.voting_duration_hours >= 1
    ? `${Math.floor(config.voting_duration_hours)} hour${Math.floor(config.voting_duration_hours) > 1 ? 's' : ''}`
    : `${Math.floor(config.voting_duration_hours * 60)} minute${Math.floor(config.voting_duration_hours * 60) > 1 ? 's' : ''}`;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Voting Configuration
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust voting duration or disable voting for hackathon demos
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
              : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Power className={`h-5 w-5 ${config.voting_enabled ? 'text-green-500' : 'text-red-500'}`} />
            <div>
              <Label className="text-base font-medium">Voting System</Label>
              <p className="text-xs text-muted-foreground">
                {config.voting_enabled ? 'Currently enabled' : 'Currently disabled'}
              </p>
            </div>
          </div>
          <Switch
            checked={config.voting_enabled}
            onCheckedChange={(checked) => setConfig({ ...config, voting_enabled: checked })}
          />
        </div>

        {/* Duration Input */}
        <div className="space-y-2">
          <Label htmlFor="duration">Voting Duration (hours)</Label>
          <Input
            id="duration"
            type="number"
            min="0.01"
            step="0.01"
            value={config.voting_duration_hours}
            onChange={(e) => setConfig({ ...config, voting_duration_hours: parseFloat(e.target.value) || 0 })}
            className="text-lg font-mono"
          />
          <p className="text-sm text-muted-foreground">
            Current setting: <strong>{durationText}</strong>
          </p>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label>Quick Presets</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant={config.voting_duration_hours === preset.hours ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyPreset(preset.hours)}
                className="h-auto py-2"
              >
                <div className="text-center w-full">
                  <div className="font-semibold text-xs">{preset.name}</div>
                  {preset.hours < 1 && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      <Zap className="h-2.5 w-2.5 inline" /> Demo mode
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Warning for short durations */}
        {config.voting_duration_hours < 1 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-900 dark:text-yellow-100">
              <strong>Demo Mode:</strong> Short voting periods are great for hackathon demos but not recommended for production. Users will have only <strong>{Math.floor(config.voting_duration_hours * 60)} minutes</strong> to vote!
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>ℹ️ How it works:</strong> When users submit bugs for voting, the deadline is calculated using this duration. Existing pending votes are not affected - only new submissions use the updated duration.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={saveConfig}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
          <Button
            onClick={loadConfig}
            variant="outline"
            disabled={saving || loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
