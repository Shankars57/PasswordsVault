'use client';

import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { encryptData, decryptData } from '@/lib/crypto';

const VaultContext = createContext();

export function VaultProvider({ children }) {
  const [vaultItems, setVaultItems] = useState([]);
  const [decryptedItems, setDecryptedItems] = useState({});
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = (password) => {
    if (password.length < 8) {
      toast.error('Master password must be at least 8 characters');
      return false;
    }
    setMasterPassword(password);
    setIsUnlocked(true);
    toast.success('Vault unlocked!');
    return true;
  };

  const lock = () => {
    setIsUnlocked(false);
    setMasterPassword('');
    setVaultItems([]);
    setDecryptedItems({});
  };

  const loadVaultItems = async () => {
    try {
      const response = await fetch('/api/vault');
      if (response.ok) {
        const data = await response.json();
        setVaultItems(data.items);

        const decrypted = {};
        for (const item of data.items) {
          try {
            const decryptedData = await decryptData(
              {
                encrypted: item.encrypted,
                iv: item.iv,
                salt: item.salt,
              },
              masterPassword
            );
            decrypted[item.id] = decryptedData;
          } catch (error) {
            console.error('Failed to decrypt item:', item.id);
          }
        }
        setDecryptedItems(decrypted);
      }
    } catch (error) {
      toast.error('Failed to load vault items');
    }
  };

  const addVaultItem = async (itemData) => {
    try {
      const encrypted = await encryptData(
        { password: itemData.password },
        masterPassword
      );

      const payload = {
        title: itemData.title,
        username: itemData.username,
        url: itemData.url,
        notes: itemData.notes,
        encrypted: encrypted.encrypted,
        iv: encrypted.iv,
        salt: encrypted.salt,
      };

      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Vault item saved!');
        await loadVaultItems();
        return { success: true };
      } else {
        toast.error('Failed to save item');
        return { success: false };
      }
    } catch (error) {
      toast.error('Failed to encrypt and save item');
      return { success: false };
    }
  };

  const updateVaultItem = async (itemId, itemData) => {
    try {
      const encrypted = await encryptData(
        { password: itemData.password },
        masterPassword
      );

      const payload = {
        title: itemData.title,
        username: itemData.username,
        url: itemData.url,
        notes: itemData.notes,
        encrypted: encrypted.encrypted,
        iv: encrypted.iv,
        salt: encrypted.salt,
      };

      const response = await fetch(`/api/vault/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Vault item updated!');
        await loadVaultItems();
        return { success: true };
      } else {
        toast.error('Failed to update item');
        return { success: false };
      }
    } catch (error) {
      toast.error('Failed to encrypt and update item');
      return { success: false };
    }
  };

  const deleteVaultItem = async (itemId) => {
    try {
      const response = await fetch(`/api/vault/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item deleted');
        await loadVaultItems();
        return { success: true };
      } else {
        toast.error('Failed to delete item');
        return { success: false };
      }
    } catch (error) {
      toast.error('Failed to delete item');
      return { success: false };
    }
  };

  return (
    <VaultContext.Provider
      value={{
        vaultItems,
        decryptedItems,
        isUnlocked,
        unlock,
        lock,
        loadVaultItems,
        addVaultItem,
        updateVaultItem,
        deleteVaultItem,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
