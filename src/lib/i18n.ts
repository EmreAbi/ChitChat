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
    'register.nicknamePlaceholder': 'e.g.: emre_42',
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

    // Chat List
    'chatList.title': 'ChitChat Node',
    'chatList.unread': 'unread',
    'chatList.allClear': 'all clear',
    'chatList.newGroup': 'New team',
    'chatList.newGroupAria': 'Create new team',
    'chatList.menu': 'Menu',
    'chatList.profile': 'Profile',
    'chatList.signOut': 'Sign Out',
    'chatList.searchPlaceholder': 'Search secure channels',
    'chatList.filterAll': 'All',
    'chatList.filterUnread': 'Unread',
    'chatList.filterGroups': 'Teams',
    'chatList.emptyTitle': 'No chats yet',
    'chatList.emptyDescription': 'Start a new chat using the button below.',
    'chatList.newChatAria': 'Start new chat',

    // Chat View
    'chat.today': 'Today',
    'chat.yesterday': 'Yesterday',
    'chat.group': 'Group',
    'chat.secureChat': 'Secure Chat',
    'chat.online': 'online',
    'chat.scrollDown': 'Scroll to bottom',

    // New Chat
    'newChat.title': 'Direct Channel',
    'newChat.contacts': 'contacts',
    'newChat.searchPlaceholder': 'Search contacts...',
    'newChat.noResults': 'No contacts found',

    // New Group
    'newGroup.title': 'Team Channel',
    'newGroup.configureMembers': 'configure members',
    'newGroup.selectMembers': 'select members',
    'newGroup.groupNamePlaceholder': 'Group name',
    'newGroup.members': 'Members:',
    'newGroup.creating': 'Creating...',
    'newGroup.create': 'Create Group',
    'newGroup.searchPlaceholder': 'Search people...',
    'newGroup.next': 'Next',
    'newGroup.selected': 'selected',

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
    'chatListItem.group': 'Group',
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

    // Voice Effects
    'profile.voiceEffect': 'VOICE EFFECT',
    'voiceEffect.none': 'None',
    'voiceEffect.robot': 'Robot',
    'voiceEffect.deep': 'Deep Voice',
    'voiceEffect.high': 'High Voice',
    'voiceEffect.echo': 'Echo',
    'call.modalTitle': 'Start Call',
    'call.normalCall': 'Normal Call',
    'call.modifiedCall': 'Voice Modified',
    'call.cancel': 'Cancel',

    // App Layout
    'layout.emptyTitle': 'ChitChat Internal Grid',
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
    'register.nicknamePlaceholder': 'ornek: emre_42',
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

    // Chat List
    'chatList.title': 'ChitChat Node',
    'chatList.unread': 'okunmamis',
    'chatList.allClear': 'hepsi okundu',
    'chatList.newGroup': 'Yeni ekip',
    'chatList.newGroupAria': 'Yeni ekip olustur',
    'chatList.menu': 'Menu',
    'chatList.profile': 'Profil',
    'chatList.signOut': 'Cikis Yap',
    'chatList.searchPlaceholder': 'Guvenli kanallarda ara',
    'chatList.filterAll': 'Tumu',
    'chatList.filterUnread': 'Okunmamis',
    'chatList.filterGroups': 'Ekipler',
    'chatList.emptyTitle': 'Henuz sohbet yok',
    'chatList.emptyDescription': 'Asagidaki butondan yeni bir sohbet baslatabilirsin.',
    'chatList.newChatAria': 'Yeni sohbet baslat',

    // Chat View
    'chat.today': 'Bugun',
    'chat.yesterday': 'Dun',
    'chat.group': 'Grup',
    'chat.secureChat': 'Guvenli Sohbet',
    'chat.online': 'cevrimici',
    'chat.scrollDown': 'En alta git',

    // New Chat
    'newChat.title': 'Direkt Kanal',
    'newChat.contacts': 'kisi',
    'newChat.searchPlaceholder': 'Kisi ara...',
    'newChat.noResults': 'Kisi bulunamadi',

    // New Group
    'newGroup.title': 'Ekip Kanali',
    'newGroup.configureMembers': 'uyeleri yapilandir',
    'newGroup.selectMembers': 'uyeleri sec',
    'newGroup.groupNamePlaceholder': 'Grup adi',
    'newGroup.members': 'Uyeler:',
    'newGroup.creating': 'Olusturuluyor...',
    'newGroup.create': 'Grup Olustur',
    'newGroup.searchPlaceholder': 'Kisi ara...',
    'newGroup.next': 'Ileri',
    'newGroup.selected': 'secili',

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
    'chatListItem.group': 'Grup',
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

    // Voice Effects
    'profile.voiceEffect': 'SES EFEKTI',
    'voiceEffect.none': 'Yok',
    'voiceEffect.robot': 'Robot',
    'voiceEffect.deep': 'Kalin Ses',
    'voiceEffect.high': 'Ince Ses',
    'voiceEffect.echo': 'Yanki',
    'call.modalTitle': 'Arama Baslat',
    'call.normalCall': 'Normal Arama',
    'call.modifiedCall': 'Ses Degistirerek',
    'call.cancel': 'Iptal',

    // App Layout
    'layout.emptyTitle': 'ChitChat Internal Grid',
    'layout.emptyDescription': 'Guvenli kurumsal mesajlasma icin soldan bir kanal sec veya yeni bir gorusme baslat.',
  },
}

export default translations
