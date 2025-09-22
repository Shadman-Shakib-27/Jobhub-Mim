//@ts-nocheck
'use client';

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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';
import { Briefcase, LogOut, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0]?.toUpperCase() || 'U';
    const last = lastName?.[0]?.toUpperCase() || 'U';
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
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            JobHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-2">
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

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {/* Desktop Actions - Always show Login/Signup OR User Menu */}
          <div className="hidden lg:flex items-center space-x-2">
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
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{getDisplayName()}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      {(() => {
                        const getRoleConfig = (role: UserRole) => {
                          const configs = {
                            seeker: {
                              label: 'Job Seeker',
                              bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                              textColor: 'text-blue-700 dark:text-blue-300',
                              borderColor:
                                'border-blue-200 dark:border-blue-800',
                              icon: '🔍',
                            },
                            employer: {
                              label: 'Employer',
                              bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                              textColor: 'text-purple-700 dark:text-purple-300',
                              borderColor:
                                'border-purple-200 dark:border-purple-800',
                              icon: '🏢',
                            },
                            admin: {
                              label: 'Admin',
                              bgColor: 'bg-red-50 dark:bg-red-900/20',
                              textColor: 'text-red-700 dark:text-red-300',
                              borderColor: 'border-red-200 dark:border-red-800',
                              icon: '⚡',
                            },
                          };
                          return configs[role] || configs.seeker;
                        };

                        const roleConfig = getRoleConfig(user.role);

                        return (
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.borderColor}`}
                          >
                            <span className="text-xs">{roleConfig.icon}</span>
                            <span>{roleConfig.label}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
              /* Always show Login/Signup when not logged in */
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger - Show on medium and small screens */}
          <div className="flex lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-6">
                  {/* Navigation Links */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        isActiveLink('/')
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/80 hover:text-primary'
                      }`}
                    >
                      Home
                    </Link>
                    <Link
                      href="/jobs"
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        isActiveLink('/jobs')
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/80 hover:text-primary'
                      }`}
                    >
                      All Jobs
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t"></div>

                  {/* User Actions */}
                  <div className="flex flex-col gap-2">
                    {user ? (
                      <>
                        {/* User Info */}
                        <div className="px-3 py-2 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.avatar}
                                alt={getDisplayName()}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                {getUserInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="font-medium text-sm">
                                {getDisplayName()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                              {(() => {
                                const getRoleConfig = (role: UserRole) => {
                                  const configs = {
                                    seeker: {
                                      label: 'Job Seeker',
                                      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                                      textColor:
                                        'text-blue-700 dark:text-blue-300',
                                      borderColor:
                                        'border-blue-200 dark:border-blue-800',
                                      icon: '🔍',
                                    },
                                    employer: {
                                      label: 'Employer',
                                      bgColor:
                                        'bg-purple-50 dark:bg-purple-900/20',
                                      textColor:
                                        'text-purple-700 dark:text-purple-300',
                                      borderColor:
                                        'border-purple-200 dark:border-purple-800',
                                      icon: '🏢',
                                    },
                                    admin: {
                                      label: 'Admin',
                                      bgColor: 'bg-red-50 dark:bg-red-900/20',
                                      textColor:
                                        'text-red-700 dark:text-red-300',
                                      borderColor:
                                        'border-red-200 dark:border-red-800',
                                      icon: '⚡',
                                    },
                                  };
                                  return configs[role] || configs.seeker;
                                };

                                const roleConfig = getRoleConfig(user.role);

                                return (
                                  <div
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.borderColor} mt-1`}
                                  >
                                    <span className="text-xs">
                                      {roleConfig.icon}
                                    </span>
                                    <span>{roleConfig.label}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Profile Link */}
                        <Link
                          href="/profile"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/80 hover:text-primary transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>

                        {/* Logout */}
                        <button
                          onClick={() => {
                            logout();
                            setOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      /* Always show Login/Signup in mobile when not logged in */
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          asChild
                          className="justify-start"
                          onClick={() => setOpen(false)}
                        >
                          <Link href="/auth/login">Login</Link>
                        </Button>
                        <Button
                          asChild
                          className="justify-start"
                          onClick={() => setOpen(false)}
                        >
                          <Link href="/auth/register">Sign Up</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
