CookiePopupBlocker
==================

Skrypt znajduje i blokuje wyskakujące okienka/banery z informacjami o używaniu ciasteczek.

Na Firefoksie potrzebujesz rozszerzenia [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)/[Scriptish](https://addons.mozilla.org/firefox/addon/scriptish/) [](https://docs.google.com/spreadsheet/ccc?key=0AgtalLhlHdWqdEljOTBWa2JhMmF2ei1ZZWxmVU5IZFE&usp=sharing).
Na Chrome [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) (albo zapisz plik skryptu i przeciągnij go do ustawień rozszerzeń). Więcej nie testowałem.

#### [<div align="center">Zainstaluj</div>](http://goo.gl/FMexU) ####


### Testy ###
Ze 100 najpopularniejszych w Polsce stron ([wg ALEXA](http://e-spec.pl/najpoularniejsze-polskie-strony-www)):

 - 1 strona z komunikatem, który nie został zablokowany,
 - 0 stron z "false positive",
 - 48 strony mają blokowany baner,
 - 49 stron nie wyświetla żadnego komunikatu o ciasteczkach (większość na niepolskich serwerach),

Łącznie na ok. 185 komunikatów jest 10 nieblokowanych (co by dawało ok. 95% skuteczności)

[Lista wszystkich stron z problem blokowania](https://github.com/piotrex/CookiePopupBlocker/blob/master/tests.md)

### Historia wersji ###

**1.3.0**:<br>

- od teraz domyślnie przeszukiwane są wszystkie strony a nie zakończone na ".pl" (ale blokowanie tylko polskich komunikatów)
- wyłączenie blokowania na stronach piszących o ciasteczkach ze względu na blokowanie na nich tekstów, które nie są komunikatami (np. http://jak-zablokowac-cookies.pl/, http://www.komputerswiat.pl/blogi/blog-redakcyjny/2013/03/uwaga!-rozdajemy-ciasteczka.aspx)
- większa wykrywalność, mniej "false positve'ów" - m.in. linkedin.com

**1.2.2**:<br>

- naprawiono problem z czekaniem na usunięcie komunikatu

**1.2**:<br>

- poprawiono szybkość przeszukiwania stron
 

### Podobne projekty ###
- [https://github.com/r4vi/block-the-eu-cookie-shit-list](https://github.com/r4vi/block-the-eu-cookie-shit-list)
- [http://lubieciasteczka.net/](http://lubieciasteczka.net/)


