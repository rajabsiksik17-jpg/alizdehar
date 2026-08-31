import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import isoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import arLocale from "i18n-iso-countries/langs/ar.json";

isoCountries.registerLocale(enLocale);
isoCountries.registerLocale(arLocale);

export interface CountryOption {
  code: string; // ISO-3166 alpha-2
  name: string; // English name
  nameAr: string; // Arabic name
  dial: string; // e.g. "+962"
  flag: string; // emoji flag
}

function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export const countries: CountryOption[] = getCountries()
  .map((code) => {
    let dial = "";
    try {
      dial = `+${getCountryCallingCode(code)}`;
    } catch {
      dial = "";
    }
    const name = isoCountries.getName(code, "en") || code;
    const nameAr = isoCountries.getName(code, "ar") || name;
    return { code, name, nameAr, dial, flag: flagEmoji(code) };
  })
  .filter((c) => c.dial)
  .sort((a, b) => a.name.localeCompare(b.name));

export function countryByCode(code: string): CountryOption | undefined {
  return countries.find((c) => c.code.toUpperCase() === code.toUpperCase());
}

/** Guess an ISO2 country from a browser locale like "en-US" or "ar-JO". */
export function detectCountryByLocale(locale?: string): string {
  const region = (locale || "").split("-")[1]?.toUpperCase();
  return region && countryByCode(region) ? region : "";
}

export interface PhoneParseResult {
  valid: boolean;
  possible: boolean;
  e164: string;
  country: string;
  dialCode: string;
  nationalNumber: string;
}

export function parsePhone(
  input: string,
  countryCode?: string,
): PhoneParseResult {
  const parsed = parsePhoneNumberFromString(input, countryCode as never);
  if (!parsed) {
    return {
      valid: false,
      possible: false,
      e164: "",
      country: countryCode || "",
      dialCode: "",
      nationalNumber: "",
    };
  }
  return {
    valid: parsed.isValid(),
    possible: parsed.isPossible(),
    e164: parsed.number,
    country: parsed.country || countryCode || "",
    dialCode: `+${parsed.countryCallingCode}`,
    nationalNumber: String(parsed.nationalNumber),
  };
}
