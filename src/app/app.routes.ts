import { Routes } from '@angular/router';
import { PingComponent } from './pages/ping/ping.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ListingsPageComponent } from './pages/listings-page/listings-page.component';
import { RecipesPageComponent } from './pages/recipes-page/recipes-page.component';
import { ForumsPageComponent } from './pages/forums-page/forums-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { ListingDetailPageComponent } from './pages/listing-detail-page/listing-detail-page.component';
import { RecipeDetailPageComponent } from './pages/recipe-detail-page/recipe-detail-page.component';
import { CreateListingPageComponent } from './pages/create-listing-page/create-listing-page.component';
import { authGuard } from './core/guards/auth.guards';




export const routes: Routes = [
  { path: 'ping', component: PingComponent },
  { path: '', component: HomePageComponent },
  { path: 'dons', component: ListingsPageComponent },
  { path: 'dons/:id', component: ListingDetailPageComponent },
  { path: 'recettes', component: RecipesPageComponent },
  { path: 'recettes/:id', component: RecipeDetailPageComponent },
  { path: 'forum', component: ForumsPageComponent },
  { path: 'connexion', component: LoginPageComponent },
  { path: 'inscription', component: RegisterPageComponent },
   // authentification
  { path: 'connexion', component: LoginPageComponent },
  { path: 'inscription', component: RegisterPageComponent },

  // pages protégées
  {
    path: 'publier-un-don',
    component: CreateListingPageComponent,
    canActivate: [authGuard]
  },

  // {
  //   path: 'profil',
  //   component: ProfilePageComponent,
  //   canActivate: [authGuard]
  // },

  // {
  //   path: 'mes-dons',
  //   component: MyListingsPageComponent,
  //   canActivate: [authGuard]
  // },

  { path: '**', redirectTo: '' }
];