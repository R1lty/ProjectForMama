import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Category } from '../../../shared/models/category.models';
import {
  Game,
  GameDetails,
  GameDraftRound,
  GameTreeItem,
  SavedGameView
} from '../../../shared/models/game.models';

import { CategoriesApiService } from '../../../shared/services/categories-api.service';
import { GamesApiService } from '../../../shared/services/games-api.service';
import { RoundsApiService } from '../../../shared/services/rounds-api.service';
import { Router } from '@angular/router';
import { SessionsApiService } from '../../../shared/services/sessions-api.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.html',
  styleUrl: './games.css'
})
export class Games implements OnInit {
  categories: Category[] = [];

  showCreateForm = false;
  draftRounds: GameDraftRound[] = [];
  savedGame: SavedGameView | null = null;

  isLoadingCategories = false;
  isSaving = false;
  errorMessage = '';

  gameDetails: GameDetails[] = [];
  gamesTree: GameTreeItem[] = [];
  isLoadingGames = false;
  deletingGameId: number | null = null;

  private nextRoundTempId = 1;

  constructor(
    private categoriesApiService: CategoriesApiService,
    private gamesApiService: GamesApiService,
    private roundsApiService: RoundsApiService,
    private sessionsApiService: SessionsApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadGames();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.errorMessage = '';

    this.categoriesApiService.getCategories().subscribe({
      next: categories => {
        this.categories = categories.sort((a, b) => a.id - b.id);
        this.isLoadingCategories = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Failed to load categories';
        this.isLoadingCategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadGames(): void {
    this.isLoadingGames = true;
    this.errorMessage = '';

    this.gamesApiService.getGames().subscribe({
      next: details => {
        this.gameDetails = details;
        this.gamesTree = this.buildGamesTree(details);
        this.isLoadingGames = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Failed to load games';
        this.isLoadingGames = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildGamesTree(details: GameDetails[]): GameTreeItem[] {
    const gamesMap = new Map<number, GameTreeItem>();

    for (const item of details) {
      let game = gamesMap.get(item.gameid);

      if (!game) {
        game = {
          id: item.gameid,
          rounds: []
        };
        gamesMap.set(item.gameid, game);
      }

      let round = game.rounds.find(r => r.id === item.roundid);

      if (!round) {
        round = {
          id: item.roundid,
          categories: []
        };
        game.rounds.push(round);
      }

      round.categories.push({
        id: item.categoryID,
        name: item.categoryName,
        description: item.catDescription || null
      });
    }

    return Array.from(gamesMap.values())
      .sort((a, b) => a.id - b.id)
      .map(game => ({
        ...game,
        rounds: game.rounds
          .sort((a, b) => a.id - b.id)
          .map(round => ({
            ...round,
            categories: round.categories.sort((a, b) => a.id - b.id)
          }))
      }));
  }

  startCreateGame(): void {
    this.showCreateForm = true;
    this.savedGame = null;
    this.draftRounds = [];
    this.nextRoundTempId = 1;

    this.addRound();
  }

  addRound(): void {
    this.draftRounds.push({
      tempId: this.nextRoundTempId,
      selectedCategoryIds: []
    });

    this.nextRoundTempId++;
  }

  isCategorySelected(round: GameDraftRound, categoryId: number): boolean {
    return round.selectedCategoryIds.includes(categoryId);
  }

  isCategoryDisabled(category: Category, currentRoundIndex: number): boolean {
    if (category.round_id !== null && category.round_id !== undefined) {
      return true;
    }

    return this.draftRounds.some((round, index) =>
      index !== currentRoundIndex &&
      round.selectedCategoryIds.includes(category.id)
    );
  }

  getCategoryDisabledReason(category: Category, currentRoundIndex: number): string {
    if (category.round_id !== null && category.round_id !== undefined) {
      const gameId = this.getGameIdByRoundId(category.round_id);

      if (gameId !== null) {
        return `Already used in game #${gameId}`;
      }

      return 'Already used in another game';
    }

    const isSelectedInAnotherDraftRound = this.draftRounds.some((round, index) =>
      index !== currentRoundIndex &&
      round.selectedCategoryIds.includes(category.id)
    );

    if (isSelectedInAnotherDraftRound) {
      return 'Already selected in another new round';
    }

    return '';
  }

  private getGameIdByRoundId(roundId: number): number | null {
    const gameDetail = this.gameDetails.find(detail => detail.roundid === roundId);

    return gameDetail?.gameid ?? null;
  }

  toggleCategorySelection(round: GameDraftRound, categoryId: number): void {
    if (round.selectedCategoryIds.includes(categoryId)) {
      round.selectedCategoryIds = round.selectedCategoryIds.filter(id => id !== categoryId);
      return;
    }

    round.selectedCategoryIds = [...round.selectedCategoryIds, categoryId];
  }

  canSaveGame(): boolean {
    if (this.draftRounds.length === 0 || this.isSaving) {
      return false;
    }

    for (const round of this.draftRounds) {
      if (round.selectedCategoryIds.length === 0) {
        return false;
      }

      const hasUsedCategory = round.selectedCategoryIds.some(categoryId => {
        const category = this.categories.find(category => category.id === categoryId);

        return category?.round_id !== null &&
          category?.round_id !== undefined;
      });

      if (hasUsedCategory) {
        return false;
      }
    }

    return true;
  }

  deleteGame(id: number): void {
    this.deletingGameId = id;
    this.errorMessage = '';

    this.gamesApiService.deleteGame(id).subscribe({
      next: () => {
        this.gamesTree = this.gamesTree.filter(game => game.id !== id);
        this.deletingGameId = null;

        if (this.savedGame?.id === id) {
          this.savedGame = null;
        }

        this.cdr.detectChanges();
        window.location.reload();
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Failed to delete game';
        this.deletingGameId = null;
        this.cdr.detectChanges();
      }
    });
  }

  cancelCreateGame(): void {
    this.showCreateForm = false;
    this.draftRounds = [];
    this.errorMessage = '';
    this.nextRoundTempId = 1;
  }

  async saveGame(): Promise<void> {
    if (!this.canSaveGame()) {
      this.errorMessage = 'Each round must have at least one category';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      const game = await firstValueFrom(this.gamesApiService.createGame());

      const savedGame: SavedGameView = {
        id: game.id,
        rounds: []
      };

      for (const draftRound of this.draftRounds) {
        const round = await firstValueFrom(
          this.roundsApiService.createRound({
            game_id: game.id
          })
        );

        const selectedCategories = this.categories
          .filter(category => draftRound.selectedCategoryIds.includes(category.id))
          .map(category => ({
            ...category,
            round_id: round.id
          }));

        console.log('Created round:', round);
        console.log('Selected categories for round:', selectedCategories);

        for (const category of selectedCategories) {
          console.log('Created round:', round);
          console.log('Set category round:', {
            categoryId: category.id,
            roundId: round.id
          });

          await firstValueFrom(
            this.categoriesApiService.setCategoryRound(category.id, round.id)
          );
        }

        savedGame.rounds.push({
          id: round.id,
          categories: selectedCategories
        });
      }

      this.savedGame = savedGame;
      this.showCreateForm = false;
      this.isSaving = false;

      this.loadCategories();
      this.loadGames();
      window.location.reload();
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Failed to save game';
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  startGame(gameId: number): void {
    this.errorMessage = '';

    this.sessionsApiService.createSession(gameId).subscribe({
      next: session => {
        localStorage.setItem(`game_${gameId}_session_id`, String(session.id));
        localStorage.setItem(`game_${gameId}_room_code`, session.code);

        this.router.navigate(
          ['/admin/game', gameId, 'play'],
          {
            queryParams: {
              sessionId: session.id,
              code: session.code
            }
          }
        );
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Failed to start game';
        this.cdr.detectChanges();
      }
    });
  }

  joinAsPresenter(): void {
    const code = prompt('Enter room code');

    if (!code) {
      return;
    }

    window.open(`/presenter/join/${encodeURIComponent(code.trim())}`, '_blank');
  }
}