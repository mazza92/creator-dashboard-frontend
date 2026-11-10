import { SERVED_COUNTRIES, detectCountry, searchCountries, flagFor, isServedCountry } from './countries';

describe('served countries', () => {
  it('lists 34 countries, pinned first then A-Z', () => {
    expect(SERVED_COUNTRIES).toHaveLength(34);
    expect(SERVED_COUNTRIES.slice(0, 4).map((c) => c.code)).toEqual(['US', 'GB', 'CA', 'AU']);
    const rest = SERVED_COUNTRIES.slice(4).map((c) => c.name);
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b)));
    expect(isServedCountry('IN')).toBe(false);
    expect(flagFor('ie')).toBe('🇮🇪');
  });
});

describe('searchCountries', () => {
  it('matches name prefixes first, then aliases', () => {
    expect(searchCountries('ger')[0].code).toBe('DE');
    expect(searchCountries('uk')[0].code).toBe('GB');
    expect(searchCountries('england')[0].code).toBe('GB');
    expect(searchCountries('zealand')[0].code).toBe('NZ');
    expect(searchCountries('xyz')).toEqual([]);
  });
});

describe('detectCountry', () => {
  it('uses the time zone first', () => {
    expect(detectCountry({ language: 'en-US' }, 'Europe/London')).toBe('GB');
    expect(detectCountry({ language: 'en-GB' }, 'Australia/Sydney')).toBe('AU');
    expect(detectCountry({ language: 'de-DE' }, 'Europe/Berlin')).toBe('DE');
  });

  it('tells the US and Canada apart', () => {
    expect(detectCountry({ language: 'en-US' }, 'America/New_York')).toBe('US');
    expect(detectCountry({ language: 'en-CA' }, 'America/New_York')).toBe('CA');
    expect(detectCountry({ language: 'en-US' }, 'America/Toronto')).toBe('CA');
  });

  it('does not guess outside the countries we serve', () => {
    expect(detectCountry({ language: 'en-US' }, 'Asia/Kolkata')).toBe('');
    expect(detectCountry({ language: 'pt-BR' }, 'America/Sao_Paulo')).toBe('');
    expect(detectCountry({ language: 'fr-FR' }, '')).toBe('FR');
  });
});
