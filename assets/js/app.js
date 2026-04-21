(function(){
  function getPage(){ return document.body.dataset.page || 'guide'; }
  function renderCurrent(){
    const page=getPage();
    CommonUI.setupShell(page);
    if(page==='guide') RenderGuide();
    else if(page==='items') RenderItems.render();
    else if(page==='crafts') RenderCrafts.render();
    else if(page==='runewords') RenderRunewords();
    else if(page==='pathtrees') RenderPaths.render();
    else if(page==='heroes') RenderHeroes.render();
  }
  function bootstrap(){
    const page=getPage();
    CommonUI.setupShell(page);
    CommonUI.setupInteractions(page, value=>{
      if(page==='items') RenderItems.setSearch(value);
      if(page==='crafts') RenderCrafts.setSearch(value);
    }, ()=>{ if(page==='items') RenderItems.toggleFilters(); if(page==='crafts') RenderCrafts.toggleFilters(); });
    renderCurrent();
    window.addEventListener('tb:langchange', renderCurrent);
  }
  bootstrap();
})();
