# ESA (ChitChat) — Handoff Document

## Proje Ozeti

ESA (Encrypted Secure App), React 19 + Supabase uzerine kurulu gercek zamanli bir mesajlasma uygulamasidir. Direkt mesajlasma, grup odalari, dosya paylasimi, WebRTC sesli arama (1:1 ve grup), ses efektleri, kisi yonetimi, admin paneli ve coklu dil destegi (EN/TR) icermektedir.

**Supabase Project ID:** `lvoxbkrucdgjjdtlbvqp`

---

## Teknoloji Yigini

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Frontend | React | 19.2 |
| Build | Vite | 7.3 |
| Stil | Tailwind CSS | 4.2 |
| Routing | React Router | 7.13 |
| Backend | Supabase (Postgres, Realtime, Auth, Storage, Edge Functions) | JS SDK 2.97 |
| Ses Islemleri | Web Audio API + FFT.js | 4.0.4 |
| WebRTC | Native RTCPeerConnection + Cloudflare TURN | - |
| Dil | TypeScript | 5.9 |

---

## Proje Yapisi

```
src/
├── App.tsx                          # Route tanimlari ve provider hiyerarsisi
├── main.tsx                         # React DOM mount
├── index.css                        # Tailwind ve global stiller
├── components/
│   ├── call/
│   │   ├── ActiveCallScreen.tsx     # Aktif arama ekrani (1:1 + grup layout)
│   │   └── IncomingCallModal.tsx    # Gelen arama modali + ses efekti secimi
│   ├── chat/
│   │   ├── ChatHeader.tsx           # Sohbet baslik cubugu
│   │   ├── ChatListItem.tsx         # Sohbet listesi satiri
│   │   ├── MessageBubble.tsx        # Mesaj balonu (metin + dosya + gorsel)
│   │   ├── MessageInput.tsx         # Mesaj girisi + dosya eki
│   │   ├── ReadReceipt.tsx          # Okundu bilgisi (tek/cift tik)
│   │   └── TypingIndicator.tsx      # Yaziyor... gostergesi
│   ├── common/
│   │   ├── Avatar.tsx               # Kullanici avatari (yuvarlak/kare)
│   │   ├── ConfirmDialog.tsx        # Onay diyalogu
│   │   ├── EmptyState.tsx           # Bos durum gosterimi
│   │   └── LoadingSpinner.tsx       # Yukleniyor animasyonu
│   ├── layout/
│   │   ├── AppLayout.tsx            # Ana sayfa layout'u (ChatListPage wrapper)
│   │   └── ProtectedRoute.tsx       # Auth korumali route
│   └── room/
│       └── AddMemberModal.tsx       # Odaya uye ekleme modali
├── contexts/
│   ├── AuthContext.tsx               # Kimlik dogrulama state'i
│   ├── CallContext.tsx               # WebRTC arama state'i (~37KB, en buyuk dosya)
│   ├── LanguageContext.tsx           # Dil secimi (EN/TR)
│   └── PresenceContext.tsx           # Cevrimici durum takibi
├── hooks/
│   ├── useConversations.ts          # Sohbet listesi + realtime abonelik
│   ├── useFileUpload.ts             # Dosya yukleme (Supabase Storage)
│   ├── useMessages.ts              # Mesaj listesi + realtime + sayfalama
│   ├── usePresence.ts              # Kullanici presence durumu
│   └── useTypingIndicator.ts       # Yaziyor gostergesi broadcast
├── lib/
│   ├── i18n.ts                      # Ceviri sozlugu (EN + TR)
│   ├── notificationSound.ts        # Bildirim sesi
│   ├── ringtoneSound.ts            # Zil sesi (AudioContext tabanli)
│   ├── supabase.ts                  # Supabase client baglantisi
│   ├── turnCredentials.ts          # Cloudflare TURN kimlik bilgileri
│   ├── types.ts                     # Veritabani tipleri (Database, RPC, yardimci tipler)
│   └── voiceEffects.ts             # Ses efektleri (pitch shift, ring modulation)
└── pages/
    ├── AdminPage.tsx                # Sistem admin paneli
    ├── ChatListPage.tsx             # Ana sohbet listesi
    ├── ChatViewPage.tsx             # Sohbet goruntuleme + mesajlasma
    ├── LoginPage.tsx                # Giris sayfasi
    ├── NewChatPage.tsx              # Yeni direkt mesaj + kisi yonetimi
    ├── NewRoomPage.tsx              # Yeni grup odasi olusturma
    ├── ProfilePage.tsx              # Profil sayfasi
    ├── RegisterPage.tsx             # Kayit sayfasi
    └── RoomSettingsPage.tsx         # Oda ayarlari (uye yonetimi, isim degistirme)
```

