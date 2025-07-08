import { Inject, Injectable } from '@nestjs/common';
import { QuizRepository } from '@repositories/quiz.repository';
import { SubscriptionTier, SUBSCRIPTION_TIERS_QUOTA } from './subscription-tiers.config';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizQuotaService {
  constructor(
    @Inject('QuizRepository')
    private readonly quizRepository: QuizRepository
  ) {}

  async validateQuotaOrThrow(
    userId: string,
    tier: SubscriptionTier,
    createQuizDto: CreateQuizDto,
    inputText?: string, // Ajout du texte concaténé
  ): Promise<void> {
    const quota = SUBSCRIPTION_TIERS_QUOTA[tier];

    // 1. Vérifier le nombre total de quiz
    if (quota.maxTotalQuizzes !== null) {
      const totalQuizzes = await this.quizRepository.countByUserId(userId);
      if (totalQuizzes >= quota.maxTotalQuizzes) {
        throw new Error(
          `Limite atteinte : ${quota.maxTotalQuizzes} quiz maximum pour l'offre ${tier}`,
        );
      }
    }

    // 2. Vérifier le nombre de générations aujourd'hui
    if (quota.maxGenerationsPerDay !== null) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const generationsToday = await this.quizRepository.countByUserIdAndDateRange(
        userId,
        today,
        tomorrow,
      );
      if (generationsToday >= quota.maxGenerationsPerDay) {
        throw new Error(
          `Limite atteinte : ${quota.maxGenerationsPerDay} génération(s) par jour pour l'offre ${tier}`,
        );
      }
    }

    // 3. Vérifier le nombre de fichiers par génération
    if (
      createQuizDto.medias &&
      createQuizDto.medias.length > quota.maxFilesPerGeneration
    ) {
      throw new Error(
        `Limite atteinte : ${quota.maxFilesPerGeneration} fichier(s) maximum par génération pour l'offre ${tier}`,
      );
    }

    // 4. Vérifier la limite de tokens d'entrée
    if (quota.maxInputTokens !== null && inputText) {
      // Utilise le texte concaténé pour le calcul
      const inputTokens = inputText.length; // Remplacer par un vrai tokenizer si besoin
      if (inputTokens > quota.maxInputTokens) {
        throw new Error(
          `Limite de tokens dépassée (${inputTokens}/${quota.maxInputTokens}) pour l'offre ${tier}`,
        );
      }
    }
  }
}
