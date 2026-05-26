'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import type { AnalyticsEventName, AnalyticsEventProps } from '@/lib/analytics';
import { trackEvent } from '@/lib/analytics';

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: AnalyticsEventName;
  eventProps: AnalyticsEventProps;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export default function TrackedLink({ eventName, eventProps, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        trackEvent(eventName, eventProps);
      }}
    />
  );
}
