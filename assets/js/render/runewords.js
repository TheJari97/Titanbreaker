window.RenderRunewords = function(){
  const root=document.getElementById('pageRoot');
  root.innerHTML = `<div class="section-card"><div class="rune-grid">${RUNEWORDS.map(r=>`<article class="rune-card"><img src="${r.image}" alt=""><div><div class="rune-title">${AppUtils.lang()==='es'?r.titleEs:AppUtils.lang()==='pt'?r.titlePt:r.title}</div><div class="rune-lines"><div>${AppUtils.lang()==='es'?r.bonusEs:AppUtils.lang()==='pt'?r.bonusPt:r.bonus}</div><div>${AppUtils.lang()==='es'?r.maxEs:AppUtils.lang()==='pt'?r.maxPt:r.max}</div></div></div></article>`).join('')}</div></div>`;
};
