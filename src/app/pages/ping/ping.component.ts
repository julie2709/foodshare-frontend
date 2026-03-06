import { Component, OnInit } from '@angular/core';
import { ApiService, PingResponse } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ping',
  imports: [CommonModule],
  templateUrl: './ping.component.html',
  styleUrls: ['./ping.component.scss'],
})
export class PingComponent implements OnInit {
  loading = true;
  error: string | null = null;
  data: PingResponse | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.ping().subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur API (voir console)';
        console.error(err);
        this.loading = false;
      },
    });
  }
}
