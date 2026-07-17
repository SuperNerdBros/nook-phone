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

  import dodo_air_png from '../../../assets/img/DodoAir.png';
  import turnips_png from '../../../assets/img/Turnips.png';
  import music_png from '../../../assets/img/Music.png';
  import checklist_png from '../../../assets/img/Checklist.png';
  import wiki_png from '../../../assets/img/Wiki.png';
  import marketplace_png from '../../../assets/img/Marketplace.png';
  import simulator_png from '../../../assets/img/Simulator.png';
  import fake_art_png from '../../../assets/img/FakeArt.png';
  import queueing_png from '../../../assets/img/Queueing.png';
  import town_tunes_png from '../../../assets/img/TownTunes.png';
  import island_rating_png from '../../../assets/img/IslandRating.png';
  import weather_app_png from '../../../assets/img/WeatherApp.png';
  import browser_png from '../../../assets/img/Browser.png';
  import stocks_png from '../../../assets/img/Stocks.png';
  import gyroid_wiki_png from '../../../assets/img/GyroidWiki.png';
  import cardboard_box_png from '../../../assets/img/CardboardBox.png';
  import bug_net_png from '../../../assets/img/BugNet.png';
  import fishing_rod_png from '../../../assets/img/FishingRod.png';
  import shovel_png from '../../../assets/img/Shovel.png';
  import coffee_roost_png from '../../../assets/img/CoffeeRoost.png';

  const { name, class: className = "" } = $props<{ name: string; class?: string }>();

  const icons: Record<string, string> = {
    passport, camera, miles, critter, diy, designs, map, chat, rescue, shopping, designer, directory,
    best_friend,
    dodo_air: dodo_air_png,
    turnips: turnips_png,
    music: music_png,
    checklist: checklist_png,
    wiki: wiki_png,
    marketplace: marketplace_png,
    simulator: simulator_png,
    fake_art: fake_art_png,
    queueing: queueing_png,
    town_tunes: town_tunes_png,
    island_rating: island_rating_png,
    weather_app: weather_app_png,
    browser: browser_png,
    stocks: stocks_png,
    gyroid_wiki: gyroid_wiki_png,
    cardboard_box: cardboard_box_png,
    bug_net: bug_net_png,
    fishing_rod: fishing_rod_png,
    shovel: shovel_png,
    coffee_roost: coffee_roost_png,
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
