import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Documents } from './pages/documents/documents';
import { Upload } from './pages/upload/upload';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard],
        children: [
            {
                path: 'documents',
                component: Documents
            },
            {
                path: 'upload',
                component: Upload
            },
            {
                path: '',
                redirectTo: 'documents',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];