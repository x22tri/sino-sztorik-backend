const NO_LESSON_FOUND_IN_SAME_TIER_ERROR =
  'A jelenlegi körben nincs több feloldható lecke.';

const NO_LESSON_FOUND_IN_NEXT_TIER_ERROR =
  'A következő körben nincs több feloldható lecke.';

const NEXT_LESSON_NOT_FOUND_ERROR = 'A soron következő lecke nem található.';

const ADVANCE_USER_FAILED_ERROR = 'Nem sikerült frissíteni az előrehaladásod.';

const WRONG_CREDENTIALS_ERROR = 'Téves e-mail-cím vagy jelszó.';

const VALIDATION_FAILED_ERROR = 'A megadott adatok érvénytelenek.';

const EMAIL_TAKEN_ERROR =
  'Ez az e-mail-cím már foglalt. Kérjük, regisztrálj másikkal.';

const SIGNUP_FAILED_ERROR =
  'Nem sikerült létrehozni a felhasználói fiókod. Kérjük, próbálkozz később.';

const LOGIN_FAILED_ERROR =
  'Nem sikerült a bejelentkezés. Kérjük, próbálkozz később.';

const USER_QUERY_FAILED_ERROR = 'Nem sikerült lekérni a felhasználót.';

const UNSUPPORTED_ROUTE_ERROR = 'Nem támogatott útvonal.';

const UNKNOWN_ERROR = 'Ismeretlen hiba történt.';

const INVALID_REQUEST_ERROR = 'Érvénytelen kérés.';

const LESSON_NOT_FOUND_ERROR = 'A lecke nem található.';

const LESSON_DATABASE_QUERY_FAILED_ERROR = 'Nem sikerült lekérni a leckéket.';

const DATABASE_QUERY_FAILED_ERROR = 'Nem sikerült lekérni az adatbázist.';

const LESSON_LOCKED = 'Még nincs feloldva';

const LESSON_UPCOMING = 'Soron következő lecke';

const LESSON_COMPLETED = 'Már megtanult lecke';

const LESSON_NOT_IN_TIER = 'Ebben a körben nincs ilyen lecke';

const USER_NOT_FOUND_ERROR = 'A felhasználó nem található.';

const CHARACTER_NOT_FOUND_ERROR = 'A karakter nem található.';

const SAVING_ERROR = 'Hiba történt a mentéskor.';

const SAVING_SUCCESS = 'Sikeres mentés!';

const TIER_OR_LESSON_NOT_NUMBER_ERROR =
  'Érvénytelen értékek megadva. A körnek és a leckének számértéknek kell lenniük.';

const CHARACTER_QUERY_FAILED_ERROR = 'Nem sikerült lekérni a karaktert.';

const SIMILARS_DATABASE_QUERY_FAILED_ERROR =
  'Nem sikerült lekérni a hasonló karaktereket.';

const PHRASES_DATABASE_QUERY_FAILED_ERROR =
  'Nem sikerült lekérni a karaktert tartalmazó kifejezéseket.';

const OTHER_USES_DATABASE_QUERY_FAILED_ERROR =
  'Nem sikerült lekérni a karakter egyéb jelentéseit.';

const CONSTITUENTS_QUERY_FAILED_ERROR =
  'Nem sikerült lekérni a karakter alkotóelemeit.';

const CONSTITUENT_ENTRY_QUERY_FAILED_ERROR =
  'Nem sikerült lekérni a karakter alkotóelemeinek bejegyzéseit.';

const SEARCH_NO_MATCH = 'Nincs a keresésnek megfelelő elem.';

const SEARCH_NO_ELIGIBLE_MATCH =
  'Nincs a keresésnek megfelelő elem, amelyet jogosult lennél megnézni.';

const NOT_ELIGIBLE_TO_SEE_CHARACTER_ERROR = 'Még nem láthatod ezt a karaktert';

const INVALID_NUMBERS_PROVIDED = 'Érvénytelen számértékek megadva.';

const UNAUTHENTICATED_ERROR = 'Nincs jogosultságod.';

const AUTHENTICATION_FAILED_ERROR = 'Hiba történt a hitelesítéskor.';

module.exports = {
  NO_LESSON_FOUND_IN_SAME_TIER_ERROR,
  NO_LESSON_FOUND_IN_NEXT_TIER_ERROR,
  NEXT_LESSON_NOT_FOUND_ERROR,
  ADVANCE_USER_FAILED_ERROR,
  WRONG_CREDENTIALS_ERROR,
  VALIDATION_FAILED_ERROR,
  EMAIL_TAKEN_ERROR,
  SIGNUP_FAILED_ERROR,
  LOGIN_FAILED_ERROR,
  USER_QUERY_FAILED_ERROR,
  UNSUPPORTED_ROUTE_ERROR,
  UNKNOWN_ERROR,
  INVALID_REQUEST_ERROR,
  LESSON_NOT_FOUND_ERROR,
  LESSON_DATABASE_QUERY_FAILED_ERROR,
  LESSON_LOCKED,
  LESSON_COMPLETED,
  LESSON_UPCOMING,
  LESSON_NOT_IN_TIER,
  DATABASE_QUERY_FAILED_ERROR,
  USER_NOT_FOUND_ERROR,
  CHARACTER_NOT_FOUND_ERROR,
  CHARACTER_QUERY_FAILED_ERROR,
  SAVING_ERROR,
  SAVING_SUCCESS,
  TIER_OR_LESSON_NOT_NUMBER_ERROR,
  SEARCH_NO_MATCH,
  NOT_ELIGIBLE_TO_SEE_CHARACTER_ERROR,
  SIMILARS_DATABASE_QUERY_FAILED_ERROR,
  PHRASES_DATABASE_QUERY_FAILED_ERROR,
  OTHER_USES_DATABASE_QUERY_FAILED_ERROR,
  CONSTITUENTS_QUERY_FAILED_ERROR,
  CONSTITUENT_ENTRY_QUERY_FAILED_ERROR,
  SEARCH_NO_ELIGIBLE_MATCH,
  INVALID_NUMBERS_PROVIDED,
  UNAUTHENTICATED_ERROR,
  AUTHENTICATION_FAILED_ERROR,
};
