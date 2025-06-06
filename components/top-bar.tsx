'use client';

import { PlusCircle, Search, Wifi } from 'lucide-react';
import type { User } from 'next-auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarUserNav } from './sidebar-user-nav';
import { SidebarTrigger } from './ui/sidebar';

export function TopBar({ user }: { user: User | undefined }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Global search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <div className="flex flex-1 items-center justify-end space-x-4">
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Quick Add
          </span>
        </Button>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wifi className="h-4 w-4" />
          <span className="text-xs">Connected</span>
        </div>
        {user && <SidebarUserNav user={user} />}
      </div>
    </header>
  );
}
