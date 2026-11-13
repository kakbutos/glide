import { drawGrid } from './packages/core/src/internal/data-grid/render/data-grid-render';
import { CompactSelection, GridCellKind } from './packages/core/src/internal/data-grid/data-grid-types';
import { getDataEditorTheme, mergeAndRealizeTheme } from './packages/core/src/common/styles';
import { RenderStateProvider } from './packages/core/src/common/render-state-provider';

import { loadingCellRenderer } from './packages/core/src/cells/loading-cell';

const none = { columns: CompactSelection.empty(), rows: CompactSelection.empty() };
const sel = (col, row) => ({ ...none, current: { cell: [col,row], range: {x:col,y:row,width:1,height:1}, rangeStack:[] } });
function setup(extra = {}) {
 const ctx = () => document.createElement('canvas').getContext('2d', {alpha:false});
 return {
  canvasCtx:ctx(),headerCanvasCtx:ctx(),bufferACtx:ctx(),bufferBCtx:ctx(),
  width:1000,height:1000,cellXOffset:1,cellYOffset:0,translateX:0,translateY:0,
  mappedColumns:Array.from({length:5},(_,i)=>({title:String(i),width:150,sourceIndex:i,sticky:i===0})),
  enableGroups:false,freezeColumns:1,theme:mergeAndRealizeTheme(getDataEditorTheme()),headerHeight:36,groupHeaderHeight:0,
  disabledRows:CompactSelection.empty(),rowHeight:32,verticalBorder:()=>true,isResizing:false,isFocused:true,
  selection:sel(3,4),fillHandle:false,freezeTrailingRows:0,hasAppendRow:false,hyperWrapping:false,rows:1000,
  getCellContent:()=>({kind:GridCellKind.Loading,allowOverlay:false}),getGroupDetails:()=>({name:''}),
  overrideCursor:()=>{},imageLoader:{setWindow:()=>{}},lastBlitData:{current:undefined},hoverValues:[],
  spriteManager:{drawSprite:()=>{}},maxScaleFactor:1,enableLowDprHairline:false,touchMode:false,
  renderStrategy:'single-buffer',enqueue:()=>{},renderStateProvider:new RenderStateProvider(),getCellRenderer:()=>loadingCellRenderer,
  minimumCellWidth:10,resizeIndicator:'none', ...extra
 } as any;
}
function pixels(a) { return a.canvasCtx.getImageData(0,0,1000,1000).data; }
function diff(a,b) { let n=0, box=[1000,1000,0,0]; for(let i=0;i<a.length;i+=4) if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]) {n++;const x=i/4%1000,y=Math.floor(i/4/1000);box=[Math.min(box[0],x),Math.min(box[1],y),Math.max(box[2],x),Math.max(box[3],y)];} return {n,box}; }

const evidenceRoot = document.getElementById('evidence')!;
function capture(a) { const c = document.createElement('canvas'); c.width=1000; c.height=1000; c.getContext('2d')!.drawImage(a.canvasCtx.canvas,0,0); return c; }
function panel(title, canvas, crop?) {
 const p=document.createElement('section'); const h=document.createElement('h3');h.textContent=title;p.append(h);
 const c=document.createElement('canvas');c.width=320;c.height=320;const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;
 if(crop)ctx.drawImage(canvas,...crop,0,0,320,320);else ctx.drawImage(canvas,0,0,1000,1000,0,0,320,320);
 p.append(c);return p;
}
function row(title, text, frames, crop?) {
 const block=document.createElement('article');const h=document.createElement('h2');h.textContent=title;block.append(h);const d=document.createElement('p');d.textContent=text;block.append(d);
 const grid=document.createElement('div');grid.className='grid';for(const [name,frame] of frames)grid.append(panel(name,frame,crop));block.append(grid);evidenceRoot.append(block);
}
const callbackA=({ctx,rect})=>{ctx.fillStyle='#2259ce';ctx.fillRect(rect.x,rect.y,rect.width,rect.height);return true;};
const callbackB=({ctx,rect})=>{ctx.fillStyle='#25864b';ctx.fillRect(rect.x,rect.y,rect.width,rect.height);return true;};
const a=setup({drawCellCallback:callbackA});drawGrid(a,undefined);const a0=capture(a);
const b={...a,selection:sel(3,5),drawCellCallback:callbackB};drawGrid(b,a);const a1=capture(b);drawGrid(b,undefined);const a2=capture(b);
row('1. Смена drawCell вместе с выделением','Ожидается зелёная заливка всех ячеек. После частичного кадра большинство ячеек сохраняют старый синий цвет.',[['До: синий callback',a0],['PR: новый callback + selection',a1],['Ожидается: полный кадр',a2]]);
const c=setup({highlightRegions:[{range:{x:1,y:15,width:1,height:2},color:'#ff000040',style:'solid'}]});drawGrid(c,undefined);const c0=capture(c);
const d={...c,selection:sel(3,5)};drawGrid(d,c);const c1=capture(d);drawGrid(d,undefined);const c2=capture(d);
row('2. Рамка рядом с закреплённой колонкой','Увеличен участок x=145…165, y=530…550. Клик в другой ячейке стирает красную левую сторону рамки серым разделителем.',[['До смены выделения',c0],['PR: после смены выделения',c1],['Ожидается: полный кадр',c2]],[145,530,20,20]);
const out=document.createElement('p');out.className='meta';out.textContent='Реальные canvas из drawGrid · PR #61 @ 4b81c9e7 · single-buffer · 1000×1000 · контроль на main 3b14e7a2: обе регрессии отсутствуют';evidenceRoot.append(out);
