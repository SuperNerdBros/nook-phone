// Static Data for the Nook Phone App (NookOS)

export interface ProjectItem {
	name: string;
	description: string;
	languages: string[];
	logo?: string;
	logoStyle?: string;
	logoBorder?: boolean;
	site?: string;
	android?: string;
	ios?: string;
	discord?: string;
	facebook?: string;
	instagram?: string;
	twitter?: string;
	git?: string;
	information: string[];
	tools: string[];
	appIcon?: string;
	id?: string;
	bg?: string;
	icon?: string;
}

export const projectsData: ProjectItem[] = [
	{
		name: 'Tune Maker',
		id: 'tune_maker',
		appIcon: 'town_tunes',
		description: 'Create and share your own town tunes!',
		languages: ['en'],
		site: 'https://ac-tune-maker.aikats.us/',
		information: ['gameplay'],
		tools: ['creative']
	},
// 	{
// 		name: 'Community (JP)',
// 		appIcon: 'directory',
// 		description: 'あつまれ どうぶつの森 コミュニティ',
// 		languages: ['jp'],
// 		logo: '',
// 		logoStyle: '',
// 		site: '',
// 		android: '',
// 		ios: 'https://apps.apple.com/jp/app/id1507394206',
// 		discord: '',
// 		facebook: '',
// 		instagram: '',
// 		twitter: '',
// 		git: '',
// 		information: ['critters', 'fossils', 'items'],
// 		tools: ['economy']
// 	},
// 	{
// 		name: 'Community (KO)',
// 		appIcon: 'critter',
// 		description: '모여봐요 동물의 숲 커뮤니티',
// 		languages: ['ko'],
// 		logo: '',
// 		logoStyle: '',
// 		site: '',
// 		android: '',
// 		ios: 'https://apps.apple.com/kr/app/id1507394206',
// 		discord: '',
// 		facebook: '',
// 		instagram: '',
// 		twitter: '',
// 		git: '',
// 		information: ['critters', 'fossils'],
// 		tools: ['economy']
// 	},
	{
		name: 'Critterpedia',
		appIcon: 'critter',
		description: 'A clean and simple tracking and logging tool for all bugs, fish, and sea creatures in Animal Crossing: New Horizons.',
		languages: ['en'],
		site: 'https://acnhcritterpedia.com/',
		information: ['critters'],
		tools: ['tracking']
	},
	{
		name: 'Dodo Air',
		appIcon: 'dodo_air',
		bg: 'bg-[#1b9be0]',
		description: 'Dodo Airlines Flight Hub. Schedule, track, and manage flights for your island! Dodo Air is always ready for take-off!',
		languages: ['en'],
		site: '/dodo-air/',
		information: ['gameplay'],
		tools: ['utilities']
	},
	{
		name: 'Helper',
		appIcon: 'shopping',
		description:
			'Companion app for catching critters, logging critters and items, and turnip predictions',
		languages: ['en', 'es', 'de', 'fr', 'it', 'jp', 'ru', 'zh'],
		logo: 'ac-helper.png',
		logoStyle: 'icon',
		site: '',
		android: '',
		ios: 'https://apps.apple.com/us/app/id1508764244',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: 'https://github.com/Dimillian/ACHNBrowserUI',
		information: ['critters', 'fossils'],
		tools: ['creative', 'economy']
	},
	{
		name: 'Miles',
		appIcon: 'diy',
		description: 'Achievement visualizer for Animal Crossing: New Horizons',
		languages: ['en'],
		logo: '',
		logoStyle: '',
		site: 'https://acmiles.com/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: 'https://github.com/MariuszDabrowski/ac-miles',
		information: ['gameplay'],
		tools: ['tracking']
	},
	{
		name: 'Wildlife',
		appIcon: 'designs',
		description:
			'Tracking tool for Critters, Art, Achievements and more! Add your friends to share progress!',
		languages: ['en'],
		logo: '',
		logoStyle: '',
		site: 'https://acwildlife.com/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: 'https://github.com/zeepk/wildlife',
		information: ['art', 'critters', 'fossils', 'items', 'gameplay', 'villagers'],
		tools: ['tracking']
	},
	{
		name: "ACNH Beginner's Guide",
		description: "Fan-made beginner's guide for AC:NH",
		languages: ['en'],
		logo: 'bg_logo.png',
		logoStyle: 'banner',
		site: 'https://chibisnorlax.github.io/acnhbeginners/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: 'https://github.com/chibisnorlax/acnhbeginners',
		information: ['art', 'critters', 'flowers', 'fossils', 'gameplay', 'villagers'],
		tools: ['reference']
	},
	{
		name: 'Data Spreadsheet',
		appIcon: 'map',
		description:
			'A comprehensive Google spreadsheet documenting items, villagers, achievements, and much more',
		languages: ['en'],
		logo: '',
		logoStyle: '',
		site: 'https://docs.google.com/spreadsheets/d/13d_LAJPlxMa_DubPTuirkIV4DERBMXbrWQsmSh8ReK4/edit?gid=467902725#gid=467902725',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: ['art', 'critters', 'fossils', 'items', 'villagers'],
		tools: ['reference']
	},
	{
		name: 'FAQ',
		appIcon: 'chat',
		description: 'Fan-made FAQ for AC:NH',
		languages: ['en'],
		logo: 'faq_logo.png',
		logoStyle: 'banner',
		site: 'https://chibisnorlax.github.io/acnhfaq/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: 'https://github.com/chibisnorlax/acnhfaq',
		information: ['art', 'critters', 'flowers', 'fossils', 'gameplay', 'villagers'],
		tools: ['reference']
	},
	{
		name: 'Guide',
		appIcon: 'passport',
		description:
			'A free multi-purpose guide and cataloging app with Catalog Scanner integration for New Horizons.',
		languages: ['en', 'es', 'de', 'fr', 'it', 'nl', 'ja', 'zh', 'ko', 'ru'],
		logo: 'acnh-guide.gif',
		logoStyle: 'banner',
		site: 'https://acnh.guide/',
		android: 'https://acnh.guide/android',
		ios: 'https://acnh.guide/ios',
		discord: '3232gNC',
		facebook: '',
		instagram: '',
		twitter: 'GeneSy',
		git: '',
		information: ['art', 'critters', 'fossils', 'gameplay', 'items', 'villagers'],
		tools: ['tracking', 'multiplayer', 'economy']
	},
	{
		name: 'Life',
		appIcon: 'miles',
		description: 'Mobile app with critter info, item checklists, turnip calculator, and more',
		languages: ['en'],
		logo: 'acnh-life.png',
		logoStyle: 'banner',
		logoBorder: true,
		site: '',
		android: 'https://play.google.com/store/apps/details?id=com.hangodjin.animal_crossing_guide',
		ios: 'https://apps.apple.com/us/app/acnh-life/id1504842752',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: ['art', 'critters', 'items', 'villagers'],
		tools: ['tracking', 'economy']
	},
// 	{
// 		name: 'Music',
// 		appIcon: 'best_friend',
// 		description: 'Web app that plays the current hourly music from Animal Crossing: New Horizons',
// 		languages: ['en'],
// 		logo: '',
// 		logoStyle: '',
// 		site: 'https://acnhapi.com/acnh-music',
// 		android: '',
// 		ios: '',
// 		discord: '',
// 		facebook: '',
// 		instagram: '',
// 		twitter: '',
// 		git: '',
// 		information: [],
// 		tools: ['creative']
// 	},
	{
		name: 'Plant Guide',
		appIcon: 'books',
		description: 'A guide to every plant in the game (except for flowers)',
		languages: ['en'],
		logo: 'plant_logo.png',
		logoStyle: 'banner',
		site: 'https://bigfootmg.github.io/ACNH-Plant-Guide/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: 'bigfootvgm',
		twitter: 'b19f00t',
		git: 'https://github.com/BigfootMG/ACNH-Plant-Guide',
		information: ['gameplay'],
		tools: ['reference']
	},
// 	{
// 		name: 'Translation Spreadsheet',
// 		appIcon: 'calculator',
// 		description: "A Google spreadsheet listing translation for most of the game's data",
// 		languages: ['en', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh', 'jp', 'ko'],
// 		logo: '',
// 		logoStyle: '',
// 		site: 'https://bit.ly/acnh-translations',
// 		android: '',
// 		ios: '',
// 		discord: '',
// 		facebook: '',
// 		instagram: '',
// 		twitter: '',
// 		git: 'https://github.com/alexislours/translation-sheet-data',
// 		information: ['art', 'critters', 'fossils', 'items', 'villagers'],
// 		tools: ['reference']
// 	},
	{
		name: 'Travel Guide',
		appIcon: 'calendar',
		description:
			'Companion app for iOS with all information and tools you need, and a great design',
		languages: ['en', 'es', 'de', 'fr', 'it', 'nl', 'ja', 'zh', 'ko', 'ru'],
		logo: 'acnh-travel-guide.png',
		logoStyle: 'icon',
		site: '',
		android: '',
		ios: 'https://apps.apple.com/us/app/acnh-travel-guide/id1502818559',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: ['art', 'critters', 'fossils', 'items', 'villagers', 'flowers', 'gifts'],
		tools: ['tracking', 'economy', 'multiplayer']
	},
	{
		name: 'Pattern Tool',
		appIcon: 'camera_alt',
		description: 'Pattern designer compatible with NL, HHD, and NH',
		languages: ['en'],
		logo: 'ac-pattern-tool.png',
		logoStyle: 'icon',
		site: 'https://acpatterns.com/',
		android: '',
		ios: '',
		discord: '9rGkZNk',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: [],
		tools: ['creative']
	},
	{
		name: 'Wiki',
		appIcon: 'clock',
		description: 'Animal-Crossing-Wiki von AC-Booster.net',
		languages: ['de'],
		logo: 'animal-crossing-wiki-de.png',
		logoStyle: '',
		site: 'https://animalcrossingwiki.de/',
		android: '',
		ios: '',
		discord: 'rkUDD4F',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: ['art', 'critters', 'fossils', 'gameplay', 'gifts', 'items', 'villagers'],
		tools: ['reference']
	},
	{
		name: 'World',
		appIcon: 'contacts',
		description: 'Blogs and guides about the Animal Crossing series',
		languages: ['en'],
		logo: 'animal-crossing-world.png',
		logoStyle: '',
		site: 'https://animalcrossingworld.com/',
		android: '',
		ios: '',
		discord: '',
		facebook: 'AnimalCrossWorld',
		instagram: 'animalcrossing_world',
		twitter: 'ACWorldBlog',
		git: '',
		information: ['gameplay'],
		tools: ['reference']
	},
	{
		name: 'Animal Guide',
		appIcon: 'dating',
		description:
			'Fan-made guidebook for ACNH with comprehensive info on collectibles, villagers, and more',
		languages: ['en'],
		logo: 'animal-guide-for-acnh.png',
		logoStyle: 'icon',
		site: '',
		android: 'https://animalguide.app/',
		ios: 'https://animalguide.app/',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: [
			'art',
			'critters',
			'flowers',
			'fossils',
			'gameplay',
			'gifts',
			'items',
			'villagers'
		],
		tools: ['tracking', 'creative', 'economy']
	},
	{
		name: "cestislife's Visual Guides",
		description: 'A compilation of visual guides made by cestislife',
		languages: ['en'],
		logo: 'cestislife.png',
		logoStyle: 'icon',
		site: 'https://cestislife.github.io/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: ['critters', 'flowers', 'gameplay'],
		tools: ['reference']
	},
	{
		name: 'CatalogScanner',
		appIcon: 'files',
		description:
			'A simple bot for quickly extracting catalogs, recipes, critters and more from recorded videos',
		languages: ['en', 'es', 'de', 'fr', 'it', 'ja', 'ko', 'nl', 'ru', 'zh'],
		logo: 'catalog-scanner.png',
		logoStyle: 'icon',
		site: 'https://nook.lol/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: 'catalogscanner',
		git: 'https://github.com/EhsanKia/CatalogScanner',
		information: ['critters', 'items'],
		tools: ['reference']
	},
// 	{
// 		name: 'Custom Crossing',
// 		appIcon: 'mail',
// 		description: 'Pattern and design sharing',
// 		languages: ['en'],
// 		logo: 'custom-crossing.png',
// 		logoStyle: 'banner',
// 		site: 'https://customcrossing.com/',
// 		android: '',
// 		ios: '',
// 		discord: 'aYQ3yXw',
// 		facebook: '',
// 		instagram: '',
// 		twitter: '',
// 		git: '',
// 		information: [],
// 		tools: ['creative']
// 	},
// 	{
// 		name: 'DodoCodes.com',
// 		appIcon: 'maps',
// 		description:
// 			'All in one ACNH Community with Dodo codes, designs, auctions, giveaways, articles, dreams, user ratings, wishlists, catalogs, and more',
// 		languages: ['en', 'de', 'fr', 'zh'],
// 		logo: 'dodocodescom.png',
// 		logoStyle: 'banner',
// 		logoBorder: true,
// 		site: 'https://dodocodes.com',
// 		android: 'https://play.google.com/store/apps/details?id=com.dodocodes.mobile',
// 		ios: 'https://apps.apple.com/us/app/dodocodes/id1512463462',
// 		discord: 'dodocodes',
// 		facebook: 'dodocodes',
// 		instagram: 'dodocodes.app',
// 		twitter: 'dodo_codes',
// 		git: '',
// 		information: [],
// 		tools: ['creative', 'multiplayer', 'economy']
// 	},
// 	{
// 		name: 'FANDOM Wiki',
// 		appIcon: 'messages',
// 		description: 'FANDOM Animal Crossing wiki that anyone can contribute to',
// 		languages: ['en'],
// 		logo: 'acw.png',
// 		logoStyle: 'banner',
// 		site: 'https://animalcrossing.fandom.com/wiki/Animal_Crossing_Wiki',
// 		android: '',
// 		ios: '',
// 		discord: 'Uu7dx4P9',
// 		facebook: '',
// 		instagram: '',
// 		twitter: '',
// 		git: '',
// 		information: ['art', 'critters', 'fossils', 'gameplay', 'items', 'villagers'],
// 		tools: ['reference']
// 	},
	{
		name: 'Flower Breeding Simulator',
		appIcon: 'notes',
		description: 'A fancy tool to simulate flower breeding and pattern performance',
		languages: ['en', 'es', 'de', 'fr', 'it', 'jp', 'ko', 'nl', 'ru', 'zh'],
		logo: 'garden-science.png',
		logoStyle: 'icon',
		site: 'https://gardenscience.ac/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: ['flowers'],
		tools: ['utilities']
	},
	{
		name: 'Happy Island Designer',
		appIcon: 'designer',
		description: 'Draw terrain and paths, place buildings, and trace your in-game map',
		languages: ['en'],
		logo: '',
		logoStyle: '',
		site: '/island-designer/#/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: 'https://github.com/eugeneration/HappyIslandDesigner',
		information: [],
		tools: ['utilities']
	},
	{
		name: 'Horizonpedia',
		appIcon: 'reminders',
		description:
			'Aiming to be the most userfriendly App for iOS and Android with Item catalog, fake art comparison, and more!',
		languages: ['en', 'es', 'de', 'fr', 'it', 'jp', 'ko', 'nl', 'ru', 'zh', 'se'],
		logo: '',
		logoStyle: '',
		site: '',
		android: 'https://play.google.com/store/apps/details?id=com.wegner.horizonpedia',
		ios: 'https://apps.apple.com/us/app/horizonpedia/id1514592054',
		discord: 'pQMRkMg',
		facebook: '',
		instagram: 'horizonpedia',
		twitter: 'HorizonpediaE',
		git: '',
		information: ['art', 'critters', 'fossils', 'items', 'villagers'],
		tools: ['tracking', 'economy']
	},
	{
		name: 'MeteoNook',
		appIcon: 'settings',
		description:
			"Predict your island's weather patterns, including exact times for meteor showers, rainbows and the aurora borealis",
		languages: ['en'],
		logo: '',
		logoStyle: '',
		site: 'https://wuffs.org/acnh/weather/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: 'https://github.com/Treeki/MeteoNook/',
		information: [],
		tools: ['utilities']
	},
// 	{
// 		name: 'My Dodo Link',
// 		appIcon: 'wallet',
// 		description: "Islands queue manager, go in line and receive the dodo code when it's your turn.",
// 		languages: ['en', 'it'],
// 		logo: 'my-dodo-link.png',
// 		logoStyle: '',
// 		site: 'https://mydodo.link',
// 		android: '',
// 		ios: '',
// 		discord: '',
// 		facebook: '',
// 		instagram: '',
// 		twitter: '',
// 		git: '',
// 		information: [],
// 		tools: ['multiplayer']
// 	},
	{
		name: 'Nookazon',
		appIcon: 'weather',
		description: 'Buy and sell Animal Crossing: New Horizons items',
		languages: ['en', 'es', 'de', 'fr', 'it', 'jp', 'ko', 'nl', 'ru', 'zh'],
		logo: 'nookazon.svg',
		logoStyle: 'banner',
		site: 'https://nookazon.com/',
		android: '',
		ios: '',
		discord: 'nookazon',
		facebook: 'nookazon',
		instagram: 'nookazon',
		twitter: 'nookazon',
		git: '',
		information: ['items'],
		tools: ['economy']
	},
// 	{
// 		name: 'Nook DB.io',
// 		appIcon: 'directory',
// 		description:
// 			'Comprehensive item database with filtering, checklists, stalk market calculator, a music player, and more',
// 		languages: ['en', 'es', 'de', 'fr', 'it', 'jp', 'ko', 'ru', 'zh'],
// 		logo: 'nook-db-io.png',
// 		logoStyle: 'icon',
// 		site: 'https://nookdb.io/',
// 		android: 'https://play.google.com/store/apps/details?id=io.nookdb.android',
// 		ios: '',
// 		discord: '',
// 		facebook: '',
// 		instagram: '',
// 		twitter: '',
// 		git: '',
// 		information: ['flowers', 'items'],
// 		tools: ['tracking', 'creative', 'economy']
// 	},
	{
		name: 'Nook Exchange',
		appIcon: 'critter',
		description: 'Item tracker and marketplace',
		languages: ['en', 'es', 'de', 'fr', 'it', 'jp', 'ko', 'nl', 'ru', 'zh'],
		logo: 'nook-exchange.png',
		logoStyle: 'banner',
		site: 'https://nook.exchange/',
		android: '',
		ios: '',
		discord: '9sh66CX',
		facebook: '',
		instagram: '',
		twitter: 'nookexchange',
		git: '',
		information: ['items'],
		tools: ['tracking', 'economy']
	},
	{
		name: 'NookFriends',
		appIcon: 'shopping',
		description: 'The friendliest Animal Crossing: New Horizons community!',
		languages: ['en'],
		logo: 'nookfriends.png',
		logoStyle: 'banner',
		site: 'https://www.nookfriends.com/',
		android: '',
		ios: '',
		facebook: 'nookfriend',
		instagram: 'nookfriendsanimalcrossing',
		twitter: 'nookfriendsACNH',
		git: '',
		information: ['art', 'gameplay'],
		tools: ['multiplayer', 'tracking']
	},
	{
		name: 'Nookipedia',
		appIcon: 'diy',
		description:
			'The independent Animal Crossing wiki, covering the series along with an API service',
		languages: ['en'],
		logo: 'nookipedia.png',
		logoStyle: 'banner',
		site: 'https://nookipedia.com/wiki/Main_Page',
		android: '',
		ios: '',
		discord: '5Sfg3CT',
		facebook: 'nookipedia',
		instagram: 'nookipedia',
		twitter: 'nookipedia',
		git: '',
		information: ['art', 'critters', 'fossils', 'gameplay', 'gifts', 'items', 'villagers'],
		tools: ['reference']
	},
	{
		name: 'Nooknet',
		appIcon: 'designs',
		description:
			'Comprehensive services, including checklists, design sharing, dream codes, tune creation, turnip calculator, and more',
		languages: ['en'],
		logo: 'nooknet.png',
		logoStyle: 'banner',
		site: 'https://nooknet.net/',
		android: '',
		ios: '',
		discord: 'RwNrqmH',
		facebook: 'NookNetNet',
		instagram: 'nooknetnet',
		twitter: 'nooknetnet',
		git: '',
		information: ['art', 'flowers', 'gameplay', 'villagers'],
		tools: ['tracking', 'creative', 'multiplayer', 'economy']
	},
	{
		name: 'Nook Plaza',
		appIcon: 'map',
		description:
			'Item catalog, wishlists, villager gifts, island rating calc, weather forecasting, fake art detector, and more!',
		languages: ['en', 'es', 'de', 'fr', 'it', 'jp', 'ru', 'zh'],
		logo: 'nook-plaza.png',
		logoStyle: 'banner',
		site: 'https://nookplaza.net/',
		android: '',
		ios: '',
		discord: 'SppmqEk',
		facebook: '',
		instagram: 'nookplaza',
		twitter: 'nook_plaza',
		git: '',
		information: ['art', 'critters', 'fossils', 'gifts', 'items', 'villagers'],
		tools: ['tracking', 'utilities']
	},
// 	{
// 		name: 'Nooks Guide',
// 		appIcon: 'chat',
// 		description: 'List of critters, items, villagers, recipes, and more',
// 		languages: ['en'],
// 		logo: 'nooks-guide.jpg',
// 		logoStyle: 'icon',
// 		site: 'https://nooksguide.com/',
// 		android: '',
// 		ios: '',
// 		discord: '',
// 		facebook: '',
// 		instagram: '',
// 		twitter: 'nooksguide',
// 		git: '',
// 		information: ['art', 'critters', 'fossils', 'villagers'],
// 		tools: ['tracking', 'creative', 'multiplayer', 'economy']
// 	},
	{
		name: 'Stalks.io',
		appIcon: 'passport',
		description:
			"Get stalk price predictions, forecasts and advice for you and your friends' islands",
		languages: ['en'],
		logo: 'stalks-io.png',
		logoStyle: 'banner',
		site: 'https://stalks.io/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: 'stalksio',
		git: '',
		information: [],
		tools: ['economy']
	},
	{
		name: 'Tanuki Forest',
		appIcon: 'miles',
		description: 'Database of items, critters, clothing, and villagers',
		languages: ['en'],
		logo: 'tanuki-forest.gif',
		logoStyle: 'banner',
		site: 'https://www.tanukiforest.com',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: ['art', 'critters', 'fossils', 'items', 'villages'],
		tools: ['reference']
	},
	{
		name: 'The ULTIMATE Catalogue',
		appIcon: 'best_friend',
		description: 'A full ACNH catalogue and checklist containing all items in the game and more',
		languages: ['en', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh', 'jp', 'ko'],
		logo: 'catalogue-ac.png',
		logoStyle: 'icon',
		site: 'https://catalogue.ac',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: '',
		information: ['art', 'critters', 'fossils', 'gifts', 'items', 'villagers'],
		tools: ['tracking']
	},

	{
		name: 'Turnip Prophet',
		appIcon: 'calculator',
		description: 'Turnip price prediction tool available in multiple languages',
		languages: ['en', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh', 'jp', 'ko'],
		logo: '',
		logoStyle: '',
		site: 'https://turnipprophet.io/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: '',
		twitter: '',
		git: 'https://github.com/mikebryant/ac-nh-turnip-prices',
		information: [],
		tools: ['economy']
	},
// 	{
// 		name: 'VillagerDB',
// 		appIcon: 'calendar',
// 		description: 'Database of items and villagers, with a wishlist maker',
// 		languages: ['en'],
// 		logo: 'villagerdb.jpg',
// 		logoStyle: 'icon',
// 		site: 'https://villagerdb.com/',
// 		android: '',
// 		ios: '',
// 		discord: 'n4527pm',
// 		facebook: '',
// 		instagram: '',
// 		twitter: 'villagerdb',
// 		git: 'https://github.com/jefflomacy/villagerdb',
// 		information: ['art', 'critters', 'fossils', 'items', 'villagers'],
// 		tools: ['tracking']
// 	},
	{
		name: "Yue's ACNH Guides",
		description: 'Visual guides made by Yue, available in multiple languages',
		languages: ['en', 'de', 'jp', 'zh'],
		logo: "yue's-acnh-guides.png",
		logoStyle: '',
		site: 'https://yuexr.github.io/acnh/',
		android: '',
		ios: '',
		discord: '',
		facebook: '',
		instagram: 'yuecrossing',
		twitter: 'yuecrossing',
		git: '',
		information: ['flowers', 'gameplay'],
		tools: ['reference']
	},
	{
		name: 'Camera',
		appIcon: 'camera',
		description: 'Take beautiful photos around your island with custom filters and frames.',
		languages: ['en'],
		site: '',
		information: ['utilities'],
		tools: ['utilities']
	},
	{
		name: 'DIY Recipes',
		appIcon: 'diy',
		description: 'View recipes and required materials to craft tools and furniture.',
		languages: ['en'],
		site: '',
		information: ['utilities'],
		tools: ['utilities']
	},
	{
		name: 'Nook Shopping',
		appIcon: 'shopping',
		description: 'Order furniture, clothing, and utility items directly using your Bells.',
		languages: ['en'],
		site: '',
		information: ['economy'],
		tools: ['economy']
	},
	{
		name: 'Map',
		appIcon: 'map',
		description: 'Interactive map showcasing your resident villagers and key buildings.',
		languages: ['en'],
		site: '',
		information: ['utilities'],
		tools: ['utilities']
	},
	{
		name: 'Passport',
		appIcon: 'passport',
		description: 'Showcase your player info, title, island name, and status updates.',
		languages: ['en'],
		site: '',
		information: ['tracking'],
		tools: ['tracking']
	},
	{
		name: 'Nookit',
		appIcon: 'chat',
		description: 'Review recent dialogue and system logs from residents and notifications.',
		languages: ['en'],
		site: '',
		information: ['reference'],
		tools: ['reference']
	},
	{
		name: 'Settings',
		appIcon: 'settings',
		description: 'Configure ringtones, sound effects, theme wallpapers, and clock display modes.',
		languages: ['en'],
		site: '',
		information: ['utilities'],
		tools: ['utilities']
	},
	{
		name: 'Residential Recycle Box',
		appIcon: 'directory',
		description: 'Access the residential catalog to search, install, and rate community web apps.',
		languages: ['en'],
		site: '',
		information: ['utilities'],
		tools: ['utilities']
	},
	{
		name: 'Messages',
		appIcon: 'messages',
		description: 'Send and receive direct text messages with other players.',
		languages: ['en'],
		site: '',
		information: ['utilities'],
		tools: ['utilities']
	},
	{
		name: 'Contacts',
		appIcon: 'contacts',
		description: 'Manage your villager directory, residency status, and friendship points.',
		languages: ['en'],
		site: '',
		information: ['utilities'],
		tools: ['utilities']
	},
	{
		name: 'Best Friends',
		appIcon: 'best_friend',
		description: 'Connect, chat, and keep track of your closest friends online.',
		languages: ['en'],
		site: '',
		information: ['multiplayer'],
		tools: ['multiplayer']
	},
	{
		name: 'Rescue Service',
		appIcon: 'rescue',
		description: 'Help service to transport you back to safety when you get stuck.',
		languages: ['en'],
		site: '',
		information: ['utilities'],
		tools: ['utilities']
	},
	{
		name: 'Changelog',
		appIcon: 'changelog',
		description: 'Keep track of the latest NookOS updates, features, and improvements.',
		languages: ['en'],
		site: '',
		information: ['reference'],
		tools: ['reference']
	}
];

export interface Critter {
	id: string;
	name: string;
	type: 'bug' | 'fish' | 'sea';
	price: number;
	location: string;
	shadowSize?: string;
	activeMonthsNorth: number[];
	activeMonthsSouth: number[];
	activeHours: string;
}

export const crittersData: Critter[] = [
	{
		id: '1',
		name: 'Common Butterfly',
		type: 'bug',
		price: 160,
		location: 'Flying',
		activeMonthsNorth: [3, 4, 5, 6, 7, 8, 9],
		activeMonthsSouth: [9, 10, 11, 12, 1, 2, 3],
		activeHours: '4 AM - 7 PM'
	},
	{
		id: '2',
		name: 'Emperor Butterfly',
		type: 'bug',
		price: 4000,
		location: 'Flying near flowers',
		activeMonthsNorth: [6, 7, 8, 9, 12, 1, 2, 3],
		activeMonthsSouth: [12, 1, 2, 3, 6, 7, 8, 9],
		activeHours: '5 PM - 8 AM'
	},
	{
		id: '3',
		name: 'Tarantula',
		type: 'bug',
		price: 8000,
		location: 'On ground',
		activeMonthsNorth: [11, 12, 1, 2, 3, 4],
		activeMonthsSouth: [5, 6, 7, 8, 9, 10],
		activeHours: '7 PM - 4 AM'
	},
	{
		id: '4',
		name: 'Scorpion',
		type: 'bug',
		price: 8000,
		location: 'On ground',
		activeMonthsNorth: [5, 6, 7, 8, 9, 10],
		activeMonthsSouth: [11, 12, 1, 2, 3, 4],
		activeHours: '7 PM - 4 AM'
	},
	{
		id: '5',
		name: "Rajah Brooke's Birdwing",
		type: 'bug',
		price: 2500,
		location: 'Flying near water',
		activeMonthsNorth: [4, 5, 6, 9, 10, 11, 12, 1, 2],
		activeMonthsSouth: [10, 11, 12, 3, 4, 5, 6, 7, 8],
		activeHours: '8 AM - 5 PM'
	},

	{
		id: '101',
		name: 'Sea Bass',
		type: 'fish',
		price: 400,
		location: 'Sea',
		shadowSize: 'Large (5)',
		activeMonthsNorth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeMonthsSouth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeHours: 'All Day'
	},
	{
		id: '102',
		name: 'Red Snapper',
		type: 'fish',
		price: 3000,
		location: 'Sea',
		shadowSize: 'Medium-Large (4)',
		activeMonthsNorth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeMonthsSouth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeHours: 'All Day'
	},
	{
		id: '103',
		name: 'Koi',
		type: 'fish',
		price: 4000,
		location: 'Pond',
		shadowSize: 'Medium-Large (4)',
		activeMonthsNorth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeMonthsSouth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeHours: '4 PM - 9 AM'
	},
	{
		id: '104',
		name: 'Great White Shark',
		type: 'fish',
		price: 15000,
		location: 'Sea (with fin)',
		shadowSize: 'Huge (6 with Fin)',
		activeMonthsNorth: [6, 7, 8, 9],
		activeMonthsSouth: [12, 1, 2, 3],
		activeHours: '4 PM - 9 AM'
	},
	{
		id: '105',
		name: 'Golden Trout',
		type: 'fish',
		price: 15000,
		location: 'River (Clifftop)',
		shadowSize: 'Medium (3)',
		activeMonthsNorth: [3, 4, 5, 9, 10, 11],
		activeMonthsSouth: [9, 10, 11, 3, 4, 5],
		activeHours: '4 PM - 9 AM'
	},

	{
		id: '201',
		name: 'Scallop',
		type: 'sea',
		price: 1200,
		location: 'Diving',
		shadowSize: 'Medium',
		activeMonthsNorth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeMonthsSouth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeHours: 'All Day'
	},
	{
		id: '202',
		name: 'Pearl Oyster',
		type: 'sea',
		price: 2800,
		location: 'Diving',
		shadowSize: 'Small-Medium',
		activeMonthsNorth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeMonthsSouth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		activeHours: 'All Day'
	},
	{
		id: '203',
		name: 'Gigas Giant Clam',
		type: 'sea',
		price: 15000,
		location: 'Diving',
		shadowSize: 'Huge (Very Fast)',
		activeMonthsNorth: [5, 6, 7, 8, 9],
		activeMonthsSouth: [11, 12, 1, 2, 3],
		activeHours: 'All Day'
	},
	{
		id: '204',
		name: 'Sea Grapes',
		type: 'sea',
		price: 900,
		location: 'Diving',
		shadowSize: 'Small',
		activeMonthsNorth: [6, 7, 8, 9],
		activeMonthsSouth: [12, 1, 2, 3],
		activeHours: 'All Day'
	}
];

export interface DIYRecipe {
	id: string;
	name: string;
	category: 'tools' | 'furniture' | 'houseware' | 'cooking';
	materials: { name: string; qty: number }[];
	isUnlocked: boolean;
	source: string;
}

export const diyData: DIYRecipe[] = [
	{
		id: 'diy1',
		name: 'Flimsy Fishing Rod',
		category: 'tools',
		materials: [{ name: 'Tree Branch', qty: 5 }],
		isUnlocked: true,
		source: "Tom Nook's Workshop"
	},
	{
		id: 'diy2',
		name: 'Flimsy Net',
		category: 'tools',
		materials: [{ name: 'Tree Branch', qty: 5 }],
		isUnlocked: true,
		source: "Tom Nook's Workshop"
	},
	{
		id: 'diy3',
		name: 'Stone Axe',
		category: 'tools',
		materials: [
			{ name: 'Flimsy Axe', qty: 1 },
			{ name: 'Wood', qty: 3 },
			{ name: 'Stone', qty: 3 }
		],
		isUnlocked: false,
		source: 'Redeem Nook Miles'
	},
	{
		id: 'diy4',
		name: 'Wooden Chair',
		category: 'furniture',
		materials: [{ name: 'Wood', qty: 6 }],
		isUnlocked: true,
		source: 'Tom Nook'
	},
	{
		id: 'diy5',
		name: 'Simple DIY Workbench',
		category: 'furniture',
		materials: [
			{ name: 'Wood', qty: 5 },
			{ name: 'Hardwood', qty: 5 },
			{ name: 'Iron Nugget', qty: 3 }
		],
		isUnlocked: true,
		source: 'Tom Nook'
	},
	{
		id: 'diy6',
		name: 'Log Bench',
		category: 'furniture',
		materials: [{ name: 'Hardwood', qty: 5 }],
		isUnlocked: false,
		source: 'Message Bottle'
	},
	{
		id: 'diy7',
		name: 'Cherry Pie',
		category: 'cooking',
		materials: [
			{ name: 'Flour', qty: 3 },
			{ name: 'Cherry', qty: 2 }
		],
		isUnlocked: false,
		source: 'DIY Recipes+ Upgrade'
	},
	{
		id: 'diy8',
		name: 'Mushroom Salad',
		category: 'cooking',
		materials: [
			{ name: 'Round Mushroom', qty: 1 },
			{ name: 'Flat Mushroom', qty: 1 },
			{ name: 'Wheat Flour', qty: 1 }
		],
		isUnlocked: false,
		source: 'Sheng/Villager cooking'
	},
	{
		id: 'diy9',
		name: 'Pumpkin Soup',
		category: 'cooking',
		materials: [{ name: 'Orange Pumpkin', qty: 3 }],
		isUnlocked: false,
		source: 'Recipe Bottle'
	}
];

export interface CatalogItem {
	id: string;
	name: string;
	category: 'Furniture' | 'Fashion' | 'Wallpaper' | 'Tools';
	price: number;
	currency: 'Bells' | 'Miles';
	imageUrl: string;
}

export const catalogData: CatalogItem[] = [
	{
		id: 'cat1',
		name: 'Nook Phone Case (Cyan)',
		category: 'Fashion',
		price: 500,
		currency: 'Miles',
		imageUrl: 'https://picsum.photos/seed/nookphone/200/200'
	},
	{
		id: 'cat2',
		name: 'ABD (Automatic Bell Dispenser)',
		category: 'Furniture',
		price: 9900,
		currency: 'Miles',
		imageUrl: 'https://picsum.photos/seed/abd/200/200'
	},
	{
		id: 'cat3',
		name: 'Nook Inc. Silk Rug',
		category: 'Furniture',
		price: 1200,
		currency: 'Miles',
		imageUrl: 'https://picsum.photos/seed/rug/200/200'
	},
	{
		id: 'cat4',
		name: 'Plaza Arch',
		category: 'Furniture',
		price: 3000,
		currency: 'Miles',
		imageUrl: 'https://picsum.photos/seed/arch/200/200'
	},
	{
		id: 'cat5',
		name: 'Streetlight',
		category: 'Furniture',
		price: 1000,
		currency: 'Miles',
		imageUrl: 'https://picsum.photos/seed/light/200/200'
	},
	{
		id: 'cat6',
		name: 'Custom Design Phone Case Kit',
		category: 'Tools',
		price: 1800,
		currency: 'Bells',
		imageUrl: 'https://picsum.photos/seed/casekit/200/200'
	},
	{
		id: 'cat7',
		name: 'Nook Inc. Tee',
		category: 'Fashion',
		price: 800,
		currency: 'Miles',
		imageUrl: 'https://picsum.photos/seed/tee/200/200'
	},
	{
		id: 'cat8',
		name: 'Retro Gas Pump',
		category: 'Furniture',
		price: 2700,
		currency: 'Bells',
		imageUrl: 'https://picsum.photos/seed/gaspump/200/200'
	}
];

export interface MapBuilding {
	id: string;
	name: string;
	type: string;
	x: number; // Percent from left (0 - 100)
	y: number; // Percent from top (0 - 100)
	icon: string;
}

export const mapData: MapBuilding[] = [
	{ id: 'b1', name: 'Resident Services', type: 'townhall', x: 50, y: 55, icon: '🏛️' },
	{ id: 'b2', name: 'Dodo Airport', type: 'airport', x: 50, y: 92, icon: '✈️' },
	{ id: 'b3', name: "Nook's Cranny", type: 'shop', x: 35, y: 45, icon: '🍃' },
	{ id: 'b4', name: 'Able Sisters', type: 'tailor', x: 65, y: 42, icon: '🪡' },
	{ id: 'b5', name: 'Museum', type: 'museum', x: 25, y: 25, icon: '🏛️' },
	{ id: 'b6', name: 'Your House', type: 'player', x: 75, y: 28, icon: '🏠' },
	{ id: 'b7', name: 'Campsite', type: 'campsite', x: 40, y: 20, icon: '🏕️' }
];

export interface MilesChallenge {
	id: string;
	title: string;
	description: string;
	progress: number;
	target: number;
	reward: number;
	isClaimed: boolean;
	category: 'Standard' | 'Nook Miles+';
}

export const milesData: MilesChallenge[] = [
	{
		id: 'm1',
		title: 'Island Shutterbug',
		description: 'Take screenshots using your Camera app to document your island adventures!',
		progress: 0,
		target: 3,
		reward: 300,
		isClaimed: false,
		category: 'Standard'
	},
	{
		id: 'm2',
		title: 'Critter Catching Champion',
		description: 'Catch insects, fish, or sea creatures listed in your Critterpedia!',
		progress: 0,
		target: 5,
		reward: 500,
		isClaimed: false,
		category: 'Standard'
	},
	{
		id: 'm3',
		title: 'DIY Masterclass',
		description: 'Craft items using any collected DIY recipe!',
		progress: 0,
		target: 3,
		reward: 400,
		isClaimed: false,
		category: 'Standard'
	},
	{
		id: 'm4',
		title: 'Shopping Spree',
		description: 'Purchase catalog items using Nook Shopping!',
		progress: 0,
		target: 2,
		reward: 300,
		isClaimed: false,
		category: 'Standard'
	},
	{
		id: 'm5',
		title: 'Island Designer Explorer',
		description: 'Build paths or edit terrain using the Island Designer construction tools!',
		progress: 0,
		target: 5,
		reward: 1000,
		isClaimed: false,
		category: 'Standard'
	},

	{
		id: 'mp1',
		title: 'Daily: Catch 3 Bugs',
		description: 'Nook Miles+ short-term goal.',
		progress: 0,
		target: 3,
		reward: 150,
		isClaimed: false,
		category: 'Nook Miles+'
	},
	{
		id: 'mp2',
		title: 'Daily: Chop 5 Wood',
		description: 'Nook Miles+ short-term goal.',
		progress: 0,
		target: 5,
		reward: 200,
		isClaimed: false,
		category: 'Nook Miles+'
	},
	{
		id: 'mp3',
		title: 'Daily: Design a Pattern',
		description: 'Nook Miles+ short-term goal.',
		progress: 0,
		target: 1,
		reward: 150,
		isClaimed: false,
		category: 'Nook Miles+'
	}
];

export const islandLifeTips = [
	{
		title: 'Shake Trees Safely',
		content:
			'Always hold a net when shaking non-fruit trees. If a wasp nest falls, you can catch the wasp immediately and save yourself a sting!',
		author: 'Tom Nook'
	},
	{
		title: 'Glowing Spot in the Ground',
		content:
			'If you dig up Bells from a glowing gold spot, do not fill the hole! Burying up to 99,000 Bells in that exact glowing hole will grow a Money Tree!',
		author: 'Isabelle'
	},
	{
		title: 'Custom Phone Case Kits',
		content:
			'You can customize the color of your Nook Phone case at any DIY workbench using a Customization Kit!',
		author: 'Tom Nook'
	},
	{
		title: 'Finding DIY Recipe Bottles',
		content:
			'Check your island beaches twice a day (once in the morning, once in the evening) to find washed-up messages in bottles containing DIY recipes!',
		author: 'Isabelle'
	},
	{
		title: 'Vacation Home Designing',
		content:
			"When planning vacation homes in Paradise Planning, listen carefully to your clients' visions. Placing their three signature items is the key to absolute happiness!",
		author: 'Lottie'
	}
];
