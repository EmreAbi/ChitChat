export type Lang = 'en' | 'tr'

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Login
    'login.title': 'ESA',
    'login.subtitle': 'Encrypted Secure App',
    'login.nickname': 'NICKNAME',
    'login.nicknamePlaceholder': 'Enter your nickname',
    'login.password': 'PASSWORD',
    'login.passwordPlaceholder': 'Enter your password',
    'login.submit': 'Sign In',
    'login.submitting': 'Signing in...',
    'login.noAccount': "Don't have an account?",
    'login.signUp': 'Sign Up',

    // Register
    'register.title': 'Provision User',
    'register.subtitle': 'Enterprise access onboarding',
    'register.nickname': 'NICKNAME',
    'register.nicknamePlaceholder': 'e.g.: shadow_fox',
    'register.nicknameHint': '3-20 characters, letters, numbers and _ allowed',
    'register.password': 'PASSWORD',
    'register.passwordPlaceholder': 'Min 6 chars, upper/lower case + special char',
    'register.systemPassword': 'SYSTEM PASSWORD',
    'register.systemPasswordPlaceholder': 'Registration password',
    'register.submit': 'Sign Up',
    'register.submitting': 'Creating account...',
    'register.hasAccount': 'Already have an account?',
    'register.signIn': 'Sign In',
    'register.nicknameLength': 'Nickname must be 3-20 characters',
    'register.nicknameChars': 'Nickname can only contain letters, numbers and _',
    'register.passwordLength': 'Password must be at least 6 characters',
    'register.passwordLower': 'Password must contain at least one lowercase letter',
    'register.passwordUpper': 'Password must contain at least one uppercase letter',
    'register.passwordSpecial': 'Password must contain at least one special character',
    'register.systemError': 'System error, please try again',
    'register.wrongSystemPassword': 'Wrong system password',

    // Profile
    'profile.title': 'Profile',
    'profile.displayName': 'DISPLAY NAME',
    'profile.saving': 'Saving...',
    'profile.saved': 'Saved!',
    'profile.saveChanges': 'Save Changes',
    'profile.signOut': 'Sign Out',
    'profile.language': 'LANGUAGE',
    'profile.changeAvatar': 'Change Avatar',
    'profile.uploadingAvatar': 'Uploading...',

    // Chat List
    'chatList.title': 'ESA Node',
    'chatList.unread': 'unread',
    'chatList.allClear': 'all clear',
    'chatList.newGroup': 'New room',
    'chatList.newGroupAria': 'Create new room',
    'chatList.menu': 'Menu',
    'chatList.profile': 'Profile',
    'chatList.signOut': 'Sign Out',
    'chatList.searchPlaceholder': 'Search secure channels',
    'chatList.filterAll': 'All',
    'chatList.filterUnread': 'Unread',
    'chatList.filterGroups': 'Rooms',
    'chatList.emptyTitle': 'No chats yet',
    'chatList.emptyDescription': 'Start a new chat using the button below.',
    'chatList.newChatAria': 'Start new chat',

    // Chat View
    'chat.today': 'Today',
    'chat.yesterday': 'Yesterday',
    'chat.group': 'Room',
    'chat.secureChat': 'Secure Chat',
    'chat.online': 'online',
    'chat.scrollDown': 'Scroll to bottom',

    // New Chat
    'newChat.title': 'Direct Channel',
    'newChat.contacts': 'contacts',
    'newChat.searchPlaceholder': 'Search contacts...',
    'newChat.noResults': 'No contacts found',

    // New Room
    'newGroup.title': 'Room Channel',
    'newGroup.configureMembers': 'configure members',
    'newGroup.selectMembers': 'select members',
    'newGroup.selectedCount': '{count} selected',
    'newGroup.roomNameLabel': 'Room Name',
    'newGroup.groupNamePlaceholder': 'Room name',
    'newGroup.nameHint': 'Give your room a clear, recognizable name.',
    'newGroup.nameRequired': 'Room name is required.',
    'newGroup.minMembersHint': 'Select at least one member to continue.',
    'newGroup.readyHint': 'Ready to create room with {count} members.',
    'newGroup.members': 'Members:',
    'newGroup.emptySelection': 'No members selected yet.',
    'newGroup.creating': 'Creating...',
    'newGroup.create': 'Create Room',
    'newGroup.createWithCount': 'Create Room ({count})',
    'newGroup.searchPlaceholder': 'Search people...',
    'newGroup.noResults': 'No people found',
    'newGroup.next': 'Next',
    'newGroup.selected': 'selected',
    'newGroup.errorCreate': 'Room could not be created. Please try again.',

    // Room Settings
    'roomSettings.title': 'Room Settings',
    'roomSettings.changeAvatar': 'Change Avatar',
    'roomSettings.uploadingAvatar': 'Uploading...',
    'roomSettings.roomName': 'ROOM NAME',
    'roomSettings.members': 'MEMBERS',
    'roomSettings.memberCount': '{count} members',
    'roomSettings.addMember': 'Add Member',
    'roomSettings.removeMember': 'Remove',
    'roomSettings.leaveRoom': 'Leave Room',
    'roomSettings.admin': 'Admin',
    'roomSettings.member': 'Member',
    'roomSettings.lastAdminWarning': 'You are the last admin and cannot leave the room.',
    'roomSettings.saveName': 'Save',
    'roomSettings.saving': 'Saving...',
    'roomSettings.deleteRoom': 'Delete Room',
    'roomSettings.deleting': 'Deleting...',

    // Add Member
    'addMember.title': 'Add Member',
    'addMember.searchPlaceholder': 'Search people...',
    'addMember.noResults': 'No users found',
    'addMember.adding': 'Adding...',

    // Confirm Dialog
    'confirm.removeMember': 'Remove Member',
    'confirm.removeMemberMessage': 'Are you sure you want to remove {name} from this room?',
    'confirm.leaveRoom': 'Leave Room',
    'confirm.leaveRoomMessage': 'Are you sure you want to leave this room?',
    'confirm.deleteRoom': 'Delete Room',
    'confirm.deleteRoomMessage': 'Are you sure you want to delete this room? All messages and members will be permanently removed. This action cannot be undone.',
    'confirm.confirm': 'Confirm',
    'confirm.cancel': 'Cancel',

    // System Messages
    'system.memberAdded': '{name} was added to the room',
    'system.memberRemoved': '{name} was removed from the room',
    'system.memberLeft': '{name} left the room',
    'system.roomCreated': 'Room created with {names}',

    // Chat Header
    'chatHeader.backAria': 'Back to chat list',
    'chatHeader.secureChannel': 'secure channel',
    'chatHeader.callTitle': 'Voice call',
    'chatHeader.callAria': 'Start voice call',

    // Message Input
    'messageInput.attachAria': 'Attach file',
    'messageInput.placeholder': 'Write encrypted message...',
    'messageInput.textareaAria': 'Message',
    'messageInput.sendAria': 'Send message',

    // Chat List Item
    'chatListItem.yesterday': 'Yesterday',
    'chatListItem.group': 'Room',
    'chatListItem.unknown': 'Unknown',
    'chatListItem.photo': 'Photo',
    'chatListItem.file': 'File',
    'chatListItem.noMessages': 'No messages yet',

    // Incoming Call
    'call.incoming': 'Incoming voice call...',
    'call.rejectAria': 'Reject call',
    'call.acceptAria': 'Accept call',

    // Active Call
    'call.ringing': 'Ringing...',
    'call.connecting': 'Connecting...',
    'call.unmute': 'Unmute microphone',
    'call.mute': 'Mute microphone',
    'call.endAria': 'End call',
    'call.speakerOff': 'Turn off speaker',
    'call.speakerOn': 'Turn on speaker',

    // Group Call
    'call.groupIncoming': 'Group call from {name}...',
    'call.participantCount': '{count} participants',
    'call.joining': 'Joining...',

    // Call End Reasons
    'call.ended': 'Call ended',
    'call.rejected': 'Call declined',
    'call.busy': 'User is busy',
    'call.noAnswer': 'No answer',
    'call.failed': 'Call failed',

    // Voice Effects
    'profile.voiceEffect': 'VOICE EFFECT',
    'voiceEffect.normal': 'Normal',
    'voiceEffect.disguise': 'Disguise',
    'voiceEffect.shadow': 'Shadow',
    'voiceEffect.phantom': 'Phantom',
    'voiceEffect.cyber': 'Cyber',
    'voiceEffect.selectTitle': 'Conversation Filter',
    'voiceEffect.call': 'Call',

    // Admin Panel
    'admin.title': 'Admin Panel',
    'admin.systemAdmin': 'System Admin',
    'admin.users': 'Users',
    'admin.searchPlaceholder': 'Search users...',
    'admin.grantAdmin': 'Grant Admin',
    'admin.revokeAdmin': 'Revoke Admin',
    'admin.noUsers': 'No users found',
    'admin.adminPanel': 'Admin Panel',

    // App Layout
    'layout.emptyTitle': 'ESA Internal Grid',
    'layout.emptyDescription': 'Select a channel from the left or start a new conversation for secure corporate messaging.',
  },
  tr: {
    // Login
    'login.title': 'ESA',
    'login.subtitle': 'Encrypted Secure App',
    'login.nickname': 'NICKNAME',
    'login.nicknamePlaceholder': "Nickname'ini gir",
    'login.password': 'PASSWORD',
    'login.passwordPlaceholder': 'Sifreni gir',
    'login.submit': 'Giris Yap',
    'login.submitting': 'Giris yapiliyor...',
    'login.noAccount': 'Hesabin yok mu?',
    'login.signUp': 'Kayit Ol',

    // Register
    'register.title': 'Provision User',
    'register.subtitle': 'Enterprise access onboarding',
    'register.nickname': 'NICKNAME',
    'register.nicknamePlaceholder': 'ornek: shadow_fox',
    'register.nicknameHint': '3-20 karakter, harf, rakam ve _ kullanilabilir',
    'register.password': 'PASSWORD',
    'register.passwordPlaceholder': 'En az 6 karakter, buyuk/kucuk harf + ozel karakter',
    'register.systemPassword': 'SYSTEM PASSWORD',
    'register.systemPasswordPlaceholder': 'Kayit sifresi',
    'register.submit': 'Kayit Ol',
    'register.submitting': 'Hesap olusturuluyor...',
    'register.hasAccount': 'Zaten hesabin var mi?',
    'register.signIn': 'Giris Yap',
    'register.nicknameLength': 'Nickname 3-20 karakter olmali',
    'register.nicknameChars': 'Nickname sadece harf, rakam ve _ icermeli',
    'register.passwordLength': 'Sifre en az 6 karakter olmali',
    'register.passwordLower': 'Sifre en az bir kucuk harf icermeli',
    'register.passwordUpper': 'Sifre en az bir buyuk harf icermeli',
    'register.passwordSpecial': 'Sifre en az bir ozel karakter icermeli',
    'register.systemError': 'Sistem hatasi, tekrar deneyin',
    'register.wrongSystemPassword': 'Yanlis sistem sifresi',

    // Profile
    'profile.title': 'Profil',
    'profile.displayName': 'DISPLAY NAME',
    'profile.saving': 'Kaydediliyor...',
    'profile.saved': 'Kaydedildi!',
    'profile.saveChanges': 'Degisiklikleri Kaydet',
    'profile.signOut': 'Cikis Yap',
    'profile.language': 'DIL',
    'profile.changeAvatar': 'Avatar Degistir',
    'profile.uploadingAvatar': 'Yukleniyor...',

    // Chat List
    'chatList.title': 'ESA Node',
    'chatList.unread': 'okunmamis',
    'chatList.allClear': 'hepsi okundu',
    'chatList.newGroup': 'Yeni oda',
    'chatList.newGroupAria': 'Yeni oda olustur',
    'chatList.menu': 'Menu',
    'chatList.profile': 'Profil',
    'chatList.signOut': 'Cikis Yap',
    'chatList.searchPlaceholder': 'Guvenli kanallarda ara',
    'chatList.filterAll': 'Tumu',
    'chatList.filterUnread': 'Okunmamis',
    'chatList.filterGroups': 'Odalar',
    'chatList.emptyTitle': 'Henuz sohbet yok',
    'chatList.emptyDescription': 'Asagidaki butondan yeni bir sohbet baslatabilirsin.',
    'chatList.newChatAria': 'Yeni sohbet baslat',

    // Chat View
    'chat.today': 'Bugun',
    'chat.yesterday': 'Dun',
    'chat.group': 'Oda',
    'chat.secureChat': 'Guvenli Sohbet',
    'chat.online': 'cevrimici',
    'chat.scrollDown': 'En alta git',

    // New Chat
    'newChat.title': 'Direkt Kanal',
    'newChat.contacts': 'kisi',
    'newChat.searchPlaceholder': 'Kisi ara...',
    'newChat.noResults': 'Kisi bulunamadi',

    // New Room
    'newGroup.title': 'Oda Kanali',
    'newGroup.configureMembers': 'uyeleri yapilandir',
    'newGroup.selectMembers': 'uyeleri sec',
    'newGroup.selectedCount': '{count} secili',
    'newGroup.roomNameLabel': 'Oda Adi',
    'newGroup.groupNamePlaceholder': 'Oda adi',
    'newGroup.nameHint': 'Odayi kolay bulunacak acik bir isimle adlandirin.',
    'newGroup.nameRequired': 'Oda adi zorunludur.',
    'newGroup.minMembersHint': 'Devam etmek icin en az bir uye secin.',
    'newGroup.readyHint': '{count} uye ile oda olusturmaya hazir.',
    'newGroup.members': 'Uyeler:',
    'newGroup.emptySelection': 'Henuz uye secilmedi.',
    'newGroup.creating': 'Olusturuluyor...',
    'newGroup.create': 'Oda Olustur',
    'newGroup.createWithCount': 'Oda Olustur ({count})',
    'newGroup.searchPlaceholder': 'Kisi ara...',
    'newGroup.noResults': 'Kisi bulunamadi',
    'newGroup.next': 'Ileri',
    'newGroup.selected': 'secili',
    'newGroup.errorCreate': 'Oda olusturulamadi. Lutfen tekrar deneyin.',

    // Room Settings
    'roomSettings.title': 'Oda Ayarlari',
    'roomSettings.changeAvatar': 'Avatar Degistir',
    'roomSettings.uploadingAvatar': 'Yukleniyor...',
    'roomSettings.roomName': 'ODA ADI',
    'roomSettings.members': 'UYELER',
    'roomSettings.memberCount': '{count} uye',
    'roomSettings.addMember': 'Uye Ekle',
    'roomSettings.removeMember': 'Cikar',
    'roomSettings.leaveRoom': 'Odadan Ayril',
    'roomSettings.admin': 'Admin',
    'roomSettings.member': 'Uye',
    'roomSettings.lastAdminWarning': 'Son admin oldugunuz icin odadan ayrilamazsiniz.',
    'roomSettings.saveName': 'Kaydet',
    'roomSettings.saving': 'Kaydediliyor...',
    'roomSettings.deleteRoom': 'Odayi Sil',
    'roomSettings.deleting': 'Siliniyor...',

    // Add Member
    'addMember.title': 'Uye Ekle',
    'addMember.searchPlaceholder': 'Kisi ara...',
    'addMember.noResults': 'Kullanici bulunamadi',
    'addMember.adding': 'Ekleniyor...',

    // Confirm Dialog
    'confirm.removeMember': 'Uye Cikar',
    'confirm.removeMemberMessage': '{name} adli uyeyi bu odadan cikarmak istediginize emin misiniz?',
    'confirm.leaveRoom': 'Odadan Ayril',
    'confirm.leaveRoomMessage': 'Bu odadan ayrilmak istediginize emin misiniz?',
    'confirm.deleteRoom': 'Odayi Sil',
    'confirm.deleteRoomMessage': 'Bu odayi silmek istediginize emin misiniz? Tum mesajlar ve uyeler kalici olarak silinecektir. Bu islem geri alinamaz.',
    'confirm.confirm': 'Onayla',
    'confirm.cancel': 'Iptal',

    // System Messages
    'system.memberAdded': '{name} odaya eklendi',
    'system.memberRemoved': '{name} odadan cikarildi',
    'system.memberLeft': '{name} odadan ayrildi',
    'system.roomCreated': '{names} ile oda olusturuldu',

    // Chat Header
    'chatHeader.backAria': 'Sohbet listesine don',
    'chatHeader.secureChannel': 'guvenli kanal',
    'chatHeader.callTitle': 'Sesli arama',
    'chatHeader.callAria': 'Sesli arama baslat',

    // Message Input
    'messageInput.attachAria': 'Dosya ekle',
    'messageInput.placeholder': 'Sifrelenmis mesaj yaz...',
    'messageInput.textareaAria': 'Mesaj',
    'messageInput.sendAria': 'Mesaji gonder',

    // Chat List Item
    'chatListItem.yesterday': 'Dun',
    'chatListItem.group': 'Oda',
    'chatListItem.unknown': 'Bilinmeyen',
    'chatListItem.photo': 'Fotograf',
    'chatListItem.file': 'Dosya',
    'chatListItem.noMessages': 'Henuz mesaj yok',

    // Incoming Call
    'call.incoming': 'Sesli arama geliyor...',
    'call.rejectAria': 'Aramayi reddet',
    'call.acceptAria': 'Aramayi kabul et',

    // Active Call
    'call.ringing': 'Araniyor...',
    'call.connecting': 'Baglaniyor...',
    'call.unmute': 'Mikrofonu ac',
    'call.mute': 'Mikrofonu kapat',
    'call.endAria': 'Aramayi sonlandir',
    'call.speakerOff': 'Hoparloru kapat',
    'call.speakerOn': 'Hoparloru ac',

    // Group Call
    'call.groupIncoming': '{name} grup aramasi...',
    'call.participantCount': '{count} katilimci',
    'call.joining': 'Katiliyor...',

    // Call End Reasons
    'call.ended': 'Arama sonlandi',
    'call.rejected': 'Arama reddedildi',
    'call.busy': 'Kullanici mesgul',
    'call.noAnswer': 'Cevap yok',
    'call.failed': 'Arama basarisiz',

    // Voice Effects
    'profile.voiceEffect': 'SES EFEKTI',
    'voiceEffect.normal': 'Normal',
    'voiceEffect.disguise': 'Gizle',
    'voiceEffect.shadow': 'Golge',
    'voiceEffect.phantom': 'Hayalet',
    'voiceEffect.cyber': 'Siber',
    'voiceEffect.selectTitle': 'Konusma Filtresi',
    'voiceEffect.call': 'Ara',

    // Admin Panel
    'admin.title': 'Admin Paneli',
    'admin.systemAdmin': 'Sistem Admin',
    'admin.users': 'Kullanicilar',
    'admin.searchPlaceholder': 'Kullanici ara...',
    'admin.grantAdmin': 'Admin Yap',
    'admin.revokeAdmin': 'Adminligi Kaldir',
    'admin.noUsers': 'Kullanici bulunamadi',
    'admin.adminPanel': 'Admin Paneli',

    // App Layout
    'layout.emptyTitle': 'ESA Internal Grid',
    'layout.emptyDescription': 'Guvenli kurumsal mesajlasma icin soldan bir kanal sec veya yeni bir gorusme baslat.',
  },
}

export default translations
