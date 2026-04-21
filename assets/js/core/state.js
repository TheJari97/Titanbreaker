
window.AppState = {
  selectedRarities: new Set(AppUtils.rarityOrder),
  selectedRoles: new Set(AppUtils.roleOrder),
  selectedRanges: new Set(AppUtils.rangeOrder),
  selectedAttrs: new Set(AppUtils.attrOrder),
  craftSelectedRarities: new Set(AppUtils.rarityOrder),
  craftSelectedRoles: new Set(AppUtils.roleOrder),
  craftSelectedRanges: new Set(AppUtils.rangeOrder),
  craftSelectedAttrs: new Set(AppUtils.attrOrder),
  itemSearch:'', craftSearch:'', itemsFiltersOpen:false, craftsFiltersOpen:false,
  talentLevels:{}, bonusPoints:0, selectedHero:null, heroTalentChoices:{}, pathScrollLeft:0
};
