'use client';

import { AddJobModal } from '@/components/modals/add-job-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { Briefcase, Building, LogOut, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function Header() {
  const { user, logout } = useAuth();
  const [addJobModalOpen, setAddJobModalOpen] = useState(false);
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0]?.toUpperCase() || 'M';
    const last = lastName?.[0]?.toUpperCase() || 'M';
    return `${first}${last}`;
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.lastName) return user.lastName;
    return user?.email?.split('@')[0] || 'User';
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
 
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            JobHub
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-2">
          <Link
            href="/"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActiveLink('/')
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-muted/80 hover:text-primary'
            }`}
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActiveLink('/jobs')
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-muted/80 hover:text-primary'
            }`}
          >
            All Jobs
          </Link>
        </nav>

        <div className="flex items-center space-x-2">

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={getDisplayName()} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getUserInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {/* User Info */}
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{getDisplayName()}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator />

             

                {/* Profile */}
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className={`flex items-center ${
                      isActiveLink('/profile')
                        ? 'bg-primary/10 text-primary'
                        : ''
                    }`}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Job Modal */}
      {user?.role === 'employer' && (
        <AddJobModal
          open={addJobModalOpen}
          onClose={() => setAddJobModalOpen(false)}
        />
      )}
    </header>
  );
}
