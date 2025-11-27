import { geocodeAddress } from '@/services/geocodingService';

// Mock fetch
global.fetch = jest.fn();

describe('geocodingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should return coordinates for a valid address', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            lat: '-12.1123',
            lon: '-77.0435',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await geocodeAddress('Av. Larco 1348', 'Miraflores');

      expect(result).toBeDefined();
      expect(result?.lat).toBe(-12.1123);
      expect(result?.lng).toBe(-77.0435);
    });

    it('should return null for invalid address', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await geocodeAddress('Invalid Address XYZ', 'NonExistent');

      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      const mockResponse = {
        ok: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await geocodeAddress('Av. Test', 'Lima');

      expect(result).toBeNull();
    });

    it('should include Lima, Peru in the query', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [{ lat: '-12.0464', lon: '-77.0428' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await geocodeAddress('Av. Larco', 'Miraflores');

      expect(global.fetch).toHaveBeenCalled();
      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('Lima');
      expect(callUrl).toContain('Peru');
    });
  });
});
