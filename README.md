# KodzenIdiaa - AI Destekli Iddaa Tahmin Platformu

Yapay zeka ve istatistiksel modeller kullanarak mac sonucu, toplam gol, karsilikli gol ve diger kriterleri yuksek isabetle tahmin eden canli iddaa tahmin uygulamasi.

## Ozellikler

- **AI Tahmin Motoru**: Poisson dagilimi, ELO rating, form analizi ve oran entegrasyonu ile guclü tahminler
- **Canli Mac Takibi**: 30 saniye araliklarla otomatik guncellenen canli mac skorlari
- **Detayli Analiz**: Mac sonucu (1X2), toplam gol (ust/alt), KG (var/yok), cifte sans, skor tahmini, ilk yari sonucu
- **Takim Istatistikleri**: Genis gecmis mac veritabani, form grafigi, ev/deplasman performansi
- **Oran Karsilastirma**: Bahis oranlari ile AI tahminlerinin birlesmis analizi
- **Performans Istatistikleri**: Gunluk, haftalik, lig ve pazar bazli isabet oranlari

## Teknolojiler

- **Next.js 16** - React framework
- **TypeScript** - Tip guvenligi
- **Tailwind CSS 4** - Modern stil
- **Recharts** - Grafik ve istatistik gorsellestirme
- **Zustand** - State yonetimi
- **Lucide React** - Ikon sistemi

## Kurulum

```bash
npm install
npm run dev
```

Tarayicida [http://localhost:3000](http://localhost:3000) adresini acin.

## Canli Veri Entegrasyonu

Canli mac verileri icin [API-Football](https://www.api-football.com/) API anahtari gereklidir:

```bash
# .env.local dosyasina ekleyin
FOOTBALL_API_KEY=your_api_key_here
```

API anahtari olmadan uygulama demo verilerle calisir.

## AI Tahmin Motoru

Tahmin motoru birden fazla istatistiksel modeli birlestirir:

1. **Poisson Modeli**: Takim saldiri/savunma gucu uzerinden beklenen gol hesabi
2. **Form Analizi**: Son 5 mac performansina agirlikli puan
3. **Karsilasma Gecmisi**: H2H istatistikler
4. **Oran Entegrasyonu**: Bahis oranlarindaki olasilik bilgisi
5. **Kompozit Skor**: Tum modellerin agirlikli birlesimi

## Yapisal Dizin

```
src/
├── app/             # Next.js App Router sayfalari
│   ├── api/         # Backend API route'lari
│   ├── canli/       # Canli maclar sayfasi
│   ├── tahminler/   # Tahminler listesi
│   ├── mac/[id]/    # Mac detay ve tahmin
│   └── istatistikler/  # Performans istatistikleri
├── components/      # React bilesenler
└── lib/             # Yardimci kutuphaneler
    ├── prediction-engine.ts  # AI tahmin motoru
    ├── football-api.ts       # API istemcisi
    ├── types.ts              # TypeScript tipleri
    ├── store.ts              # Zustand store
    └── utils.ts              # Yardimci fonksiyonlar
```

## Uyari

Bu uygulama bilgi amaclidir. Yatirim tavsiyesi degildir. Sorumlu oynayin.
