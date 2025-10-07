'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Search, Shield } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import PasswordGenerator from '@/components/PasswordGenerator';
import VaultItem from '@/components/VaultItem';
import VaultItemDialog from '@/components/VaultItemDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useVault } from '@/contexts/VaultContext';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const {
    vaultItems,
    decryptedItems,
    isUnlocked,
    unlock,
    lock,
    loadVaultItems,
    addVaultItem,
    updateVaultItem,
    deleteVaultItem,
  } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    if (user && isUnlocked) {
      loadVaultItems();
    }
  }, [user, isUnlocked]);

  const handleUnlock = (e) => {
    e.preventDefault();
    unlock(masterPassword);
  };

  const handleSaveItem = async (itemData) => {
    let result;
    if (editingItem) {
      result = await updateVaultItem(editingItem.id, itemData);
      setEditingItem(null);
    } else {
      result = await addVaultItem(itemData);
    }

    if (result.success) {
      setGeneratedPassword('');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    await deleteVaultItem(itemId);
  };

  const handleEditItem = async (item) => {
    const decrypted = decryptedItems[item.id];
    if (decrypted) {
      setEditingItem({
        id: item.id,
        title: item.title,
        username: item.username,
        url: item.url,
        notes: item.notes,
        password: decrypted.password,
      });
      setShowDialog(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    lock();
  };

  const filteredItems = vaultItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.username?.toLowerCase().includes(query) ||
      item.url?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-2">SecureVault</h1>
            <p className="text-muted-foreground">Your password manager with client-side encryption</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Unlock Your Vault
            </CardTitle>
            <CardDescription>
              Enter your master password to decrypt your vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUnlock} className="space-y-4">
              <Input
                type="password"
                placeholder="Master password (min. 8 characters)"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                minLength={8}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Unlock Vault
                </Button>
                <Button type="button" variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              Your master password is used to encrypt/decrypt your vault items locally.
              It is never sent to the server.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-4 max-w-7xl">
        <header className="flex items-center justify-between mb-8 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">SecureVault</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>

        <Tabs defaultValue="vault" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="vault">My Vault</TabsTrigger>
            <TabsTrigger value="generator">Generator</TabsTrigger>
          </TabsList>

          <TabsContent value="vault" className="space-y-4">
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vault items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {vaultItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your vault is empty</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by adding your first password or generating a new one
                  </p>
                  <Button onClick={() => setShowDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <VaultItem
                    key={item.id}
                    item={item}
                    decryptedData={decryptedItems[item.id]}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}

            {filteredItems.length === 0 && vaultItems.length > 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No items match your search</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="generator">
            <div className="max-w-2xl mx-auto">
              <PasswordGenerator
                onUsePassword={(password) => {
                  setGeneratedPassword(password);
                  setShowDialog(true);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        <VaultItemDialog
          isOpen={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditingItem(null);
            setGeneratedPassword('');
          }}
          onSave={handleSaveItem}
          item={editingItem}
          initialPassword={generatedPassword}
        />
      </div>
    </div>
  );
}
