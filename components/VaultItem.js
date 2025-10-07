'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function VaultItem({ item, decryptedData, onEdit, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);

      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 15000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {decryptedData?.username && (
              <p className="text-sm text-muted-foreground mt-1">{decryptedData.username}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.url && (
          <div className="flex items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 flex-1 truncate"
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{item.url}</span>
            </a>
          </div>
        )}

        {decryptedData && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted p-2 rounded font-mono text-sm">
                {showPassword ? decryptedData.password : '••••••••••••'}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="h-9 w-9"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(decryptedData.password, 'Password')}
                className="h-9 w-9"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {item.notes && (
              <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                {item.notes}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
