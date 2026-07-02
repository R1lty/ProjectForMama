import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionsApiService } from '../../../shared/services/sessions-api.service';

@Component({
  selector: 'app-presenter-join',
  templateUrl: './presenter-join.html',
  styleUrl: './presenter-join.css',
})
export class PresenterJoin implements OnInit {
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionsApiService: SessionsApiService
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');

    if (!code) {
      this.errorMessage = 'Room code is missing';
      return;
    }

    this.sessionsApiService.getSessionByCode(code).subscribe({
      next: session => {
        this.router.navigate(['/presenter/session', session.id], { replaceUrl: true });
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Session not found';
      }
    });
  }
}
