window.RenderPaths = (function(){
  function talentRows(tree){
    return TALENTS.filter(talent => talent.tree === tree)
      .sort((a,b)=>a.id-b.id)
      .reduce((rows, talent, index) => {
        const row = Math.floor(index / 3);
        (rows[row] = rows[row] || []).push(talent);
        return rows;
      }, []);
  }

  function spentInTree(tree){
    return Object.entries(AppState.talentLevels)
      .filter(([id, level]) => level && TALENTS.find(talent => talent.id === Number(id) && talent.tree === tree))
      .reduce((sum, [, level]) => sum + level, 0);
  }

  function availableForRow(tree, rowIndex){ return spentInTree(tree) >= rowIndex * 3; }
  function isNextRow(tree, rowIndex){ const spent = spentInTree(tree); return rowIndex > 0 && !availableForRow(tree, rowIndex) && spent >= (rowIndex - 1) * 3; }
  function pointsLeft(){ return 43 + AppState.bonusPoints - Object.values(AppState.talentLevels).reduce((sum, level)=>sum+level,0); }

  function increase(id){
    const talent = TALENTS.find(entry => entry.id === id); if(!talent) return;
    const rows = talentRows(talent.tree);
    const flat = rows.flat();
    const index = flat.findIndex(entry => entry.id === id);
    const row = Math.floor(index / 3);
    if(!availableForRow(talent.tree, row)) return;
    if(pointsLeft() <= 0) return;
    AppState.talentLevels[id] = AppState.talentLevels[id] || 0;
    if(AppState.talentLevels[id] >= 3) return;
    AppState.talentLevels[id] += 1;
    render();
  }

  function decrease(id){
    if(!AppState.talentLevels[id]) return;
    AppState.talentLevels[id] -= 1;
    if(AppState.talentLevels[id] <= 0) delete AppState.talentLevels[id];
    render();
  }

  function renderTalentCard(talent){
    return `<div class="talent hover-talent" data-talent="${talent.id}"><img src="${talent.image}" alt="${talent.name}"><div class="talent-lvl">${AppState.talentLevels[talent.id]||0} / 3</div></div>`;
  }

  function renderTree(tree){
    const rows = talentRows(tree);
    if(!rows.length){
      return `<section class="path-tree" style="--tree-bg:${TREE_BACKGROUNDS[tree]||TREE_BACKGROUNDS[1]}"><div class="tree-title">${TREE_NAMES[tree] || ('Tree ' + tree)}</div><div class="path-empty">${AppUtils.lang()==='es'?'Datos pendientes de este árbol':AppUtils.lang()==='pt'?'Dados pendentes desta árvore':'Tree data pending'}</div></section>`;
    }
    const rowHtml = rows.map((row, rowIndex) => {
      const available = availableForRow(tree, rowIndex);
      const next = isNextRow(tree, rowIndex);
      return `<div class="path-row ${available?'available':''} ${next?'next':''} ${!available?'locked':''}">${row.map(renderTalentCard).join('')}</div>`;
    }).join('');
    return `<section class="path-tree" style="--tree-bg:${TREE_BACKGROUNDS[tree]||TREE_BACKGROUNDS[1]}"><div class="tree-title">${TREE_NAMES[tree] || ('Tree ' + tree)}</div><div class="path-rows">${rowHtml}</div></section>`;
  }

  function bindHorizontalWheel(strip){
    if(!strip) return;
    strip.addEventListener('wheel', event => {
      if(Math.abs(event.deltaY) > Math.abs(event.deltaX)){
        strip.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    }, { passive:false });
  }

  function render(){
    const root = document.getElementById('pageRoot');
    const trees = [1,2,3,4,5,6,7,8,9,10].map(renderTree).join('');
    root.innerHTML = `<div class="section-card"><div class="paths-toolbar"><div class="count-badge">${AppUtils.t('pointsLeft')}: <strong>${pointsLeft()}</strong></div><div class="count-badge">${AppUtils.t('bonusPoints')}: <strong>${AppState.bonusPoints}</strong></div><button class="btn" id="bonusPlus">+1</button><button class="btn" id="bonusMinus">-1</button><button class="btn" id="resetTalents">${AppUtils.t('reset')}</button></div><div class="path-strip" id="pathStrip">${trees}</div></div>`;

    root.querySelectorAll('.talent').forEach(element => {
      element.onclick = () => increase(Number(element.dataset.talent));
      element.oncontextmenu = event => { event.preventDefault(); decrease(Number(element.dataset.talent)); };
    });
    CommonUI.bindHover('.hover-talent', element => {
      const talent = TALENTS.find(entry => entry.id === Number(element.dataset.talent));
      if(!talent) return '';
      const desc = AppUtils.lang()==='es' ? (talent.descEs || talent.desc) : AppUtils.lang()==='pt' ? (talent.descPt || talent.desc) : talent.desc;
      return `<div class="tooltip-head"><img src="${talent.image}" alt=""><div><div class="tooltip-title">${talent.name}</div><div class="tooltip-sub">${TREE_NAMES[talent.tree]||''}</div></div></div><div class="tooltip-body"><ul><li>${desc}</li></ul></div>`;
    });
    document.getElementById('bonusPlus').onclick = () => { AppState.bonusPoints = Math.min(6, AppState.bonusPoints + 1); render(); };
    document.getElementById('bonusMinus').onclick = () => { AppState.bonusPoints = Math.max(0, AppState.bonusPoints - 1); render(); };
    document.getElementById('resetTalents').onclick = () => { AppState.talentLevels = {}; AppState.bonusPoints = 0; render(); };
    bindHorizontalWheel(document.getElementById('pathStrip'));
  }

  return { render };
})();
