const RECIPE_ALIASES = {
  "Master Rogue": "Master Rogue Set",
  "Master Rogue Set": "Master Rogue Set",
  "Cruel BloodWolf Set": "Cruel Bloodwolf Set",
  "Cruel Bloodwolf Set": "Cruel Bloodwolf Set",
  "Book of the Jungle": "The Jungle Book",
  "Hand of Darkness": "Hands of Darkness",
  "Tamer of the Beasts": "Tamer of Beasts",
  "Luna's Blessing": "Luna's Blessing",
  "Crusader's Vengeance Set": "Crusader's Vengeance Set",
  "Legionnaire's Banner": "Legionnaire's Banner",
  "The Great Zweihander": "The Great Zweihander",
  "Pride of Valyria": "Pride of Valyria",
  "The Great Massacre": "The Great Massacre"
};
const EXTRA_RECIPES = [
  {
    "result": "Machete",
    "components": [
      "Quickstriking Dagger",
      "Gloves of Haste"
    ]
  },
  {
    "result": "Talisman of Liberation",
    "components": [
      "Ring of Protection",
      "Cloak"
    ]
  },
  {
    "result": "Medaillon of Liberation",
    "components": [
      "Talisman of Liberation",
      "Ring of Health"
    ]
  },
  {
    "result": "Ice Crown",
    "components": [
      "Belt of Strength",
      "Belt of Strength"
    ]
  },
  {
    "result": "Helm of the Ice King",
    "components": [
      "Shivas Shared Cold",
      "Ice Crown"
    ]
  },
  {
    "result": "Bracers of the Beast",
    "components": [
      "Tamer of Beasts",
      "Steel Bite",
      "Bow of the Eagle"
    ]
  },
  {
    "result": "Overseer's Falconbow",
    "components": [
      "Marching Drums of Bravery",
      "Taskmaster's Presence"
    ]
  },
  {
    "result": "Taskmaster's Presence",
    "components": [
      "Ring of Life",
      "Gloves of Haste"
    ]
  },
  {
    "result": "Pride of Valyria",
    "components": [
      "Mighty Reaver",
      "Cleaver of Strength"
    ]
  },
  {
    "result": "Arcano Dagger",
    "components": [
      "Hara-Kiri Mask",
      "Manafusion Wand"
    ]
  },
  {
    "result": "Silvermoon Defender",
    "components": [
      "Bronze Fortress",
      "Luna's Blessing"
    ]
  },
  {
    "result": "Shivas Shared Cold",
    "components": [
      "Stone of Life",
      "Platemail",
      "Chainmail"
    ]
  },
  {
    "result": "Gloves of the Templar",
    "components": [
      "Glove of the Dreamer",
      "Robe of the Magi"
    ]
  },
  {
    "result": "Arctic Frost Shard",
    "components": [
      "Bracers of Frost",
      "Mighty Reaver"
    ]
  },
  {
    "result": "Horn of Kelthador",
    "components": [
      "Whistle of Kelthador",
      "Sword of Vigor"
    ]
  },
  {
    "result": "Legionnaire's Edge",
    "components": [
      "Commander Gloves",
      "Mighty Reaver"
    ]
  },
  {
    "result": "Shadowflame Gloves",
    "components": [
      "Cataclysm Gloves",
      "Robe of the Magi"
    ]
  },
  {
    "result": "Netherstorm Flask",
    "components": [
      "Storm Flask",
      "Spelldagger"
    ]
  },
  {
    "result": "Fairy Dust",
    "components": [
      "Barrier Gloves",
      "Band of Elvenskin"
    ]
  },
  {
    "result": "Book of the Jungle",
    "components": [
      "Gloves of the Forest",
      "Lance of Steel"
    ]
  },
  {
    "result": "Paladin's Faceguard",
    "components": [
      "Holy Gloves",
      "Battle Standard of Endurance"
    ]
  },
  {
    "result": "Hand of Darkness",
    "components": [
      "Shadow Gloves",
      "Sword of Swiftness"
    ]
  },
  {
    "result": "Viperstrike Gloves",
    "components": [
      "Poison Rock",
      "Band of Elvenskin"
    ]
  },
  {
    "result": "Spirit-Hex Gloves",
    "components": [
      "Hex Gloves",
      "Ring of the Spirithawk"
    ]
  },
  {
    "result": "Bloodfang",
    "components": [
      "Sword of Swiftness",
      "Iron Talon"
    ]
  },
  {
    "result": "Sacred Lotus",
    "components": [
      "Stone of Life",
      "Cowl of Disguise",
      "Cloak"
    ]
  },
  {
    "result": "Fist of Thunder",
    "components": [
      "Stormborn",
      "Thunder's Rumble Mace"
    ]
  },
  {
    "result": "Wildfire Insanity",
    "components": [
      "Wings of Hell",
      "Ashbringer Totemstaff"
    ]
  },
  {
    "result": "Cloak of Escape",
    "components": [
      "Ornament of Sacrifice",
      "Robe of the Magi"
    ]
  },
  {
    "result": "Ornament of Sacrifice",
    "components": [
      "The Angry Arcanist",
      "Ring of Life"
    ]
  },
  {
    "result": "Holy Hammer",
    "components": [
      "The Angry Arcanist",
      "Staff of Wizardy",
      "Null Talisman"
    ]
  },
  {
    "result": "Sniperhawk",
    "components": [
      "Bow of the Eagle",
      "Blade of Alacrity"
    ]
  },
  {
    "result": "Hurricane's End",
    "components": [
      "Cyclone's End",
      "Tempest's End"
    ]
  },
  {
    "result": "Doom of the Necropolis Set",
    "components": [
      "Doom of the Necropolis Hood",
      "Doom of the Necropolis Robe",
      "Doom of the Necropolis Gloves",
      "Molten Steel"
    ]
  },
  {
    "result": "Swiftbite Set",
    "components": [
      "Swiftbite Hood",
      "Swiftbite Treads",
      "Swiftbite Gloves",
      "Molten Steel"
    ]
  },
  {
    "result": "Crusader's Vengeance Set",
    "components": [
      "Crusader's Vengeance Helmet",
      "Crusader's Vengeance Chestplate",
      "Crusader's Vengeance Gloves",
      "Molten Steel"
    ]
  },
  {
    "result": "Bloodswipe Set",
    "components": [
      "Bloodswipe Helmet",
      "Bloodswipe Chestplate",
      "Bloodswipe Gloves",
      "Molten Steel"
    ]
  },
  {
    "result": "Winterwolf Clan Standard",
    "components": [
      "Battle Standar of Endurance",
      "Winter Belt"
    ]
  },
  {
    "result": "Crowmaster",
    "components": [
      "Flameleader",
      "Winterhide Wizar Cloak"
    ]
  },
  {
    "result": "Soulbrother Rings of Union",
    "components": [
      "Soulbrother Ring of Tears",
      "Soulbrother Ring of Blood"
    ]
  },
  {
    "result": "Darkforce, Caster of Shadows",
    "components": [
      "The Angry Arcanist",
      "Spelldagger"
    ]
  },
  {
    "result": "Azuresky Warglaive Set",
    "components": [
      "Azuresky Warglaive",
      "Azuresky Warglaive"
    ]
  },
  {
    "result": "Runeforged Dragon Set",
    "components": [
      "Runeforged Dragon Mask",
      "Runeforged Dragon Shoulders",
      "Runeforged Dragon Gloves",
      "Molten Steel"
    ]
  },
  {
    "result": "Skyborn Dragon Set",
    "components": [
      "Skyborn Dragon Mask",
      "Skyborn Dragon Chestguard",
      "Skyborn Dragon Treads",
      "Molten Steel"
    ]
  },
  {
    "result": "Stoneskin Dragon Set",
    "components": [
      "Stoneskin Dragon Helmet",
      "Stoneskin Dragon Chestguard",
      "Stoneskin Dragon Bracers",
      "Molten Steel"
    ]
  },
  {
    "result": "Demonglaive",
    "components": [
      "Hearth of Mercury",
      "Blade of Alacrity"
    ]
  },
  {
    "result": "Demonslayer Gloves",
    "components": [
      "Demon Gloves",
      "Lance of Steel"
    ]
  },
  {
    "result": "Brutal Gladiator's Set",
    "components": [
      "Brutal Gladiator's Carver",
      "Brutal Gladiator's Wall",
      "Molten Steel"
    ]
  },
  {
    "result": "Bounty Hunter's Set",
    "components": [
      "Bounty Hunter's Dagger",
      "Bounty Hunter's Cape",
      "Molten Steel"
    ]
  },
  {
    "result": "Forbidden Magic Set",
    "components": [
      "Forbidden Mask",
      "Forbidden Cape",
      "Molten Steel"
    ]
  },
  {
    "result": "Immortal Witcher Set",
    "components": [
      "Immortal Witcher Hood",
      "Immortal Witcher Shoulders",
      "Immortal Witcher Bracers",
      "Molten Steel"
    ]
  },
  {
    "result": "Immortal Colossus Set",
    "components": [
      "Immortal Colossus Helm",
      "Immortal Colossus Belt",
      "Immortal Colossus Bracers",
      "Molten Steel"
    ]
  },
  {
    "result": "Immortal Ninja Set",
    "components": [
      "Immortal Ninja Helm",
      "Immortal Ninja Belt",
      "Immortal Ninja Shoulders",
      "Molten Steel"
    ]
  },
  {
    "result": "[Ancient] Dark Crusader's Vengeance Set",
    "components": [
      "Crusader's Vengeance Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "Righteous Crusader's Vengeance Set",
    "components": [
      "[Ancient] Dark Crusader's Vengeance Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "Royal Murderer Set",
    "components": [
      "[Ancient] Swiftstrike Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Swiftstrike Set",
    "components": [
      "Swiftbite Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "Naga Witch Set",
    "components": [
      "[Ancient] Doom of the Crypt Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Doom of the Crypt Set",
    "components": [
      "Doom of the Necropolis Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "Sea Dragon Set",
    "components": [
      "[Ancient] Godswipe Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Godswipe Set",
    "components": [
      "Bloodswipe Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "Holy Cleric Set",
    "components": [
      "[Ancient] Crystalforged Dragon Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Crystalforged Dragon Set",
    "components": [
      "Runeforged Dragon Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "Master Rogue",
    "components": [
      "[Ancient] Skyfall Dragon Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Skyfall Dragon Set",
    "components": [
      "Skyborn Dragon Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "Iron Guard Set",
    "components": [
      "[Ancient] Stonescale Dragon Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Stonescale Dragon Set",
    "components": [
      "Stoneskin Dragon Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "[Mythical] Nightstalker Set",
    "components": [
      "[Ancient] Assassin's Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Assassin's Set",
    "components": [
      "Bounty Hunter's Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "[Mythical] Kingsguard Set",
    "components": [
      "[Ancient] Savage Gladiator's Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Savage Gladiator's Set",
    "components": [
      "Brutal Gladiator's Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "[Mythical] Warmage Set",
    "components": [
      "[Ancient] Forbidden Nether Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Forbidden Nether Set",
    "components": [
      "Forbidden Magic Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "[Mythical] Dark Priest Set",
    "components": [
      "[Ancient] Immortal Occultist Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Immortal Occultist Set",
    "components": [
      "Immortal Witcher Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "[Mythical] Iron Warden Set",
    "components": [
      "[Ancient] Immortal Cyclops Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Immortal Cyclops Set",
    "components": [
      "Immortal Colossus Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "[Ancient] Immortal Templar Set",
    "components": [
      "Immortal Ninja Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "[Mythical] Dark Templar Set",
    "components": [
      "[Ancient] Immortal Templar Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Mythical] Demonfall Set",
    "components": [
      "[Ancient] Azuresky Dragon Glaive Set",
      "[Mythical] Moonstone"
    ]
  },
  {
    "result": "[Ancient] Azuresky Dragon Glaive Set",
    "components": [
      "Azuresky Warglaive Set",
      "[Ancient] Temple Shard",
      "Molten Steel"
    ]
  },
  {
    "result": "[Mythical] Legion Breaker Set",
    "components": [
      "[Ancient] Set of the Golden Lion",
      "[Mythical] Titan Blood"
    ]
  },
  {
    "result": "[Mythical] Monkey Storm Set",
    "components": [
      "[Ancient] Monkey King Set",
      "[Mythical] Titan Blood"
    ]
  },
  {
    "result": "[Mythical] Cruel BloodWolf Set",
    "components": [
      "[Ancient] Cruel Warlord Set",
      "[Mythical] Titan Blood"
    ]
  },
  {
    "result": "[Mythical] Shadow Demon Set",
    "components": [
      "[Ancient] Sinister Warlock Set",
      "[Mythical] Titan Blood"
    ]
  },
  {
    "result": "[Mythical] Dragon Guardian Set",
    "components": [
      "[Ancient] Morass Guardian Set",
      "[Mythical] Titan Blood"
    ]
  },
  {
    "result": "[Mythical] Moon Light Set",
    "components": [
      "[Ancient] Jungle Warden Set",
      "[Mythical] Titan Blood"
    ]
  },
  {
    "result": "[Mythical] Wild Grizzly Set",
    "components": [
      "[Ancient] Voodoo Might Set",
      "[Mythical] Titan Blood"
    ]
  },
  {
    "result": "[Ancient] Monkey King Set",
    "components": [
      "[Ancient] Monkey King Bracers",
      "[Ancient] Monkey King Shoulders",
      "[Ancient] Monkey King Headdress",
      "Molten Steel"
    ]
  },
  {
    "result": "[Ancient] Cruel Warlord Set",
    "components": [
      "[Ancient] Cruel Warlord Mask",
      "[Ancient] Cruel Warlord Shoulders",
      "[Ancient] Cruel Warlord Axe",
      "Molten Steel"
    ]
  },
  {
    "result": "[Ancient] Sinister Warlock Set",
    "components": [
      "[Ancient] Sinister Warlock Hood",
      "[Ancient] Sinister Warlock Armor",
      "[Ancient] Sinister Warlock Bracers",
      "Molten Steel"
    ]
  },
  {
    "result": "[Ancient] Morass Guardian Set",
    "components": [
      "[Ancient] Morass Guardian Headdress",
      "[Ancient] Morass Guardian Belt",
      "[Ancient] Morass Guardian Shoulders",
      "Molten Steel"
    ]
  },
  {
    "result": "[Ancient] Jungle Warden Set",
    "components": [
      "[Ancient] Jungle Warden Headdress",
      "[Ancient] Jungle Warden Shoulders",
      "[Ancient] Jungle Warden Belt",
      "Molten Steel"
    ]
  },
  {
    "result": "[Ancient] Voodoo Might Set",
    "components": [
      "[Ancient] Voodoo Might Bracers",
      "[Ancient] Voodoo Might Shoulders",
      "[Ancient] Voodoo Might Blade",
      "Molten Steel"
    ]
  },
  {
    "result": "Cain's Family Legacy",
    "components": [
      "[Divine] Cain's Family Armor",
      "[Mythical] Titan Blood"
    ]
  },
  {
    "result": "[Divine] Cain's Family Armor",
    "components": [
      "Cain's Family Amulet",
      "Cain's Family Treads",
      "Cain's Family Bible",
      "Molten Steel"
    ]
  },
  {
    "result": "[Ancient] Set of the Golden Lion",
    "components": [
      "[Ancient] Helm of the Golden Lion",
      "[Ancient] Shoulders of the Golden Lion",
      "[Ancient] Gloves of the Golden Lion",
      "Molten Steel"
    ]
  }
];
