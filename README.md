# 🍣 Restauracja Japońska "Jem To Dobre" – System Zarządzania

Kompleksowa aplikacja webowa typu Full-Stack przeznaczona do obsługi zamówień i logistyki w restauracji japońskiej. Projekt składa się z nowoczesnego, responsywnego interfejsu użytkownika zbudowanego w React i TypeScript oraz wielowarstwowego backendu REST API napisanego w technologii .NET (C#).

Aplikacja obsługuje pełen obieg zamówienia: od wyboru dań przez klienta i płatność online, przez realizację w kuchni, aż po dostarczenie posiłku przez kuriera oraz generowanie raportów sprzedażowych.

---

## ✨ Główne funkcjonalności

### 🛍️ Moduł Klienta
* **Interaktywne Menu i Szczegóły Dań:** Przeglądanie dań kuchni japońskiej (m.in. sushi, sashimi, nigiri, udon) ze zdjęciami, opisem i listą składników.
* **Koszyk i Checkout:** Dynamiczny panel koszyka (`CartDrawer`) z przeliczaniem kwoty oraz obsługą procesu składania zamówienia.
* **Płatności Online:** Integracja z bramką płatniczą **PayU** wraz z obsługą webhooków (`WebhooksController`) potwierdzających status transakcji.
* **Konto i Profil Użytkownika:** Rejestracja, logowanie, resetowanie hasła, zarządzanie zapisanymi adresami dostaw oraz podgląd historii zamówień.
* **Personalizacja (i18n & Theme):** Wsparcie dla języka polskiego oraz japońskiego (`pl` / `ja`) oraz przełącznik motywu jasnego/ciemnego (`ThemeToggle`).

### 👨‍🍳 Panel Załogi i Kuchni (`ChefPanel` / `Crew`)
* **Zarządzanie produkcją:** Podgląd spływających zamówień w czasie rzeczywistym, przypisywanie dań do pracowników i zmiana statusów przygotowania.
* **Zarządzanie asortymentem:** Dodawanie oraz edycja dań (`AddDishModal`) i składników z wykorzystaniem mechanizmu bezpiecznego usuwania (*Soft Delete*) oraz śledzenia historii cen (`PriceHistory`).
* **Moduł Raportów (`Reports`):** Zestawienia przychodów (`RevenueSummary`) oraz statystyki najpopularniejszych pozycji w menu (`PopularDish`).

### 🛵 Panel Kuriera (`CourierPanel`)
* **Obsługa dostaw:** Lista zamówień gotowych do odbioru, przypisywanie kursów oraz aktualizacja statusu dostawy i szacowanego czasu doręczenia.

---

## 🛠️ Stos technologiczny

### Frontend (`jem-to-dobre-front`)
* **Biblioteka UI:** React 18 + TypeScript
* **Budowanie projektu:** Vite
* **Stylizowanie:** Tailwind CSS + PostCSS
* **Zarządzanie stanem:** React Context API (`CartContext`)
* **Internacjonalizacja:** i18n (obsługa słowników JSON)

### Backend (`RestaurantAPI`)
* **Framework:** ASP.NET Core Web API (C#)
* **Baza danych i ORM:** Entity Framework Core (podejście Code-First, migracje, SQL Server)
* **Walidacja danych:** dedykowana warstwa walidatorów DTO (`FluentValidation`)
* **Integracje zewnętrzne:** PayU REST API
* **Architektura:** Wzorzec warstwowy (Controllers, Services + Interfaces, Models, DTOs, Validators, Enums)

---

## 👥 Zespół projektowy i podział prac

Projekt został zrealizowany w zespole czteroosobowym:

* **Igor Starnowski** – Główna odpowiedzialność za projekt i implementację interfejsu graficznego (React, TypeScript, Tailwind CSS), tworzenie widoków oraz komponentów aplikacji, a także kompleksowe testowanie endpointów i logiki backendu.
* **Kacper Gamoń** – Główna odpowiedzialność za architekturę i implementację backendu (.NET Web API), projekt bazy danych, migracje Entity Framework Core oraz logikę biznesową po stronie serwera.
* **Kajetan Bednarczyk** – Wsparcie w procesie testowania aplikacji oraz realizacja zleconych zadań programistycznych w warstwie frontendu i backendu.
* **Artur Zabor** – Wsparcie w testach funkcjonalnych systemu oraz implementacja przydzielonych zadań i poprawek po stronie interfejsu oraz API.

---

## 📂 Struktura Repozytorium

* `RestaurantAPI/` — projekt serwerowy C# (kontrolery, serwisy, modele bazodanowe, obiekty DTO, walidatory, migracje oraz zasoby statyczne `wwwroot`).
* `jem-to-dobre-front/` — aplikacja kliencka React + Vite (komponenty, strony, konteksty, konfiguracja API oraz pliki językowe).
* `RestaurantAPI.slnx` — plik rozwiązania projektu dla środowiska Visual Studio.

---

## 🚀 Uruchomienie projektu lokalnie

### Wymagania wstępne
* Zainstalowane środowisko **.NET SDK**
* Zainstalowane środowisko **Node.js** (wersja 18+)
* Serwer bazy danych zgodny z konfiguracją w `appsettings.json` (np. MS SQL Server)

### 1. Uruchomienie Backendu

Przejdź do katalogu z API, skonfiguruj połączenie z bazą danych w pliku `appsettings.json`, nałóż migracje i uruchom serwer:

    cd RestaurantAPI
    dotnet ef database update
    dotnet run

### 2. Uruchomienie Frontendu

Otwórz nowy terminal, przejdź do folderu aplikacji klienckiej, zainstaluj pakiety i uruchom serwer deweloperski Vite:

    cd jem-to-dobre-front
    npm install
    npm run dev
