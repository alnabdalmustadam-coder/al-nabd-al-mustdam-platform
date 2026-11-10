/* Read-only geometric checks for the currently selected component.
 * This file is evaluated with Playwright; it does not mutate application state.
 * Automatic overlap findings are heuristic; intentional layered art must be reviewed.
 */
(rootSelector) => {
  const root = document.querySelector(rootSelector);
  if (!root) throw new Error(`Component not found: ${rootSelector}`);
  const issues = [];
  const round = n => Math.round(n * 10) / 10;
  const norm = n => Math.round(n * 1000) / 1000;
  const box = r => ({x:round(r.x),y:round(r.y),w:round(r.width),h:round(r.height),
    top:round(r.top),left:round(r.left),right:round(r.right),bottom:round(r.bottom)});
  const rectIntersect = (a,b) => ({w:Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),
    h:Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))});
  const describe = el => {
    if (!el) return '(none)';
    const id=el.id ? '#'+el.id : '';
    const cls=typeof el.className==='string' ? '.'+el.className.trim().split(/\s+/).slice(0,2).join('.') : '';
    return el.tagName.toLowerCase()+id+(cls==='.'?'':cls);
  };
  const visible = el => {
    if (!el || !el.isConnected || el.closest('[hidden], [inert], [aria-hidden="true"], [data-pf-ignore]')) return false;
    const cs=getComputedStyle(el), r=el.getBoundingClientRect();
    return cs.display!=='none' && cs.visibility!=='hidden' && Number(cs.opacity)>0 && r.width>0.5 && r.height>0.5;
  };
  const rootRect=root.getBoundingClientRect();
  const nodes=[];
  const tw=document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (tw.nextNode() && nodes.length<1500) {
    const node=tw.currentNode, parent=node.parentElement;
    if (!node.textContent.trim() || !visible(parent)) continue;
    if (parent.closest('script,style,textarea,svg,template'))continue;
    const range=document.createRange();range.selectNodeContents(node);
    for(const r of range.getClientRects()) if(r.width>1 && r.height>1) {
      nodes.push({node,owner:parent,text:node.textContent.trim().slice(0,45),rect:r});
    }
    range.detach?.();
  }
  let collisionCount=0, clipCount=0;
  // Compare textual glyph-region rectangles, not ancestor boxes. Descendant
  // bounding boxes often overlap normally even when text does not.
  for(let i=0;i<nodes.length;i++) {
    if(collisionCount>=24)break;
    const a=nodes[i];
    for(let j=i+1;j<nodes.length;j++) {
      const b=nodes[j];
      if(a.node===b.node || a.owner===b.owner && a.text===b.text)continue;
      const hit=rectIntersect(a.rect,b.rect);
      if(hit.w>3 && hit.h>3 && hit.w*hit.h>35) {
        const suppress=a.owner.closest('[data-pf-overlap-ok]') &&
          a.owner.closest('[data-pf-overlap-ok]')===b.owner.closest('[data-pf-overlap-ok]');
        if(!suppress){
          issues.push({kind:'text-text-overlap',level:'high',element:describe(a.owner),
            other:describe(b.owner),message:`Text regions overlap ${round(hit.w)}×${round(hit.h)} CSS px`,
            sample:[a.text,b.text]});collisionCount++;
        }
      }
      if(collisionCount>=24)break;
    }
  }
  // Does a range of actual text extend beyond a clipping ancestor?
  for(const item of nodes) {
    if(clipCount>=24)break;
    let anc=item.owner;
    while(anc && root.contains(anc)) {
      const s=getComputedStyle(anc);
      const xClip=['hidden','clip'].includes(s.overflowX);
      const yClip=['hidden','clip'].includes(s.overflowY);
      if(xClip || yClip) {
        const r=anc.getBoundingClientRect();
        const inside={left:r.left+anc.clientLeft,top:r.top+anc.clientTop,
          right:r.left+anc.clientLeft+anc.clientWidth,bottom:r.top+anc.clientTop+anc.clientHeight};
        const clipX=xClip && (item.rect.left<inside.left-2 || item.rect.right>inside.right+2);
        const clipY=yClip && (item.rect.top<inside.top-2 || item.rect.bottom>inside.bottom+2);
        if(clipX || clipY) {
          const expected=!!(item.owner.closest('[data-pf-allow-clip]') ||
            s.textOverflow==='ellipsis' || s.webkitLineClamp!=='none');
          issues.push({kind:'clipped-text-inside-component',level:expected?'review':'high',
            element:describe(item.owner),clippingAncestor:describe(anc),
            message:`Visible text region extends outside ${clipX?'inline':''}${clipX&&clipY?'+':''}${clipY?'block':''} clipping box`,
            sample:item.text});clipCount++;break;
        }
      }
      if(anc===root)break;
      anc=anc.parentElement;
    }
  }
  // Non-decorative text should remain inside the component itself. Handles
  // cases where overflow:visible hides a problem from page scrollWidth tests.
  let outsideCount=0;
  for(const item of nodes){
    if(outsideCount>=16)break;
    const r=item.rect;
    const isOutside=r.left<rootRect.left-3 || r.right>rootRect.right+3 ||
      r.top<rootRect.top-3 || r.bottom>rootRect.bottom+3;
    if(isOutside && !item.owner.closest('[data-pf-allow-outside]')) {
      issues.push({kind:'text-outside-component',level:'high',element:describe(item.owner),
        message:'Text extends outside component boundaries',sample:item.text});outsideCount++;
    }
  }
  const graphics=[];
  const proportional=[...root.querySelectorAll('[data-pf-proportional]')];
  if(root.matches('[data-pf-proportional]')) proportional.unshift(root);
  for(const art of proportional.slice(0,12)){
    if(!visible(art))continue;
    const ar=art.getBoundingClientRect();
    const parts=[...art.querySelectorAll('[data-pf-part]')].filter(visible).slice(0,70);
    graphics.push({name:art.getAttribute('data-pf-proportional')||describe(art),
      size:box(ar),aspect:round(ar.width/Math.max(ar.height,0.01)),parts:parts.map(el=>{
        const r=el.getBoundingClientRect();return {name:el.getAttribute('data-pf-part')||describe(el),
          x:norm((r.left-ar.left)/ar.width),y:norm((r.top-ar.top)/ar.width),
          w:norm(r.width/ar.width),h:norm(r.height/ar.width)};
      })});
  }
  return {component:{selector:rootSelector,name:root.getAttribute('data-pf-audit')||describe(root),
    width:round(rootRect.width),height:round(rootRect.height)},
    counts:{textRegions:nodes.length,markedGraphics:graphics.length},graphics,issues};
};
