declare module 'web-push' {
  type WebPushSubscription = {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

  type VapidDetails = {
    subject: string;
    publicKey: string;
    privateKey: string;
  };

  type SendNotificationOptions = {
    TTL?: number;
    urgency?: 'very-low' | 'low' | 'normal' | 'high';
    timeout?: number;
    vapidDetails?: VapidDetails;
  };

  type SendNotificationResponse = {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  };

  const webpush: {
    sendNotification(
      subscription: WebPushSubscription,
      payload?: string | Buffer,
      options?: SendNotificationOptions
    ): Promise<SendNotificationResponse>;
  };

  export default webpush;
}
