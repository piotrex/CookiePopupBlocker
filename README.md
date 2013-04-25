CookiePopupBlocker
==================

Skrypt znajduje i blokuje wyskakujące okienka/banery z informacjami o używaniu ciasteczek.

[](https://docs.google.com/spreadsheet/ccc?key=0AgtalLhlHdWqdEljOTBWa2JhMmF2ei1ZZWxmVU5IZFE&usp=sharing)

Na Firefoksie potrzebujesz rozszerzenia [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)/[Scriptish](https://addons.mozilla.org/firefox/addon/scriptish/), na Chrome [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) (albo zapisz plik skryptu klikając na "Zainstaluj" i przeciągnij go do ustawień rozszerzeń). Więcej nie testowałem.

#### [<div align="center">Zainstaluj</div>](http://goo.gl/FMexU) ####


### Testy ###

Jak do tej pory na ok. 185 komunikatów miałem 19 nieblokowanych.

[Lista znanych stron z problem blokowania](https://github.com/piotrex/CookiePopupBlocker/blob/master/tests.md)

### Historia wersji ###

**1.4.0**:<br>

- Wprowadzenie "cache'owania" blokowanych komunikatów - czyli przy pierwszym odwiedzeniu strony jest ona parsowana w poszukiwaniu komunikatu i zapamiętywany jest jego identyfikator i potem przy ponownym wejściu na daną stronę nie parsuje ponownie tylko blokuje po identyfikatorze (ściślej: po id/class).

**1.3.0**:<br>

- od teraz domyślnie przeszukiwane są wszystkie strony, a nie tylko te zakończone na ".pl" (ale blokowanie tylko polskich komunikatów)
- wyłączenie blokowania na stronach piszących o ciasteczkach ze względu na blokowanie na nich tekstów, które nie są komunikatami (np. http://jak-zablokowac-cookies.pl/, http://www.komputerswiat.pl/blogi/blog-redakcyjny/2013/03/uwaga!-rozdajemy-ciasteczka.aspx)
- większa wykrywalność, mniej "false positve'ów" - np. linkedin.com

**1.2.2**:<br>

- naprawiono problem z czekaniem na usunięcie komunikatu

**1.2**:<br>

- poprawiono szybkość przeszukiwania stron
 

### Podobne projekty ###
- [https://github.com/r4vi/block-the-eu-cookie-shit-list](https://github.com/r4vi/block-the-eu-cookie-shit-list)
- [http://lubieciasteczka.net/](http://lubieciasteczka.net/)


