const GUIDE_CONTENT = {
  en: {
    title: 'Guide',
    intro: 'Use the sections to browse items, runewords, crafts, talent trees and heroes.',
    community: 'Community',
    communityText: 'Join our Discord server if you need help or have questions.',
    discordLabel: 'Discord Community',
    gameplay: 'Gameplay',
    gameplayLines: [
      'Titanbreaker is a 5 player dungeon crawler RPG with permanent character saving and a strong emphasis on teamplay.',
      'Each player can be revived 5 times after dying. After that they must start a new run or spectate the remaining heroes.',
      'The current maximum hero level is 100. You gain 13 Ability Points while leveling, plus 1 extra at levels 40, 60, 80 and 100.',
      'All creatures use an aggro system, so bringing at least 1 Tank and 1 Healer is strongly recommended.',
      'Item drops are rolled individually for each player when a creature dies. Bosses and Champions always drop 1 item.',
      'There are 13 Acts to clear. After each Act, go to the Titan Temple and defeat the corresponding Titan.'
    ],
    heroStats: 'Hero Statistics Information',
    heroStatsLines: [
      'These statistics are a snapshot, taken every 30 secs.',
      'They are based on the last Ability Damage instance you caused right before the snapshot happens.',
      'Cooldown Reduction considers the last Ability cast before the snapshot happens.'
    ],
    heroAttrs: 'Hero Attributes Information',
    heroAttrsLines: [
      'The default DotA stats are altered in Titanbreaker. You can find details by hovering over your main stats UI.',
      'Melee Heroes start with 30 Spell Resistance (not Healers) and gain +25 Max Health per Hero Level.',
      'There are 2 effects that modify the Damage of Abilities on a percentage basis: % Damage and % Elemental Damage (Fire, Frost, Arcane, Physical...). % Damage from any source stacks multiplicatively, while % Elemental Damage stacks additively.',
      'Ability Damage can also be affected by non-percentage based Elemental Damage. For example +10 Fire Damage adds 10 Damage to each base Fire Damage instance, ignoring the scaling of the Ability but still receiving other bonuses.',
      'Effects that modify the Healing of Abilities on a percentage basis stack additively.',
      'Effects that modify Critical Strike Chances and Damage stack additively.',
      'Spell Resistance from Artifacts is capped at 35.',
      'Percentage bonuses from multiple Artifacts stack additively.',
      'Spellhaste lowers the cast time of Spells and is capped at 50%. Half of Spellhaste increases the tick rate of Channeled Abilities, but only up to 200%.',
      'When you have more than 1 core Healer in your party there is a healing output penalty: 2 Healers = 25% Output, 3 Healers = 10% Output.'
    ],
    heroClass: 'Hero Class Information',
    heroClassLines: [
      'Each Class has a different passive bonus:',
      'Brawler: +10% increased Armor',
      'Deathbringer: +10% Strength',
      'Crusader: +10% Healing caused and received',
      'Shadowstalker: +10% Pure Damage chance',
      'Guardian: +5% All Attributes',
      'Demonslayer: +25 Movement and Attack Speed',
      'Shaolin: +15% Ability Crit Damage',
      'Ranger: +10% Agility',
      'Voodoo: +15 Spell Resistance',
      'Wizard: +10% Intellect',
      'Witcher: +10% max Mana and Health',
      'Cleric: +10% Mana Regeneration and Spellpower'
    ],
    itemShop: 'Item Shop and Recipes',
    itemShopLines: [
      'The standard Dota shop is disabled in Titanbreaker. You can browse it, but you can not buy items there.',
      'Instead there is a Blacksmith, where you can buy items up to Epic quality for Gold.',
      'This shop also sells recipes that are required to combine item sets.',
      'Later in the game there is also the Molten Forge in Act 8, where you can craft Artifacts for Gold.'
    ]
  },
  es: {
    title: 'Guía',
    intro: 'Usa las secciones para revisar items, runewords, crafteos, árboles de talento y héroes.',
    community: 'Comunidad',
    communityText: 'Únete al servidor de Discord si necesitas ayuda o tienes preguntas.',
    discordLabel: 'Comunidad de Discord',
    gameplay: 'Jugabilidad',
    gameplayLines: [
      'Titanbreaker es un dungeon crawler RPG para 5 jugadores con guardado permanente del personaje y fuerte énfasis en el juego en equipo.',
      'Cada jugador puede ser revivido 5 veces tras morir. Después de eso, debe iniciar una nueva partida o espectar a los héroes restantes.',
      'El nivel máximo actual del héroe es 100. Obtienes 13 puntos de habilidad al subir de nivel, más 1 extra en los niveles 40, 60, 80 y 100.',
      'Todas las criaturas usan un sistema de aggro, así que se recomienda llevar al menos 1 Tank y 1 Healer.',
      'Las tiradas de items se hacen de forma individual para cada jugador cuando una criatura muere. Los Bosses y Champions siempre sueltan 1 item.',
      'Hay 13 actos por completar. Después de cada acto, ve al Titan Temple y derrota al Titán correspondiente.'
    ],
    heroStats: 'Información de estadísticas del héroe',
    heroStatsLines: ['Estas estadísticas son una captura tomada cada 30 s.','Se basan en la última instancia de daño de habilidad que causaste justo antes de que ocurra la captura.','La reducción de enfriamiento considera la última habilidad lanzada antes de la captura.'],
    heroAttrs: 'Información de atributos del héroe',
    heroAttrsLines: ['Las estadísticas base de DotA están modificadas en Titanbreaker. Puedes ver más detalles pasando el mouse sobre la interfaz de tus estadísticas principales.','Los héroes cuerpo a cuerpo empiezan con 30 de resistencia a hechizos (excepto Healers) y obtienen +25 de vida máxima por nivel.','Hay 2 efectos que modifican el daño de habilidades de forma porcentual: % Damage y % Elemental Damage (Fire, Frost, Arcane, Physical...). % Damage de cualquier fuente se acumula multiplicativamente, mientras que % Elemental Damage se acumula de forma aditiva.','El daño de habilidad también puede verse afectado por daño elemental no porcentual. Por ejemplo, +10 Fire Damage añade 10 de daño a cada instancia base de daño de Fuego, ignorando el escalado de la habilidad pero recibiendo otros bonos.','Los efectos que modifican la curación de habilidades en porcentaje se acumulan de forma aditiva.','Los efectos que modifican la probabilidad y el daño crítico se acumulan de forma aditiva.','La resistencia a hechizos obtenida por artefactos tiene un tope de 35.','Los bonos porcentuales de múltiples artefactos se acumulan de forma aditiva.','Spellhaste reduce el tiempo de casteo de los hechizos y tiene un tope de 50%. La mitad de Spellhaste aumenta la frecuencia de los ticks de habilidades canalizadas, pero solo hasta 200%.','Si en tu grupo hay más de 1 Healer principal, existe una penalización a la curación: 2 Healers = 25% Output, 3 Healers = 10% Output.'],
    heroClass: 'Información de clases del héroe',
    heroClassLines: ['Cada clase tiene un bono pasivo diferente:','Brawler: +10% de armadura','Deathbringer: +10% de fuerza','Crusader: +10% de curación causada y recibida','Shadowstalker: +10% de probabilidad de daño puro','Guardian: +5% a todos los atributos','Demonslayer: +25 de movimiento y velocidad de ataque','Shaolin: +15% de daño crítico de habilidad','Ranger: +10% de agilidad','Voodoo: +15 de resistencia a hechizos','Wizard: +10% de intelecto','Witcher: +10% de maná y vida máximos','Cleric: +10% de regeneración de maná y poder de hechizo'],
    itemShop: 'Tienda de objetos y recetas',
    itemShopLines: ['La tienda estándar de Dota está deshabilitada en Titanbreaker. Puedes revisarla, pero no puedes comprar allí.','En su lugar existe un Blacksmith donde puedes comprar items hasta calidad épica por Gold.','Esta tienda también vende recetas necesarias para combinar sets de items.','Más adelante también existe la Molten Forge en el Acto 8, donde puedes crear Artifacts por Gold.']
  }
};
