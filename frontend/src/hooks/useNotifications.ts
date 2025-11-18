import { useState, useEffect } from 'react';
import { NotificationManager } from '@/lib/notifications';
import type { NotificationPermission, NotificationSubscription } from '@/lib/notifications';

interface UseNotificationsReturn {
  permission: NotificationPermission;
  subscription: NotificationSubscription | null;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<NotificationSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  loading: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<NotificationSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupported] = useState('serviceWorker' in navigator && 'PushManager' in window);

  useEffect(() => {
    let mounted = true;

    const initializeNotifications = async () => {
      if (!isSupported) {
        setLoading(false);
        return;
      }

      try {
        // Check current permission
        const currentPermission = await NotificationManager.checkPermission();
        if (!mounted) return;
        setPermission(currentPermission);

        // Get existing subscription
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        if (!mounted) return;

        if (existingSubscription) {
          const subscriptionData = {
            endpoint: existingSubscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(existingSubscription.getKey('auth')!)
            }
          };
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeNotifications();

    return () => {
      mounted = false;
    };
  }, [isSupported]);

  const requestPermission = async (): Promise<NotificationPermission> => {
    setLoading(true);
    try {
      const newPermission = await NotificationManager.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (): Promise<NotificationSubscription | null> => {
    setLoading(true);
    try {
      const newSubscription = await NotificationManager.subscribe();
      setSubscription(newSubscription);
      return newSubscription;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await NotificationManager.unsubscribe();
      if (success) {
        setSubscription(null);
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    loading
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = String.fromCharCode.apply(null, Array.from(bytes));
  return window.btoa(binary);
}