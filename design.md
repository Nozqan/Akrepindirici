# Akrepindirici (TİT🦂) - Mobil Uygulama Tasarım Planı

## Genel Bakış

**Akrepindirici**, Twitter, TikTok ve Instagram'dan video indirme özelliğine sahip, biyometrik güvenlikli ve dinamik temalı bir mobil uygulamadır. Uygulama, "Ücretsiz ve Reklamsız Video İndirme" misyonuyla Nebi Özkan tarafından geliştirilmiştir.

---

## Ekran Listesi

1. **Splash/Giriş Ekranı** - Uygulama başlangıcında gösterilen ekran
2. **Biyometrik Kilit Ekranı** - Parmak izi/yüz tanıma doğrulaması
3. **Ana Sayfa (Home)** - Twitter video indirme, otomatik clipboard dinleme
4. **TikTok İndirme Ekranı** - TikTok linklerinden video indirme, filigran temizleme
5. **Instagram İndirme Ekranı** - Instagram linklerinden video indirme, filigran temizleme
6. **İndirilenler Galerisi** - Grid görünümde indirilen videolar, platform bazlı sekmeler
7. **Ayarlar Paneli** - Tema seçimi, biyometrik ayarları, kurucu bilgisi
8. **Kalite Seçim Modal** - Twitter için 360p-1080p arası kalite seçimi
9. **Detay Ekranı** - İndirilen videonun detayları, paylaşım seçenekleri

---

## Tasarım Özellikleri

### Renk Paleti (5 Tema)

1. **Siyah İnci (Jet Black)** - Koyu siyah arka plan, metalik gümüş aksentler
2. **Gece Mavisi (Midnight Blue)** - Koyu mavi arka plan, açık mavi aksentler
3. **Zümrüt (Emerald)** - Koyu yeşil arka plan, açık yeşil aksentler
4. **Yakut (Ruby)** - Koyu kırmızı arka plan, açık kırmızı aksentler
5. **Nebi Özkan Özel** - Özel gradient, altın ve turuncu tonları

