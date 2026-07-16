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

  const { name, class: className = "" } = $props<{ name: string; class?: string }>();

  const icons: Record<string, string> = {
    passport, camera, miles, critter, diy, designs, map, chat, rescue, shopping, designer, directory
  };

  const src = icons[name] || icons['diy'];
</script>

<img {src} alt="{name} icon" class="w-full h-full object-contain drop-shadow-sm {className}" draggable="false" />
