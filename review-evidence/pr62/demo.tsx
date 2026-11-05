import React, { useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import DataGrid from './repo/packages/core/src/internal/data-grid/data-grid';
import { CompactSelection, GridCellKind } from './repo/packages/core/src/internal/data-grid/data-grid-types';
import { getDataEditorTheme, mergeAndRealizeTheme } from './repo/packages/core/src/common/styles';

const noop = () => {};
const theme = mergeAndRealizeTheme(getDataEditorTheme());
const selection = {rows: CompactSelection.empty(), columns: CompactSelection.empty()};
const loader = {setWindow: noop, setCallback: noop, loadOrGetImage: () => undefined};
const columns = [{title: 'Sticky merged cell',width: 290},{title:'Row',width:110}];
const base = {
 width:400,height:468,headerHeight:39,groupHeaderHeight:0,enableGroups:false,
 rowHeight:40,rows:200,cellXOffset:0,translateX:0,freezeColumns:0,freezeTrailingRows:0,
 selection,theme,columns,imageWindowLoader:loader,firstColAccessible:true,accessibilityHeight:0,
 isFocused:false,isDragging:false,isResizing:false,isFilling:false,drawFocusRing:false,
 hasAppendRow:false,resizeIndicator:'none',verticalBorder:()=>true,
 smoothScrollX:true,smoothScrollY:true,experimental:{disableAccessibilityTree:true},
 onCanvasBlur:noop,onCanvasFocused:noop,onCellFocused:noop,onKeyDown:noop,onKeyUp:noop,
 onMouseMove:noop,onMouseMoveRaw:noop,onMouseUp:noop,
};

function GridCase({id,bottom,scale=1,tall=true}:{id:string,bottom:number,scale?:number,tall?:boolean}) {
 const canvas = useRef<HTMLCanvasElement>(null), grid = useRef<any>(null), target=useRef<HTMLDivElement>(null);
 const drawn = useRef<any>(null);
 const spanEnd=tall?49:9, contentH=tall?600:100;
 const scroll=39+(spanEnd+1)*40-bottom;
 const renderer=React.useMemo(()=>({
   kind:GridCellKind.Custom,needsHover:false,needsHoverPosition:false,
   draw:({ctx,rect,cell}:any)=>{
     ctx.save();
     if(cell.spanRows){
       drawn.current={...rect};
       ctx.fillStyle='#e7efff';ctx.fillRect(rect.x+8,rect.y+4,rect.width-16,contentH-8);
       for(let offset=0;offset<contentH;offset+=tall?100:20){
         ctx.fillStyle=offset===0?'#1153bf':'#7189b8';ctx.fillRect(rect.x+12,rect.y+offset+8,rect.width-24,2);
         ctx.fillStyle='#183153';ctx.font='bold 15px Arial';ctx.fillText(`Content +${offset}px`,rect.x+18,rect.y+offset+32);
       }
       if(!tall){ctx.fillStyle='#215ecc';ctx.fillRect(rect.x+18,rect.y+65,210,25);ctx.fillStyle='white';ctx.font='12px Arial';ctx.fillText('Click here (content Y 65–90)',rect.x+25,rect.y+82);}
     } else {ctx.fillStyle='#54647c';ctx.font='13px Arial';ctx.fillText(`Row ${cell.data.row}`,rect.x+12,rect.y+25);}
     ctx.restore();
   }
 }),[tall]);
 const content=React.useCallback(([c,r]:number[])=>({kind:GridCellKind.Custom,allowOverlay:false,copyData:'',data:{row:r},
   ...(c===0&&r<=spanEnd?{spanRows:[0,spanEnd],spanAlign:{sticky:true,vertical:'top',stickyContentHeight:contentH}}:{})
 }),[spanEnd,contentH]);
 useEffect(()=>{
   const timer=setInterval(()=>{
     if(!canvas.current||!drawn.current||!grid.current)return;
     const cr=canvas.current.getBoundingClientRect();
     const b=grid.current.getContentBounds(0,0);
     const d=drawn.current;
     const actual={y:Math.round(d.y*scale*100)/100,height:Math.round(d.height*scale*100)/100};
     const bounds={y:Math.round((b.y-cr.y)*100)/100,height:Math.round(b.height*100)/100};
     document.getElementById(id+'-draw')!.textContent=`draw: y=${actual.y}, height=${actual.height}`;
     document.getElementById(id+'-bounds')!.textContent=`getContentBounds: y=${bounds.y}, height=${bounds.height}`;
     document.getElementById(id+'-logical')!.textContent=`render rect: y=${d.y}, height=${d.height}`;
   },100);
   return()=>clearInterval(timer);
 },[id,scale,bottom]);
 const click=(args:any)=>{
   if(args.kind!=='cell'||!canvas.current||!drawn.current)return;
   const actualY=args.localEventY+(args.bounds.y-canvas.current.getBoundingClientRect().y)-drawn.current.y*scale;
   const expectedLogical=actualY/scale;
   const actualLogical=args.localEventY/scale;
   document.getElementById(id+'-click')!.textContent=`CLICK: content Y=${expectedLogical.toFixed(1)}; event Y / scale=${actualLogical.toFixed(1)} → ${actualLogical>=65&&actualLogical<=90?'HIT':'MISS'}`;
 };
 return <section><h2>{id}</h2><p>block bottom = {bottom}px · content = {contentH}px · CSS scale = {scale}</p>
   <div style={{width:400*scale,height:tall?468:220,overflow:'hidden',position:'relative',border:'1px solid #a7b5cc'}}>
     <div ref={target} style={{width:400,height:468,position:'relative',transform:`scale(${scale})`,transformOrigin:'0 0'}}>
       <DataGrid {...base as any} ref={grid} canvasRef={canvas} eventTargetRef={target} cellYOffset={Math.floor(scroll/40)} translateY={-(scroll%40)} getCellContent={content as any} getCellRenderer={()=>renderer as any} onMouseDown={click}/>
     </div>
   </div>
   <pre id={id+'-logical'}></pre><pre id={id+'-draw'}></pre><pre id={id+'-bounds'}></pre><pre className="bad" id={id+'-click'}>{tall ? "Expected content height: 600px" : "Click the blue button to compare coordinates."}</pre>
 </section>;
}
function App(){
 const [mode,setMode]=useState('jump'),[bottom,setBottom]=useState(469);
 return <main><h1>Glide PR #62 — reproduction on actual DataGrid</h1><p className="meta">Unmodified source · commit 84e40e3b · body viewport 40…468px · custom canvas renderer</p>
 <nav><button onClick={()=>setMode('jump')}>1. Tall content / 1px scroll</button><button onClick={()=>setMode('scale')}>2. CSS scale / click bounds</button></nav>
 {mode==='jump'?<><p className="note">Two grid positions, separated by just 1px of scrolling. The +200px marker jumps up by 172px.</p><div className="pair"><GridCase id="Before: bottom 469" bottom={469}/><GridCase id="After: bottom 468" bottom={468}/></div></>:<><p className="note">Same grid geometry. Click the blue button: event coordinates should match the drawn content after scale conversion.</p><div className="pair"><GridCase id="Control: scale 1" bottom={100} tall={false}/><GridCase id="Bug: scale 2" bottom={100} tall={false} scale={2}/></div></>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
