import { BookOpen, LayoutDashboard, Timer, HeartHandshake, Users, ChartNoAxesCombined, Settings, CircleHelp, UserRound } from 'lucide-react';
import type { AppView } from '../types';
export const navigation = (role: 'student' | 'mentor') => role === 'student' ? [
 { view: 'map' as AppView, label: 'My adventure', icon: LayoutDashboard },
 { view: 'courses' as AppView, label: 'Learning quests', icon: BookOpen },
 { view: 'chamber' as AppView, label: 'Focus zone', icon: Timer },
 { view: 'sos' as AppView, label: 'Take a breath', icon: HeartHandshake },
] : [
 { view: 'courses' as AppView, label: 'Courses', icon: BookOpen },
 { view: 'insights' as AppView, label: 'My classroom', icon: Users },
 { view: 'cohort' as AppView, label: 'Class progress', icon: ChartNoAxesCombined },
];
export const accountNavigation = [
 { view: 'profile' as AppView, label: 'Profile', icon: UserRound },
 { view: 'settings' as AppView, label: 'Settings', icon: Settings },
 { view: 'help' as AppView, label: 'Help & support', icon: CircleHelp },
];
