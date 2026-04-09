import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Code,
    FilePenLine,
    GraduationCap,
    House,
    LayoutDashboard,
    Trophy,
    Users,
    BookMarked,
    ShieldCheck,
} from 'lucide-react';
import AppLogo from './app-logo';

// Navigasi Mahasiswa
const navMahasiswa: NavItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard',
        icon: House,
    },
    {
        title: 'Papan Peringkat',
        href: '/leaderboard',
        icon: Trophy,
    },
    {
        title: 'Kompiler',
        href: '/compiler',
        icon: Code,
    },
    {
        title: 'Buku Panduan',
        href: '/manual-book',
        icon: BookMarked,
    },
];

// Navigasi Dosen
const navDosen: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/instructor/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Modul',
        href: '/instructor/modules',
        icon: BookMarked,
    },
    {
        title: 'Kelas',
        href: '/instructor/classes',
        icon: Users,
    },
    {
        title: 'Quiz',
        href: '/instructor/quiz',
        icon: FilePenLine,
    },
    {
        title: 'Praktikum',
        href: '/instructor/praktikum',
        icon: GraduationCap,
    },
    {
        title: 'Leaderboard',
        href: '/leaderboard',
        icon: Trophy,
    },
    {
        title: 'Kompiler',
        href: '/compiler',
        icon: Code,
    },
    {
        title: 'Buku Panduan',
        href: '/instructor/manual-book',
        icon: BookMarked,
    },
];

// Navigasi Admin
const navAdmin: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: ShieldCheck,
    },
    {
        title: 'Users',
        href: '/admin/pengguna',
        icon: Users,
    },
];

const navTambahan: NavItem[] = [];

export function AppSidebar() {
    const props = usePage().props as Partial<{ auth: { user: { role: string } } }>;
    const peran = props.auth?.user?.role ?? 'student';

    const navUtama =
        peran === 'admin'      ? navAdmin  :
        peran === 'instructor' ? navDosen  :
        navMahasiswa;

    const tautanDasbor =
        peran === 'admin'      ? '/admin/dasbor'         :
        peran === 'instructor' ? '/instructor/dashboard' :
        '/dashboard';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={tautanDasbor} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navUtama} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={navTambahan} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
