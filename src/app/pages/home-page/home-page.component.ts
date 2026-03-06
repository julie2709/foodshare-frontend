import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  q = '';
  category = '';
  city = '';

   recentListings = [
    { title: 'Pommes de terre', city: 'Bron', expiry: '25 Mai', status: 'Disponible', image: 'assets/listings/pommes.jpg' },
    { title: 'Baguettes de pain', city: 'Lyon8', expiry: '22 Mai', status: 'Disponible', image: 'assets/listings/pain.jpg' },
    { title: 'Yaourts à donner', city: 'vaulx-en-velin', expiry: '20 Mai', status: 'Réservée', image: 'assets/listings/yaourts.jpg' },
    { title: 'Salade fraîche', city: 'Lyon2', expiry: '18 Mai', status: 'Disponible', image: 'assets/listings/salade.jpg' },
    { title: 'Riz en vrac', city: 'Lyon3', expiry: '19 Mai', status: 'Disponible', image: 'assets/listings/fraise-bol.jpg' },
    { title: 'Fraises fraîches', city: 'villeurbanne', expiry: '21 Mai', status: 'Disponible', image: 'assets/listings/pain-doré.jpg' }, { title: 'Fraises fraîches', city: 'Lyon6', expiry: '21 Mai', status: 'Disponible', image: 'assets/listings/riz.jpg' }, { title: 'Fraises fraîches', city: 'Lyon9', expiry: '21 Mai', status: 'Disponible', image: 'assets/listings/fraises.jpg' },
  ];

  recipes = [
    { title: 'Gratin de légumes', image: 'assets/recipes/gratin.jpg' },
    { title: 'Salade de riz', image: 'assets/recipes/salade-riz.jpg' },
    { title: 'Tarte aux tomates', image: 'assets/recipes/tarte.jpg' },
    { title: 'Curry de pois chiches', image: 'assets/recipes/curry.jpg' },
  ];
  constructor(private router: Router) {}

  onSearch() {
    this.router.navigate(['/dons'], { queryParams: { q: this.q, category: this.category, city: this.city } });
  }
}

