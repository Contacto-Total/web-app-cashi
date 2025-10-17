import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LucideAngularModule, Activity, AlertCircle, BarChart3, Briefcase, Building, Calendar, CheckCircle, ChevronDown, ChevronRight, Clock, CreditCard, DollarSign, Edit, Eye, EyeOff, FileText, Folder, GitBranch, History, Info, LayoutDashboard, Mail, MapPin, MessageSquare, Moon, Phone, PhoneCall, PhoneOff, Plus, PlusCircle, Save, Search, Settings, Star, Sun, Table2, Trash2, TrendingUp, User, Users, Wallet, X, XCircle } from 'lucide-angular';

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
        Briefcase,
        Building,
        Calendar,
        CheckCircle,
        ChevronDown,
        ChevronRight,
        Clock,
        CreditCard,
        DollarSign,
        Edit,
        Eye,
        EyeOff,
        FileText,
        Folder,
        GitBranch,
        History,
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
        Save,
        Search,
        Settings,
        Star,
        Sun,
        Table2,
        Trash2,
        TrendingUp,
        User,
        Users,
        Wallet,
        X,
        XCircle
      })
    )
  ]
};
