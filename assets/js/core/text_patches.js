
(function(){
  function applyList(list, rules){
    if(!Array.isArray(list)) return list;
    return list.map(function(v){
      let s=String(v||'');
      rules.forEach(function(rule){ s=s.replace(rule[0], rule[1]); });
      return s.replace(/\s{2,}/g,' ').trim();
    });
  }
  const esRules=[
    [/\bresistencia un hechizos\b/gi,'resistencia a hechizos'],
    [/\bResistencia un hechizos\b/g,'Resistencia a hechizos'],
    [/\bAuto daño de ataque\b/gi,'daño de ataque automático'],
    [/\bCaos daño\b/gi,'daño de Caos'],
    [/\bFísico daño\b/gi,'daño Físico'],
    [/\bSombra daño\b/gi,'daño de Sombra'],
    [/\bArcano daño\b/gi,'daño Arcano'],
    [/\bFuego daño\b/gi,'daño de Fuego'],
    [/\bNaturaleza daño\b/gi,'daño de Naturaleza'],
    [/\bEscarcha daño\b/gi,'daño de Escarcha'],
    [/\bHoly\b/g,'Sagrado'],
    [/\bRain de Stars\b/g,'Rain of Stars'],
    [/\bFlow de Combat\b/g,'Flow of Combat'],
    [/\bLycanthrope\b/g,'Lycanthrope'],
    [/\bTree de Life\b/g,'Tree of Life'],
    [/\bArmaduraed\b/g,'Armored'],
    [/\bwhile\b/gi,'mientras'],
    [/\bPassively obtienes poder de hechizo equal a\b/gi,'Obtienes de forma pasiva poder de hechizo equivalente a'],
    [/\bHabilidad golpe crítico chance\b/gi,'Probabilidad de golpe crítico de habilidad'],
    [/\bAumentado daño\b/gi,'más daño'],
    [/\binfligeing\b/gi,'infligiendo'],
    [/\bcast tu\b/gi,'lanzas tu'],
    [/\bMount:\s*obtienes\b/gi,'Montura: obtienes'],
    [/\bun un objetivo\b/gi,'un objetivo'],
  ];
  const ptRules=[
    [/\bVida Aura\b/g,'Aura de Vida'],
    [/\bResistência mágica\b/g,'Resistência Mágica'],
    [/\bPoder mágico\b/g,'Poder Mágico'],
    [/\bVelocidade de movimento\b/g,'Velocidade de Movimento'],
    [/\bVelocidade de ataque\b/g,'Velocidade de Ataque'],
    [/\bDano de ataque\b/g,'Dano de Ataque'],
    [/\bForça\b/g,'Força'],
  ];
  if(typeof ITEMS!=='undefined'){
    ITEMS.forEach(function(it){
      it.descEs=applyList(it.descEs, esRules);
      it.descPt=applyList(it.descPt, ptRules);
      if(it.searchText){
        it.searchText=String(it.searchText).replace(/resistencia un hechizos/gi,'resistencia a hechizos');
      }
    });
  }
  if(typeof HERO_DETAILS!=='undefined'){
    Object.values(HERO_DETAILS).forEach(function(hero){
      (hero.skills||[]).forEach(function(sk){
        if(sk.desc){ sk.desc.es=applyList(sk.desc.es, esRules); sk.desc.pt=applyList(sk.desc.pt, ptRules); }
        if(sk.glossary){ sk.glossary.es=applyList(sk.glossary.es, esRules); sk.glossary.pt=applyList(sk.glossary.pt, ptRules); }
      });
      if(hero.talents){
        Object.keys(hero.talents).forEach(function(k){
          const t=hero.talents[k];
          if(t.left) t.left.es=applyList(t.left.es||[], esRules);
          if(t.right) t.right.es=applyList(t.right.es||[], esRules);
        });
      }
    });
  }
})();
