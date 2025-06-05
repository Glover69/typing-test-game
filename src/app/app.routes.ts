import { Routes } from '@angular/router';
import { TypingTestComponent } from '../pages/typing-test/typing-test.component';
import { HomeComponent } from '../pages/home/home.component';

export const routes: Routes = [
    {path: '', redirectTo: '', pathMatch: 'full'},
    {path: '', component: HomeComponent},
    {path: 'game', component: TypingTestComponent},
];
