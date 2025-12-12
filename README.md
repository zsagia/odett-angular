# OdettAngular

## Class1

### Component

Angular Komponensek és Signal-ek
Lépésenkénti Felépítés (90 perces óra)
1. lépés: Mi az a komponens? (10 perc)

Analógia: LEGO kockák → minden komponens egy építőelem
Egy komponens = UI darab + logika
Példa: gombok, kártyák, listák a weboldalon
Cél: Megérteni, hogy miért jobb kisebb darabokból építkezni

2. lépés: Az első komponens létrehozása (15 perc)

ng generate component greeting parancs
Mi jön létre? (4 fájl)
A @Component dekorátor megismerése
Gyakorlat: Saját komponens létrehozása CLI-vel
Cél: Megtapasztalni a komponens alapstruktúráját

3. lépés: Template és interpoláció (10 perc)

HTML template írása
{{ }} - adatok megjelenítése
Property binding: [property]="value"
Gyakorlat: Név és életkor megjelenítése
Cél: Adatok összekapcsolása a template-tel

4. lépés: Event handling - kattintás (10 perc)

(click)="method()" szintaxis
Metódus írása a komponens osztályban
Gyakorlat: Gomb ami számol (count++)
Cél: Interakció megértése
Probléma bevezetése: "Miért nem frissül automatikusan?"

### Signal

5. lépés: Signal bevezetése - reaktivitás (15 perc)

Mi a probléma a sima változókkal?
signal() importálása és létrehozása
Signal olvasása: count() - mint függvény!
Signal írása: count.set() és count.update()
Gyakorlat: Számláló átírása signal-re
Cél: Megérteni, hogy a signal miért "reaktív"

6. lépés: Computed signal - kalkulált értékek (10 perc)

computed() - automatikusan frissülő értékek
Példa: doubled = computed(() => count() * 2)
Gyakorlat: Számláló + duplázott érték megjelenítése
Cél: Látni, hogy a computed automatikusan követi a változásokat

7. lépés: Lista kezelés signal-ekkel (15 perc)

Tömb tárolása signal-ben: items = signal<string[]>([])
update() metódus használata tömbhöz
@for új Angular szintaxis
Gyakorlat: Egyszerű lista hozzáadással
Cél: Signal használata összetettebb adatokkal

8. lépés: Mini projekt - TODO lista (10 perc)

Eddig tanultak kombinálása
Input mező + gomb + lista
Hozzáadás + törlés funkciók
Cél: Összes tanult elem gyakorlása

9. lépés: Összefoglalás és Q&A (5 perc)

Komponens vs Signal - mi mikor?
Házi feladat kiadása
Kérdések megválaszolása

### Házi feladat