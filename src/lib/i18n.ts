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
    'register.title': 'ESA Provision User',
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
    'chatList.title': 'ESA',
    'chatList.unread': 'unread',
    'chatList.allClear': 'all clear',
    'chatList.newGroup': 'New room',
    'chatList.newGroupAria': 'Create new room',
    'chatList.menu': 'Menu',
    'chatList.profile': 'Profile',
    'chatList.signOut': 'Sign Out',
    'chatList.searchPlaceholder': 'Search secure channels',
    'chatList.filterAll': 'All',
    'chatList.filterRooms': 'Rooms',
    'chatList.filterContacts': 'Contacts',
    'chatList.filterUnread': 'Unread',
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
    'newChat.searchPlaceholder': 'Search users to add...',
    'newChat.noResults': 'No users found',
    'newChat.addContact': 'Add',
    'newChat.noContacts': 'No contacts yet. Search to add people.',
    'newChat.removeContact': 'Remove',

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
    'admin.ban': 'Ban',
    'admin.unban': 'Unban',
    'admin.banned': 'Banned',
    'admin.bannedMessage': 'Your account has been suspended.',

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
    'login.passwordPlaceholder': 'Şifreni gir',
    'login.submit': 'Giriş Yap',
    'login.submitting': 'Giriş yapılıyor...',
    'login.noAccount': 'Hesabın yok mu?',
    'login.signUp': 'Kayıt Ol',

    // Register
    'register.title': 'ESA Provision User',
    'register.subtitle': 'Enterprise access onboarding',
    'register.nickname': 'NICKNAME',
    'register.nicknamePlaceholder': 'örnek: shadow_fox',
    'register.nicknameHint': '3-20 karakter, harf, rakam ve _ kullanılabilir',
    'register.password': 'PASSWORD',
    'register.passwordPlaceholder': 'En az 6 karakter, büyük/küçük harf + özel karakter',
    'register.systemPassword': 'SYSTEM PASSWORD',
    'register.systemPasswordPlaceholder': 'Kayıt şifresi',
    'register.submit': 'Kayıt Ol',
    'register.submitting': 'Hesap oluşturuluyor...',
    'register.hasAccount': 'Zaten hesabın var mı?',
    'register.signIn': 'Giriş Yap',
    'register.nicknameLength': 'Nickname 3-20 karakter olmalı',
    'register.nicknameChars': 'Nickname sadece harf, rakam ve _ içermeli',
    'register.passwordLength': 'Şifre en az 6 karakter olmalı',
    'register.passwordLower': 'Şifre en az bir küçük harf içermeli',
    'register.passwordUpper': 'Şifre en az bir büyük harf içermeli',
    'register.passwordSpecial': 'Şifre en az bir özel karakter içermeli',
    'register.systemError': 'Sistem hatası, tekrar deneyin',
    'register.wrongSystemPassword': 'Yanlış sistem şifresi',

    // Profile
    'profile.title': 'Profil',
    'profile.displayName': 'DISPLAY NAME',
    'profile.saving': 'Kaydediliyor...',
    'profile.saved': 'Kaydedildi!',
    'profile.saveChanges': 'Değişiklikleri Kaydet',
    'profile.signOut': 'Çıkış Yap',
    'profile.language': 'DİL',
    'profile.changeAvatar': 'Avatar Değiştir',
    'profile.uploadingAvatar': 'Yükleniyor...',

    // Chat List
    'chatList.title': 'ESA',
    'chatList.unread': 'okunmamış',
    'chatList.allClear': 'hepsi okundu',
    'chatList.newGroup': 'Yeni oda',
    'chatList.newGroupAria': 'Yeni oda oluştur',
    'chatList.menu': 'Menü',
    'chatList.profile': 'Profil',
    'chatList.signOut': 'Çıkış Yap',
    'chatList.searchPlaceholder': 'Güvenli kanallarda ara',
    'chatList.filterAll': 'Tümü',
    'chatList.filterRooms': 'Odalar',
    'chatList.filterContacts': 'Kişiler',
    'chatList.filterUnread': 'Okunmamış',
    'chatList.emptyTitle': 'Henüz sohbet yok',
    'chatList.emptyDescription': 'Aşağıdaki butondan yeni bir sohbet başlatabilirsin.',
    'chatList.newChatAria': 'Yeni sohbet başlat',

    // Chat View
    'chat.today': 'Bugün',
    'chat.yesterday': 'Dün',
    'chat.group': 'Oda',
    'chat.secureChat': 'Güvenli Sohbet',
    'chat.online': 'çevrimiçi',
    'chat.scrollDown': 'En alta git',

    // New Chat
    'newChat.title': 'Direkt Kanal',
    'newChat.contacts': 'kişi',
    'newChat.searchPlaceholder': 'Eklemek için kullanıcı ara...',
    'newChat.noResults': 'Kullanıcı bulunamadı',
    'newChat.addContact': 'Ekle',
    'newChat.noContacts': 'Henüz kişi yok. Eklemek için arayın.',
    'newChat.removeContact': 'Çıkar',

    // New Room
    'newGroup.title': 'Yeni Oda Oluştur',
    'newGroup.configureMembers': 'üyeleri yapılandır',
    'newGroup.selectMembers': 'üyeleri seç',
    'newGroup.selectedCount': '{count} seçili',
    'newGroup.roomNameLabel': 'Oda Adı',
    'newGroup.groupNamePlaceholder': 'Oda adı',
    'newGroup.nameHint': 'Odayı kolay bulunacak açık bir isimle adlandırın.',
    'newGroup.nameRequired': 'Oda adı zorunludur.',
    'newGroup.minMembersHint': 'Devam etmek için en az bir üye seçin.',
    'newGroup.readyHint': '{count} üye ile oda oluşturmaya hazır.',
    'newGroup.members': 'Üyeler:',
    'newGroup.emptySelection': 'Henüz üye seçilmedi.',
    'newGroup.creating': 'Oluşturuluyor...',
    'newGroup.create': 'Oda Oluştur',
    'newGroup.createWithCount': 'Oda Oluştur ({count})',
    'newGroup.searchPlaceholder': 'Kişi ara...',
    'newGroup.noResults': 'Kişi bulunamadı',
    'newGroup.next': 'İleri',
    'newGroup.selected': 'seçili',
    'newGroup.errorCreate': 'Oda oluşturulamadı. Lütfen tekrar deneyin.',

    // Room Settings
    'roomSettings.title': 'Oda Ayarları',
    'roomSettings.changeAvatar': 'Avatar Değiştir',
    'roomSettings.uploadingAvatar': 'Yükleniyor...',
    'roomSettings.roomName': 'ODA ADI',
    'roomSettings.members': 'ÜYELER',
    'roomSettings.memberCount': '{count} üye',
    'roomSettings.addMember': 'Üye Ekle',
    'roomSettings.removeMember': 'Çıkar',
    'roomSettings.leaveRoom': 'Odadan Ayrıl',
    'roomSettings.admin': 'Admin',
    'roomSettings.member': 'Üye',
    'roomSettings.lastAdminWarning': 'Son admin olduğunuz için odadan ayrılamazsınız.',
    'roomSettings.saveName': 'Kaydet',
    'roomSettings.saving': 'Kaydediliyor...',
    'roomSettings.deleteRoom': 'Odayı Sil',
    'roomSettings.deleting': 'Siliniyor...',

    // Add Member
    'addMember.title': 'Üye Ekle',
    'addMember.searchPlaceholder': 'Kişi ara...',
    'addMember.noResults': 'Kullanıcı bulunamadı',
    'addMember.adding': 'Ekleniyor...',

    // Confirm Dialog
    'confirm.removeMember': 'Üye Çıkar',
    'confirm.removeMemberMessage': '{name} adlı üyeyi bu odadan çıkarmak istediğinize emin misiniz?',
    'confirm.leaveRoom': 'Odadan Ayrıl',
    'confirm.leaveRoomMessage': 'Bu odadan ayrılmak istediğinize emin misiniz?',
    'confirm.deleteRoom': 'Odayı Sil',
    'confirm.deleteRoomMessage': 'Bu odayı silmek istediğinize emin misiniz? Tüm mesajlar ve üyeler kalıcı olarak silinecektir. Bu işlem geri alınamaz.',
    'confirm.confirm': 'Onayla',
    'confirm.cancel': 'İptal',

    // System Messages
    'system.memberAdded': '{name} odaya eklendi',
    'system.memberRemoved': '{name} odadan çıkarıldı',
    'system.memberLeft': '{name} odadan ayrıldı',
    'system.roomCreated': '{names} ile oda oluşturuldu',

    // Chat Header
    'chatHeader.backAria': 'Sohbet listesine dön',
    'chatHeader.secureChannel': 'güvenli kanal',
    'chatHeader.callTitle': 'Sesli arama',
    'chatHeader.callAria': 'Sesli arama başlat',

    // Message Input
    'messageInput.attachAria': 'Dosya ekle',
    'messageInput.placeholder': 'Şifrelenmiş mesaj yaz...',
    'messageInput.textareaAria': 'Mesaj',
    'messageInput.sendAria': 'Mesajı gönder',

    // Chat List Item
    'chatListItem.yesterday': 'Dün',
    'chatListItem.group': 'Oda',
    'chatListItem.unknown': 'Bilinmeyen',
    'chatListItem.photo': 'Fotoğraf',
    'chatListItem.file': 'Dosya',
    'chatListItem.noMessages': 'Henüz mesaj yok',

    // Incoming Call
    'call.incoming': 'Sesli arama geliyor...',
    'call.rejectAria': 'Aramayı reddet',
    'call.acceptAria': 'Aramayı kabul et',

    // Active Call
    'call.ringing': 'Aranıyor...',
    'call.connecting': 'Bağlanıyor...',
    'call.unmute': 'Mikrofonu aç',
    'call.mute': 'Mikrofonu kapat',
    'call.endAria': 'Aramayı sonlandır',
    'call.speakerOff': 'Hoparlörü kapat',
    'call.speakerOn': 'Hoparlörü aç',

    // Group Call
    'call.groupIncoming': '{name} grup araması...',
    'call.participantCount': '{count} katılımcı',
    'call.joining': 'Katılıyor...',

    // Call End Reasons
    'call.ended': 'Arama sonlandı',
    'call.rejected': 'Arama reddedildi',
    'call.busy': 'Kullanıcı meşgul',
    'call.noAnswer': 'Cevap yok',
    'call.failed': 'Arama başarısız',

    // Voice Effects
    'profile.voiceEffect': 'SES EFEKTİ',
    'voiceEffect.normal': 'Normal',
    'voiceEffect.disguise': 'Gizle',
    'voiceEffect.shadow': 'Gölge',
    'voiceEffect.phantom': 'Hayalet',
    'voiceEffect.cyber': 'Siber',
    'voiceEffect.selectTitle': 'Konuşma Filtresi',
    'voiceEffect.call': 'Ara',

    // Admin Panel
    'admin.title': 'Admin Paneli',
    'admin.systemAdmin': 'Sistem Admin',
    'admin.users': 'Kullanıcılar',
    'admin.searchPlaceholder': 'Kullanıcı ara...',
    'admin.grantAdmin': 'Admin Yap',
    'admin.revokeAdmin': 'Adminliği Kaldır',
    'admin.noUsers': 'Kullanıcı bulunamadı',
    'admin.adminPanel': 'Admin Paneli',
    'admin.ban': 'Banla',
    'admin.unban': 'Banı Kaldır',
    'admin.banned': 'Banlı',
    'admin.bannedMessage': 'Hesabınız askıya alındı.',

    // App Layout
    'layout.emptyTitle': 'ESA Internal Grid',
    'layout.emptyDescription': 'Güvenli kurumsal mesajlaşma için soldan bir kanal seç veya yeni bir görüşme başlat.',
  },
}

export default translations
