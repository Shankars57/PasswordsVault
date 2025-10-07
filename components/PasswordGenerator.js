'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw } from 'lucide-react';
import { generatePassword } from '@/lib/crypto';
import { toast } from 'sonner';

export default function PasswordGenerator({ onUsePassword }) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
  });

  const handleGenerate = () => {
    const newPassword = generatePassword(length, options);
    setPassword(newPassword);
  };

  const handleCopy = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard!');

      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 15000);
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  const toggleOption = (option) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>Create a strong, random password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              value={password}
              readOnly
              placeholder="Click generate to create a password"
              className="flex-1 font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!password}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Length: {length}</label>
          </div>
          <Slider
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            min={8}
            max={64}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Options:</label>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={options.includeUppercase}
              onCheckedChange={() => toggleOption('includeUppercase')}
            />
            <label htmlFor="uppercase" className="text-sm cursor-pointer">
              Uppercase (A-Z)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={options.includeLowercase}
              onCheckedChange={() => toggleOption('includeLowercase')}
            />
            <label htmlFor="lowercase" className="text-sm cursor-pointer">
              Lowercase (a-z)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={options.includeNumbers}
              onCheckedChange={() => toggleOption('includeNumbers')}
            />
            <label htmlFor="numbers" className="text-sm cursor-pointer">
              Numbers (0-9)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={options.includeSymbols}
              onCheckedChange={() => toggleOption('includeSymbols')}
            />
            <label htmlFor="symbols" className="text-sm cursor-pointer">
              Symbols (!@#$...)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="similar"
              checked={options.excludeSimilar}
              onCheckedChange={() => toggleOption('excludeSimilar')}
            />
            <label htmlFor="similar" className="text-sm cursor-pointer">
              Exclude similar characters (i, l, 1, L, o, 0, O)
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerate} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Password
          </Button>
          {onUsePassword && password && (
            <Button onClick={() => onUsePassword(password)} variant="secondary">
              Use This Password
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