---

## Route Yapisi

| Path | Sayfa | Erisim |
|------|-------|--------|
| `/login` | LoginPage | Herkese acik |
| `/register` | RegisterPage | Herkese acik |
| `/` | ChatListPage (AppLayout icinde) | Korunmali |
| `/chat/:id` | ChatViewPage | Korunmali |
| `/new-chat` | NewChatPage | Korunmali |
| `/new-room` | NewRoomPage | Korunmali |
| `/room/:id/settings` | RoomSettingsPage | Korunmali |
| `/profile` | ProfilePage | Korunmali |
| `/admin` | AdminPage | Korunmali (is_system_admin) |

**Provider hiyerarsisi:** `BrowserRouter > LanguageProvider > AuthProvider > PresenceProvider > CallProvider`

Global overlay'ler (route disinda): `<IncomingCallModal />` ve `<ActiveCallScreen />`

---

## Veritabani Semasi

### Tablolar

| Tablo | Aciklama | Onemli Alanlar |
|-------|----------|----------------|
| `profiles` | Kullanici profilleri | `id`, `email`, `display_name`, `avatar_url`, `is_banned`, `is_system_admin` |
| `conversations` | Sohbetler (direkt + grup) | `id`, `type` ('direct'/'group'), `name`, `avatar_url`, `created_by` |
| `conversation_members` | Sohbet uyelikleri | `conversation_id`, `user_id`, `role` ('member'/'admin'), `left_at` |
| `messages` | Mesajlar | `id`, `conversation_id`, `sender_id`, `content`, `type` ('text'/'file'/'image') |
| `message_read_receipts` | Okundu bilgileri | `message_id`, `user_id`, `read_at` |
| `contacts` | Kisi listesi | `user_id`, `contact_user_id` |
| `call_logs` | Arama kayitlari | `caller_id`, `callee_id`, `status`, `duration_seconds` |
| `app_settings` | Uygulama ayarlari | `key`, `value` (ornegin `registration_password`) |

### RPC Fonksiyonlari

| Fonksiyon | Aciklama |
|-----------|----------|
| `get_user_conversations()` | Kullanicinin tum sohbetlerini detaylariyla dondurur |
| `find_direct_conversation(p_other_user_id)` | Iki kullanici arasindaki mevcut direkt sohbeti bulur |
| `mark_messages_read(p_conversation_id)` | Sohbetteki mesajlari okundu olarak isaretler |
| `add_room_member(p_conversation_id, p_user_id)` | Odaya uye ekler (admin veya sistem admin) |
| `remove_room_member(p_conversation_id, p_user_id)` | Odadan uye cikarir (admin veya sistem admin) |
| `delete_room(p_conversation_id)` | Odayi siler |

### Edge Functions

| Fonksiyon | Aciklama |
|-----------|----------|
| `turn-credentials` | Cloudflare TURN sunucusu kimlik bilgilerini dondurur |

---

## Ozellik Envanteri

1. **Kimlik Dogrulama** — Nickname + sifre ile kayit/giris, sistem sifresi ile kayit dogrulama
2. **Direkt Mesajlasma** — 1:1 sohbet olusturma ve mesajlasma
3. **Grup Odalari** — Coklu kisi sohbet odalari, admin/uye rolleri
4. **Dosya Paylasimi** — Gorsel, belge ve diger dosya tipleri (Supabase Storage)
5. **Okundu Bilgisi** — Tek tik (iletildi) / cift tik (okundu)
6. **Yaziyor Gostergesi** — Realtime broadcast ile yaziyor durumu
7. **Cevrimici Durum** — Presence API ile kullanici durum takibi
8. **WebRTC Sesli Arama** — 1:1 ve grup aramalari, STUN + Cloudflare TURN
9. **Ses Efektleri** — Pitch shift, ring modulation (Web Audio API + AudioWorklet)
10. **Kisi Yonetimi** — Kisi ekleme/cikarma, sadece kisiler arasinda sohbet
11. **Sistem Admin** — Tum kanallari gorme, herhangi odayi yonetme, kullanici admin yetkisi verme/alma
12. **Kullanici Banlama** — Admin panelinden kullanicilari banlama
13. **Coklu Dil** — Turkce ve Ingilizce (LanguageContext)
14. **Profil Yonetimi** — Gorunen ad, avatar yukleme, dil secimi

