CookiePopupBlocker
==================

Skrypt do Greasemonkey(*) blokujący wyskakujące okienka/banery z informacjami o używaniu ciasteczek.

[](https://docs.google.com/spreadsheet/ccc?key=0AgtalLhlHdWqdEljOTBWa2JhMmF2ei1ZZWxmVU5IZFE&usp=sharing)

#### [Zainstaluj](https://github.com/piotrex/CookiePopupBlocker/raw/master/build/cookiepopupblocker-no_logs.user.js) ####

Domyślnie jest skonfigurowany tak, aby działał tylko na stronach zakończonych końcówką .pl (żeby nie wprowadzać opóźnień na niepolskich stronach). 

(*) - jedynie na Greasemonkey były robione testy, choć powinno wszystko działać na innych menedżerach skryptów/przeglądarkach

### Testy ###
Ze 100 najpopularniejszych w Polsce stron ([wg ALEXA](http://e-spec.pl/najpoularniejsze-polskie-strony-www)):

 - 1 strona z komunikatem, który nie został zablokowany,
 - 0 stron z "false positive",
 - 48 strony mają blokowany baner,
 - 49 stron nie wyświetla żadnego komunikatu o ciasteczkach (większość na niepolskich serwerach),

Łącznie na ok. 180 komunikatów 92% zablokowane, 2 "false positive" (jak-zablokowac-cookies.pl oraz linkedin.com)

[Lista wszystkich stron z problem blokowania](https://github.com/piotrex/CookiePopupBlocker/blob/master/tests.md)

### Problemy ###
Niestety czasem potrzeba odczekać parę sekund aż komunikat będzie zablokowany.

### Podobne projekty ###
- [https://github.com/r4vi/block-the-eu-cookie-shit-list](https://github.com/r4vi/block-the-eu-cookie-shit-list)
- [http://lubieciasteczka.net/](http://lubieciasteczka.net/)