### Birincil Renk (Accent)
- **Turuncu (#FF8C00)** - Tüm butonlar, toggle'lar, vurgular

### Arka Plan
- **Koyu Tema (Varsayılan)** - Siyah/koyu gri arka plan
- **Açık Tema** - Beyaz arka plan (isteğe bağlı)

### Tipografi
- **Başlık:** Bold, 24-28px
- **Alt Başlık:** Semibold, 16-18px
- **Gövde Metni:** Regular, 14-16px
- **Küçük Metin:** Regular, 12-14px

---

## Birincil İçerik ve İşlevsellik

### 1. Ana Sayfa (Home - Twitter)
- **Başlık:** "TWITTER VİDEO İNDİRME"
- **Açıklama:** Otomatik clipboard dinleme, gerçek zamanlı link doğrulaması
- **Giriş Alanı:** URL input veya clipboard'tan otomatik yapıştırma
- **Buton:** "İNDİR" (turuncu, aktif/pasif durumları)
- **Durum Göstergesi:** İndirme durumu, hız, kalan zaman
- **Kalite Seçimi:** 360p, 480p, 720p, 1080p seçenekleri

### 2. TikTok İndirme Ekranı
- **Başlık:** "TIKTOK VİDEO İNDİRME"
- **Açıklama:** Filigran temizleme, otomatik indirme
- **Giriş Alanı:** URL input
- **Buton:** "İNDİR" (turuncu)
- **Özellikler:** Otomatik filigran kaldırma, metadata temizleme
- **Durum:** İndirme ilerlemesi, hata mesajları

### 3. Instagram İndirme Ekranı
- **Başlık:** "INSTAGRAM VİDEO İNDİRME"
- **Açıklama:** Filigran temizleme, otomatik indirme
- **Giriş Alanı:** URL input
- **Buton:** "İNDİR" (turuncu)
- **Özellikler:** Otomatik filigran kaldırma, metadata temizleme
- **Durum:** İndirme ilerlemesi, hata mesajları

### 4. İndirilenler Galerisi
- **Sekmeler:** Twitter | TikTok | Instagram
- **Görünüm:** 2-3 sütunlu grid
- **Her Hücre:** Video thumbnail, indirme tarihi, boyut
- **Etkileşim:** Tap → Detay ekranı, Long-press → Paylaş/Sil menüsü
- **Boş Durum:** "Henüz video indirilmedi" mesajı

### 5. Ayarlar Paneli
- **Kurucu Bilgisi:**
  - "KURUCU: Nebi Özkan"
  - "UYGULAMA AMACI: Ücretsiz ve Reklamsız Video İndirme"
  - Sürüm: v2.2.50zkan
  - © 2026 Nebi Özkan

- **Güvenlik ve Erişim:**
  - "Parmak İzi Kilidi" - Toggle switch (turuncu)
  - "Karanlık Mod (AMOLED)" - Toggle switch (turuncu)
  - "2K Arka Plan Resimleri" - Toggle switch (turuncu)

- **Kişiselleştirme:**
  - "Tema Seçimi" - 5 tema kartı (Siyah İnci, Gece Mavisi, Zümrüt, Yakut, Nebi Özel)
  - Her tema kartı tıklanabilir, seçili tema vurgulanmış

---

## Anahtar Kullanıcı Akışları

### Akış 1: Twitter Video İndirme
1. Kullanıcı uygulamayı açar
2. Biyometrik doğrulama (parmak izi)
3. Ana sayfa yüklenir
4. Kullanıcı Twitter linkini kopyalar
5. Uygulama otomatik olarak clipboard'u dinler ve linki yapıştırır
6. Kalite seçim modal açılır (360p-1080p)
7. Kullanıcı kaliteyi seçer
8. "İNDİR" butonuna basar
9. İndirme başlar, ilerleme gösterilir
10. İndirme tamamlanır, galeriye kaydedilir
11. Başarı mesajı gösterilir

### Akış 2: TikTok/Instagram Video İndirme (Filigran Temizleme)
1. Kullanıcı TikTok/Instagram sekmesine geçer
2. Linki URL input alanına yapıştırır
3. "İNDİR" butonuna basar
4. Sistem otomatik olarak filigran kaldırır
5. Metadata temizlenir (kullanıcı adı, marka vb.)
6. İndirme başlar
7. İndirme tamamlanır, galeriye kaydedilir

### Akış 3: Tema Değiştirme
1. Kullanıcı Ayarlar sekmesine gider
2. "Tema Seçimi" bölümünü açar
3. 5 tema kartından birini seçer
4. Tema anında değişir (tüm UI güncellenmiş renklere dönüşür)
5. Seçim kaydedilir (AsyncStorage)

### Akış 4: Biyometrik Kilit Ayarı
1. Kullanıcı Ayarlar sekmesine gider
2. "Parmak İzi Kilidi" toggle'ını açar
3. Parmak izi sensörü etkinleştirilir
4. Sonraki açılışta biyometrik doğrulama gerekli olur

### Akış 5: İndirilen Videoyu Görüntüleme
1. Kullanıcı İndirilenler sekmesine gider
2. Video thumbnail'ine basar
3. Detay ekranı açılır (video bilgisi, boyut, tarih)
4. Paylaş/Sil seçenekleri mevcuttur

---

## Animasyonlar ve Mikro-Etkileşimler

- **Buton Basma:** Scale 0.97, haptic feedback (Light)
- **Toggle Aç/Kapat:** Smooth slide animation, haptic feedback (Medium)
- **Tema Değişimi:** Fade transition (250ms)
- **İndirme İlerleme:** Smooth progress bar animation
- **Modal Açılış:** Slide up animation (200ms)
- **Tab Geçişi:** Fade animation (150ms)
- **Lottie Animasyonları:** İndirme durumu, başarı/hata göstergeleri

---

## Teknik Mimarisi

### Katmanlar

1. **Biyometrik Güvenlik Modülü**
   - Parmak izi/yüz tanıma (expo-local-authentication)
   - Şifreli oturum yönetimi (AsyncStorage + Crypto)

2. **Dinamik Tema Motoru**
   - 5 tema paleti (Context API)
   - Global tema switch (Dark/Light)
   - Runtime renk güncellemeleri

3. **Video İndirme Motoru**
   - Clipboard dinleme (expo-clipboard)
   - Link doğrulama ve parsing
   - Kalite seçimi ve stream çözme
   - Async indirme pipeline

4. **Filigran Temizleme (TikTok/Instagram)**
   - Watermark detection algoritması
   - Metadata stripping
   - Full-HD otomatik indirme

5. **Veri Tabanı ve Geçmiş**
   - AsyncStorage (indirme geçmişi, ayarlar)
   - İndirilen video metadata'sı
   - Platform bazlı sekme yönetimi

6. **Ayarlar Paneli**
   - Kurucu branding (Nebi Özkan)
   - Biyometrik toggle
   - Tema seçim menüsü
   - Misyon bilgisi

7. **Animasyon Katmanı**
   - Lottie (react-native-lottie)
   - Reanimated 4.x (smooth transitions)
   - Haptics (expo-haptics)

---

## Tasarım Kısıtlamaları

- **Orientasyon:** Portrait (9:16)
- **Tek El Kullanımı:** Butonlar alt kısımda, başlıklar üst kısımda
- **Güvenlik:** Ekran görüntüsü/kayıt engelleme (secure flags)
- **Performans:** Bellek dostu garbage collection
- **Platform:** iOS + Android (Web desteklenmez)

---

## Başarı Metrikleri

- ✅ Tüm video indirme akışları çalışıyor
- ✅ Biyometrik kilit etkin
- ✅ 5 tema sorunsuz geçişi
- ✅ İndirilenler galerisi doğru şekilde gösteriliyor
- ✅ Filigran temizleme işlev görmüş
- ✅ Clipboard dinleme otomatik çalışıyor
- ✅ Ayarlar kaydediliyor ve kalıcı

---

## Referans Fotoğrafları

- **Ayarlar Ekranı:** Premium Ayarlar paneli (Nebi Özkan branding, tema seçimi, güvenlik ayarları)
- **Scorpion Branding:** Ateş saçan akrep (Akrepindirici logo)
- **Soundwave Icon:** Altın çerçeveli Akrepindirici amblemi