---

## WebRTC Arama Mimarisi

### Sinyal Akisi

Supabase Realtime Broadcast kanali uzerinden sinyalleme yapilir:

```
Arayan                          Aranan
  |-- call-invite (broadcast) -->|
  |                              |-- accept/reject -->|
  |<-- offer (via session ch) ---|
  |-- answer ------------------>|
  |<-> ICE candidates --------->|
  |<=> WebRTC baglantisi ======>|
```

### ICE Sunuculari

1. Google STUN (`stun:stun.l.google.com:19302`) — her zaman eklenir
2. Cloudflare TURN — `turn-credentials` Edge Function uzerinden JWT ile alinir
3. Fallback: Sadece STUN (katı NAT'larda calismaz)

### Onemli Dosya: `src/contexts/CallContext.tsx`

Bu dosya ~37KB olup projenin en karmasik dosyasidir. Icerir:
- `CallProvider` context'i ve reducer
- `startCall()`, `acceptCall()`, `rejectCall()`, `endCall()`
- `joinSessionChannel1to1()` — 1:1 arama sinyallemesi
- `joinSessionChannelGroup()` — grup arama sinyallemesi
- `createPeerForUser()` — WebRTC peer olusturma (grup icin)
- ICE candidate buffering mekanizmasi
- Ses efekti entegrasyonu (processedStream)

---

## Karsilasilan Problemler ve Cozumleri

### 1. WebRTC Aramalari Farkli Aglar Arasinda Calismiyordu

**Problem:** Arama ayni lokal agda (LAN) calisiyordu ancak internet uzerinden (farkli ag) baglanti kurulamiyordu.

**Kok Neden:** ICE candidate'ler `remoteDescription` set edilmeden once geliyordu. `addIceCandidate()` catch blogu sessizce hata yutuyordu.

**Cozum:** ICE candidate buffering mekanizmasi eklendi:
```typescript
// 1:1 aramalar icin
const pendingCandidates: RTCIceCandidateInit[] = []

function flushPendingCandidates() {
  while (pendingCandidates.length > 0) {
    const c = pendingCandidates.shift()!
    peerConnection.current!.addIceCandidate(new RTCIceCandidate(c))
  }
}

// ice-candidate handler'da:
if (!peerConnection.current.remoteDescription) {
  pendingCandidates.push(payload.candidate)
  return
}
```

### 2. Tek Yonlu Arama Hatasi (Arayan Calisiyor, Aranan Calismiyor)

**Problem:** Bilgisayardan telefonu arama calisiyordu, ama telefondan bilgisayari arama calismiyordu.

**Kok Neden:** Grup aramalarinda, arayan ICE candidate'leri `setLocalDescription` sonrasi hemen gondermeye basliyordu, ancak offer 500ms gecikmeyle gonderiliyordu. Aranan taraf candidate'leri aldığında peer nesnesi henuz olusturulmamisti (`if (!entry) return` ile sessizce atlaniyordu).

**Cozum:** Peer henuz yokken bile ICE candidate'leri tamponlama:
```typescript
// Grup aramalari icin per-peer buffering
const pendingCandidatesMap: Record<string, RTCIceCandidateInit[]> = {}

// ice-candidate handler'da:
if (!entry || !entry.pc.remoteDescription) {
  if (!pendingCandidatesMap[senderId]) pendingCandidatesMap[senderId] = []
  pendingCandidatesMap[senderId].push(payload.candidate)
  return
}
```

### 3. Erken "Bagli" Gosterimi

**Problem:** Arayan tarafta WebRTC baglantisi kurulmadan "baglandi" gosteriliyordu.

**Kok Neden:** `peer-joined` handler'i `PARTICIPANT_CONNECTED` dispatch'ini WebRTC baglantisi kurulmadan yapiyordu.

**Cozum:** Erken dispatch kaldirildi. Sadece `onconnectionstatechange` callback'i `connected` durumunda dispatch yapar.

### 4. 2 Kisilik Odalar Icin Arama Hatasi (isGroup Check)

**Problem:** Arama baslatilamiyor, ses tipi secildikten sonra modal kapanip hicbir sey olmuyordu.

**Kok Neden:** `groupMembers.length > 1` kontrolu, 2 kisilik odalarda (1 diger uye) `false` donuyordu. Bu, odanin 1:1 arama olarak islenmesine yol aciyordu, ancak `remoteUser` null oldugundan arama baslatilamiyordu.

**Cozum:** `groupMembers.length > 1` → `groupMembers.length > 0` olarak degistirildi.

### 5. Kisi Ekleme/Cikarma Sonrasi Liste Guncellenmemesi

**Problem:** NewChatPage'de kisi ekledikten sonra "Tumu" filteri altindaki liste hemen guncellenmiyordu.

**Kok Neden:** State guncellemesi icin ag isteginin tamamlanmasi bekleniyordu.

**Cozum:** Optimistic update eklendi — veritabani isleminden once local state hemen guncelleniyor:
```typescript
async function addContact(userId: string) {
  // Once local state guncelle
  setContacts(prev => [user, ...prev])
  setContactIds(prev => new Set([...prev, userId]))
  // Sonra DB'ye kaydet
  await supabase.from('contacts').insert({...})
}
```

### 6. Foreign Key Constraint Hatalari (Kullanici Silme)

**Problem:** Test kullanicilarini silerken foreign key constraint hatalari aliniyordu.

**Cozum:** Iliskili verileri sirali silme:
```
contacts → call_logs → messages → message_read_receipts →
conversation_members → conversations → profiles → auth.users
```

### 7. AudioContext Uyarisi (Kucuk, Cozulmedi)

**Problem:** Mobilde gelen arama icin zil sesi caldirilirken "AudioContext was not started because of missing user gesture" uyarisi.

**Durum:** Dusuk oncelik, kullanici deneyimini ciddi etkilemiyor. Gelecekte cozulebilir.

---

## Gelistirme Ortami Kurulumu

```bash
# Bagimliliklari yukle
npm install

# Ortam degiskenlerini ayarla (.env dosyasi)
VITE_SUPABASE_URL=https://lvoxbkrucdgjjdtlbvqp.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

# Gelistirme sunucusunu baslat
npm run dev

# Uretim derlemesi
npm run build
```

---

## Auth Modeli

- Kullanicilar `nickname@esa.io` formatiyla email olusturularak Supabase Auth'a kaydedilir
- Kayit icin `app_settings` tablosundaki `registration_password` anahtarinin degeri gerekir
- `profiles.is_banned` true ise giris engellenir
- `profiles.is_system_admin` true ise admin paneline erisim saglanir
- TURN credentials icin JWT aktif olarak yenilenir (`getUser()` ile server-side refresh)

---

## Son Commitler

```
78dbbfb Fix group call ICE candidates dropped when peer not yet created
4556cb0 Add button to navigate to new chat page in ChatListPage
dc7a992 Add logging for WebRTC connection and ICE state changes
53b9623 Refactor CallContext to improve ICE candidate handling
2ebf381 Add favicon and logo assets, update HTML
c133cb9 Fix group member check in CallContext
3b4d6e5 Implement optimistic updates for contacts
1a960c6 Add contacts management and refactor NewRoomPage
56fee78 Implement user ban functionality
41c198e Enhance conversation updates with DELETE support
```

---

## Bilinen Sinirlamalar

1. **AudioContext uyarisi** — Mobilde gelen arama zil sesinde user gesture eksik uyarisi
2. **Sadece STUN fallback** — TURN credentials alinamazsa katı NAT'larda arama calismaz
3. **Dosya boyutu limiti** — Supabase Storage varsayilan limitlerine bagli
4. **Tek cihaz oturumu** — Ayni anda birden fazla cihazda presence sorunlari olabilir
