'use client';

import { useState } from 'react';
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
import { Briefcase, LogOut, User, Plus, Building } from 'lucide-react';
import Link from 'next/link';
import { AddJobModal } from '@/components/modals/add-job-modal';

export function Header() {
  const { user, logout } = useAuth();
  const [addJobModalOpen, setAddJobModalOpen] = useState(false);

  // Helper function to get user initials
  const getUserInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0]?.toUpperCase() || 'U';
    const last = lastName?.[0]?.toUpperCase() || 'U';
    return `${first}${last}`;
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.lastName) {
      return user.lastName;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            JobHub
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/jobs"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            All Jobs
          </Link>
          <Link
            href="/companies"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Companies
          </Link>
          
          {/* Add Job button for Employers - visible in navigation */}
          {user?.role === 'employer' && (
            <Button size="sm" onClick={() => setAddJobModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Add Job button for mobile - only for employers */}
          {user?.role === 'employer' && (
            <Button size="sm" className="md:hidden" onClick={() => setAddJobModalOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.avatar}
                      alt={getDisplayName()}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getUserInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {/* User Info Section */}
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {getDisplayName()}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    {user.role && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Role-specific Navigation Items */}
                {user.role === 'employer' && (
                  <>
                    <DropdownMenuItem onClick={() => setAddJobModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Job
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link
                        href="/employer/dashboard"
                        className="flex items-center"
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Jobs
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link
                        href="/employer/company"
                        className="flex items-center"
                      >
                        <Building className="mr-2 h-4 w-4" />
                        Company Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                  </>
                )}
                
                {/* Common Navigation Items */}
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center"
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
      <AddJobModal 
        open={addJobModalOpen} 
        onClose={() => setAddJobModalOpen(false)} 
      />
    </header>
  );
}