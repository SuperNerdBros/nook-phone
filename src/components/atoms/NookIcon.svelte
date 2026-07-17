<script lang="ts">
  import passport from '../../../assets/img/NH-Icon-Nook_Phone-Passport.webp';
  import camera from '../../../assets/img/NH-Icon-Nook_Phone-Camera.webp';
  import miles from '../../../assets/img/NH-Icon-Nook_Phone-Nook_Miles.webp';
  import critter from '../../../assets/img/NH-Icon-Nook_Phone-Critterpedia.webp';
  import diy from '../../../assets/img/NH-Icon-Nook_Phone-DIY_Recipes.webp';
  import designs from '../../../assets/img/NH-Icon-Nook_Phone-Custom_Designs.webp';
  import map from '../../../assets/img/NH-Icon-Nook_Phone-Map.webp';
  import chat from '../../../assets/img/NH-Icon-Nook_Phone-Chat_log.webp';
  import rescue from '../../../assets/img/NH-Icon-Nook_Phone-Rescue_Service.webp';
  import shopping from '../../../assets/img/NH-Icon-Nook_Phone-Nook_shopping.webp';
  import designer from '../../../assets/img/NH-Icon-Nook_Phone-Island_Designer.webp';
  import directory from '../../../assets/img/NH-Icon-Nook_Phone-Call_Resident.webp';
  import best_friend from '../../../assets/img/NH-Icon-Nook_Phone-Best_Friend_list.webp';

  import books_png from '../../../assets/img/Books.png';
  import calculator_png from '../../../assets/img/Calculator.png';
  import calendar_png from '../../../assets/img/Calendar.png';
  import camera_png from '../../../assets/img/Camera.png';
  import clock_png from '../../../assets/img/Clock.png';
  import contacts_png from '../../../assets/img/Contacts.png';
  import dating_png from '../../../assets/img/Dating.png';
  import files_png from '../../../assets/img/Files.png';
  import mail_png from '../../../assets/img/Mail.png';
  import maps_png from '../../../assets/img/Maps.png';
  import messages_png from '../../../assets/img/Messages.png';
  import notes_png from '../../../assets/img/Notes.png';
  import photos_png from '../../../assets/img/Photos.png';
  import reminders_png from '../../../assets/img/Reminders.png';
  import settings_png from '../../../assets/img/Settings.png';
  import wallet_png from '../../../assets/img/Wallet.png';
  import weather_png from '../../../assets/img/Weather.png';

  const { name, class: className = "" } = $props<{ name: string; class?: string }>();

  const icons: Record<string, string> = {
    passport, camera, miles, critter, diy, designs, map, chat, rescue, shopping, designer, directory,
    best_friend,
    books: books_png,
    calculator: calculator_png,
    calendar: calendar_png,
    camera_alt: camera_png,
    clock: clock_png,
    contacts: contacts_png,
    dating: dating_png,
    files: files_png,
    mail: mail_png,
    maps: maps_png,
    messages: messages_png,
    notes: notes_png,
    photos: photos_png,
    reminders: reminders_png,
    settings: settings_png,
    wallet: wallet_png,
    weather: weather_png
  };

  function resolveAssetUrl(assetPath: string) {
    if (!assetPath) return assetPath;
    if (assetPath.startsWith('http')) return assetPath;
    
    // In development, the assets are served from the Vite dev server (port 5175)
    if (import.meta.env.DEV) {
      return `${window.location.protocol}//${window.location.hostname}:5175${assetPath}`;
    }
    
    // In production, we ensure it loads from the plugin directory if it's an absolute path
    if (assetPath.startsWith('/assets/')) {
      return (window as any).wpApiSettings?.pluginUrl + 'public/dist' + assetPath;
    }
    
    return assetPath;
  }

  const src = $derived(resolveAssetUrl(icons[name] || icons['diy']));
</script>

<img {src} alt="{name} icon" class="w-full h-full object-contain drop-shadow-sm {className}" draggable="false" />
