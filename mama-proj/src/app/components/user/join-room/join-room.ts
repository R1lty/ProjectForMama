import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionsApiService } from '../../../shared/services/sessions-api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-join-room',
  imports: [FormsModule],
  templateUrl: './join-room.html',
  styleUrl: './join-room.css',
})
export class JoinRoom implements OnInit {
  roomCode = '';
  playerName = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sessionsApiService: SessionsApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const codeFromUrl = this.route.snapshot.queryParamMap.get('code');

    if (codeFromUrl) {
      this.roomCode = codeFromUrl;
    }
  }

  joinGame(): void {
    this.errorMessage = '';

    const code = this.roomCode.trim();
    const name = this.playerName.trim();

    if (!code) {
      this.errorMessage = 'Введите код комнаты';
      return;
    }

    if (!name) {
      this.errorMessage = 'Введите имя игрока';
      return;
    }

    this.isLoading = true;

    this.sessionsApiService.createPlayer(name).subscribe({
      next: player => {
        localStorage.setItem('player_id', String(player.id));
        localStorage.setItem('player_name', player.name);
        localStorage.setItem('player_token', player.token);

        this.sessionsApiService.joinSession(code, player.token).subscribe({
          next: sessionPlayer => {
            localStorage.setItem('session_id', String(sessionPlayer.session_id));
            localStorage.setItem('session_player_id', String(sessionPlayer.id));
            localStorage.setItem('player_score', String(sessionPlayer.score));

            this.router.navigate(['/player/session', sessionPlayer.session_id]);
          },
          error: error => {
            console.error(error);
            this.errorMessage = 'Не удалось подключиться к комнате';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Не удалось создать игрока';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

}
