import { QuizQuotaService } from './quiz-quota.service';
import { SubscriptionTier } from './subscription-tiers.config';

const mockQuizRepository = {
  countByUserId: jest.fn(),
  countByUserIdAndDateRange: jest.fn(),
};

const baseDto = { medias: ['file1', 'file2'] };
const freeTierDto = { medias: ['file1'] };

describe('QuizQuotaService', () => {
  let service: QuizQuotaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuizQuotaService(mockQuizRepository as any);
  });

  it('autorise la création si tout est OK (tier FREE)', async () => {
    mockQuizRepository.countByUserId.mockResolvedValue(0);
    mockQuizRepository.countByUserIdAndDateRange.mockResolvedValue(0);
    await expect(
      service.validateQuotaOrThrow('user1', SubscriptionTier.FREE, freeTierDto as any, 'abc')
    ).resolves.toBeUndefined();
  });

  it('rejette si le nombre total de quiz est dépassé', async () => {
    mockQuizRepository.countByUserId.mockResolvedValue(5);
    mockQuizRepository.countByUserIdAndDateRange.mockResolvedValue(0);
    await expect(
      service.validateQuotaOrThrow('user1', SubscriptionTier.FREE, freeTierDto as any, 'abc')
    ).rejects.toThrow(/quiz maximum/);
  });

  it('rejette si le nombre de générations par jour est dépassé', async () => {
    mockQuizRepository.countByUserId.mockResolvedValue(0);
    mockQuizRepository.countByUserIdAndDateRange.mockResolvedValue(1);
    await expect(
      service.validateQuotaOrThrow('user1', SubscriptionTier.FREE, freeTierDto as any, 'abc')
    ).rejects.toThrow(/génération\(s\) par jour/);
  });

  it('rejette si le nombre de fichiers dépasse la limite', async () => {
    mockQuizRepository.countByUserId.mockResolvedValue(0);
    mockQuizRepository.countByUserIdAndDateRange.mockResolvedValue(0);
    const dto = { medias: ['a', 'b'] }; // FREE = 1 fichier max
    await expect(
      service.validateQuotaOrThrow('user1', SubscriptionTier.FREE, dto as any, 'abc')
    ).rejects.toThrow(/fichier\(s\) maximum/);
  });

  it('rejette si le nombre de tokens dépasse la limite', async () => {
    mockQuizRepository.countByUserId.mockResolvedValue(0);
    mockQuizRepository.countByUserIdAndDateRange.mockResolvedValue(0);
    // FREE = 2000 tokens max
    await expect(
      service.validateQuotaOrThrow('user1', SubscriptionTier.FREE, freeTierDto as any, 'a'.repeat(3000))
    ).rejects.toThrow(/Limite de tokens dépassée/);
  });

  it('autorise la création pour le tier PRO avec beaucoup de tokens', async () => {
    mockQuizRepository.countByUserId.mockResolvedValue(0);
    mockQuizRepository.countByUserIdAndDateRange.mockResolvedValue(0);
    await expect(
      service.validateQuotaOrThrow('user1', SubscriptionTier.PRO, baseDto as any, 'a'.repeat(15000))
    ).resolves.toBeUndefined();
  });
});
