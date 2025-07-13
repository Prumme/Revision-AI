import {
  generateSignature,
  verifySignature,
} from '@infrastructure/urlSignature';
import * as crypto from 'crypto';

describe('Signature Functions', () => {
  const secret = 'mySuperSecretKey123!@#';
  const path = '/api/data';
  const expiresIn = 60; // 60 seconds

  // Mock Date.now() pour des tests reproductibles concernant l'expiration
  const MOCKED_DATE_NOW = 1678886400000; // Une date fixe en millisecondes (par exemple, 15 mars 2023 00:00:00 UTC)
  const ORIGINAL_DATE_NOW = Date.now;

  beforeAll(() => {
    // Surcharge de Date.now() avant tous les tests
    global.Date.now = jest.fn(() => MOCKED_DATE_NOW);
  });

  afterAll(() => {
    // Restauration de Date.now() après tous les tests
    global.Date.now = ORIGINAL_DATE_NOW;
  });

  describe('generateSignature', () => {
    it('should generate a valid signed URL with no extra query parameters', () => {
      const signedUrl = generateSignature(path, expiresIn, secret);
      const url = new URL(`http://example.com${signedUrl}`); // Utiliser URL pour parser la chaîne de requête
      const params = Object.fromEntries(url.searchParams.entries());

      expect(signedUrl).toBeDefined();
      expect(params.s).toBeDefined();
      expect(params.expires).toBeDefined();

      const expectedExpires = Math.floor(MOCKED_DATE_NOW / 1000) + expiresIn;
      expect(parseInt(params.expires)).toBe(expectedExpires);

      // Vérifier que la signature elle-même est correcte
      const dataToSignWithoutSignature = `${path}?expires=${expectedExpires}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(dataToSignWithoutSignature)
        .digest('hex');

      expect(params.s).toBe(expectedSignature);
    });

    it('should throw an error if secret is not provided', () => {
      expect(() => generateSignature(path, expiresIn, '')).toThrow(
        'SIGNATURE_SECRET is not defined',
      );
    });
  });

  describe('verifySignature', () => {
    it('should return true for a valid signature', () => {
      const signedUrl = generateSignature(path, expiresIn, secret);
      const url = new URL(`http://example.com${signedUrl}`);
      const params = Object.fromEntries(url.searchParams.entries());

      const signature = params.s;
      const { s: _, ...queryWithoutSignature } = params; // Supprimer 's' des params pour passer à verifySignature

      const isValid = verifySignature(
        path,
        signature,
        secret,
        queryWithoutSignature,
      );
      expect(isValid).toBe(true);
    });

    it('should return true for a valid signature with additional query parameters', () => {
      const queryParams = { productId: '456' };
      const signedUrl = generateSignature(path, expiresIn, secret, queryParams);
      const url = new URL(`http://example.com${signedUrl}`);
      const params = Object.fromEntries(url.searchParams.entries());

      const signature = params.s;
      const { s: _, ...queryWithoutSignature } = params;

      const isValid = verifySignature(
        path,
        signature,
        secret,
        queryWithoutSignature,
      );
      expect(isValid).toBe(true);
    });

    it('should return false for an invalid signature', () => {
      const signedUrl = generateSignature(path, expiresIn, secret);
      const url = new URL(`http://example.com${signedUrl}`);
      const params = Object.fromEntries(url.searchParams.entries());

      const signature = 'invalidSignature'; // Signature intentionnellement modifiée
      const { s: _, ...queryWithoutSignature } = params;

      const isValid = verifySignature(
        path,
        signature,
        secret,
        queryWithoutSignature,
      );
      expect(isValid).toBe(false);
    });

    it('should return false for an expired signature', () => {
      // Générer une signature qui expirera immédiatement ou est déjà expirée
      const expiredSignedUrl = generateSignature(path, 0, secret); // expires in 0 seconds
      const url = new URL(`http://example.com${expiredSignedUrl}`);
      const params = Object.fromEntries(url.searchParams.entries());

      const signature = params.s;
      const { s: _, ...queryWithoutSignature } = params;

      // Avancer le temps pour simuler l'expiration
      global.Date.now = jest.fn(
        () => MOCKED_DATE_NOW + expiresIn * 1000 + 1000,
      ); // 1 seconde après expiration

      expect(() =>
        verifySignature(path, signature, secret, queryWithoutSignature),
      ).toThrow();

      // Restaurer le temps pour les tests suivants
      global.Date.now = jest.fn(() => MOCKED_DATE_NOW);
    });

    it('should return false if path is different', () => {
      const signedUrl = generateSignature(path, expiresIn, secret);
      const url = new URL(`http://example.com${signedUrl}`);
      const params = Object.fromEntries(url.searchParams.entries());

      const signature = params.s;
      const { s: _, ...queryWithoutSignature } = params;

      const isValid = verifySignature(
        '/api/another-data',
        signature,
        secret,
        queryWithoutSignature,
      );
      expect(isValid).toBe(false);
    });

    it('should return false if query parameters are tampered with', () => {
      const queryParams = { userId: '123' };
      const signedUrl = generateSignature(path, expiresIn, secret, queryParams);
      const url = new URL(`http://example.com${signedUrl}`);
      const params = Object.fromEntries(url.searchParams.entries());

      const signature = params.s;
      const tamperedQuery: any = { ...params, userId: '999' }; // Modifier un paramètre

      const { s: _, ...queryWithoutSignature } = tamperedQuery;

      const isValid = verifySignature(
        path,
        signature,
        secret,
        queryWithoutSignature,
      );
      expect(isValid).toBe(false);
    });

    it('should throw an error if secret is not provided', () => {
      const signedUrl = generateSignature(path, expiresIn, secret);
      const url = new URL(`http://example.com${signedUrl}`);
      const params = Object.fromEntries(url.searchParams.entries());
      const signature = params.s;
      const { s: _, ...queryWithoutSignature } = params;

      expect(() =>
        verifySignature(path, signature, '', queryWithoutSignature),
      ).toThrow('SIGNATURE_SECRET is not defined');
    });

    it('should throw an error if signature is not provided', () => {
      const signedUrl = generateSignature(path, expiresIn, secret);
      const url = new URL(`http://example.com${signedUrl}`);
      const params = Object.fromEntries(url.searchParams.entries());
      const { s: _, ...queryWithoutSignature } = params;

      expect(() =>
        verifySignature(path, '', secret, queryWithoutSignature),
      ).toThrow('Signature is required');
    });
  });
});
