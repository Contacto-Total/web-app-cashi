import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LucideAngularModule, Activity, AlertCircle, BarChart3, Bell, BookOpen, Briefcase, Building, Building2, Calendar, Check, CheckCircle, ChevronDown, ChevronRight, ChevronUp, Circle, Clock, CreditCard, Database, DollarSign, Edit, Eye, EyeOff, FileText, Folder, FolderOpen, FolderTree, GitBranch, History, Inbox, Info, LayoutDashboard, Mail, MapPin, MessageSquare, Moon, Phone, PhoneCall, PhoneOff, Plus, PlusCircle, Rocket, Save, Search, Settings, ShoppingCart, Star, Sun, Table, Table2, Trash2, TrendingUp, Type, User, Users, Wallet, X, XCircle, Zap } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      LucideAngularModule.pick({
        Activity,
        AlertCircle,
        BarChart3,
        Bell,
        BookOpen,
        Briefcase,
        Building,
        Building2,
        Calendar,
        Check,
        CheckCircle,
        ChevronDown,
        ChevronRight,
        ChevronUp,
        Circle,
        Clock,
        CreditCard,
        Database,
        DollarSign,
        Edit,
        Eye,
        EyeOff,
        FileText,
        Folder,
        FolderOpen,
        FolderTree,
        GitBranch,
        History,
        Inbox,
        Info,
        LayoutDashboard,
        Mail,
        MapPin,
        MessageSquare,
        Moon,
        Phone,
        PhoneCall,
        PhoneOff,
        Plus,
        PlusCircle,
        Rocket,
        Save,
        Search,
        Settings,
        ShoppingCart,
        Star,
        Sun,
        Table,
        Table2,
        Trash2,
        TrendingUp,
        Type,
        User,
        Users,
        Wallet,
        X,
        XCircle,
        Zap
      })
    )
  ]
};
