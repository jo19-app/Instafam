import { useState, useEffect, useRef, useCallback } from "react";

const P = {
  bg:"#FFF8F2", card:"#FFFFFF", primary:"#E8603C", light:"#F4956F",
  accent:"#F7C59F", dark:"#C94C1E", text:"#1A1208", muted:"#8A7568", border:"#F0E6DC",
};

const AVATARS = [
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Felix&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Aneka&backgroundColor=d1f4e0",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Charlie&backgroundColor=dbeafe",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Dana&backgroundColor=fef9c3",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Eli&backgroundColor=ede9fe",
];
const PHOTOS = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80",
  "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=600&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
];
const MOODS = ["😊 Happy","😂 Laughing","😍 In love","🥰 Grateful","😌 Peaceful","🤩 Excited","😎 Cool","🥳 Celebrating","😴 Tired","🤔 Thinking","😤 Determined","🌟 Inspired","☕ Caffeinated"];
const HAIR  = ["Blonde","Brown","Black","Red","Auburn","Grey","White","Silver","Blue","Pink","Purple","Bald","Other"];
const FILTERS = [
  {name:"None",   css:"none"},
  {name:"Warm",   css:"sepia(0.4) saturate(1.3) brightness(1.05)"},
  {name:"Cool",   css:"hue-rotate(20deg) saturate(1.2) brightness(1.05)"},
  {name:"B&W",    css:"grayscale(1)"},
  {name:"Vivid",  css:"saturate(2) contrast(1.1)"},
  {name:"Fade",   css:"opacity(0.8) brightness(1.15) contrast(0.85)"},
  {name:"Drama",  css:"contrast(1.4) brightness(0.9)"},
];
const STICKERS = ["❤️","😂","🔥","✨","🎉","🌟","💫","🥰","👏","🎊","💕","😍","🌈","🦋","🌺"];

const LOGO_SRC = "data:image/png;base64,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";


// ── Helpers ───────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2,10); }
function ago(ts) {
  const d=(Date.now()-ts)/1000;
  if(d<60) return "just now";
  if(d<3600) return `${Math.floor(d/60)}m ago`;
  if(d<86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}
// Compress + resize any image to max 1200px / 0.82 quality before storing.
// This prevents blank pages from large files overflowing localStorage or stalling the UI.
function compressImage(file, maxPx=1200, quality=0.82) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = ev => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        try {
          // Work out new dimensions keeping aspect ratio
          let {width:w, height:h} = img;
          if (w > maxPx || h > maxPx) {
            if (w >= h) { h = Math.round(h * maxPx / w); w = maxPx; }
            else        { w = Math.round(w * maxPx / h); h = maxPx; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          res(canvas.toDataURL("image/jpeg", quality));
        } catch(e) { rej(e); }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
// Keep readFile for non-image uses
function readFile(file) {
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(file); });
}
async function saveImage(src,filename="instafam.jpg") {
  try {
    if(src.startsWith("data:")) { const a=document.createElement("a"); a.href=src; a.download=filename; a.click(); return {ok:true}; }
    let url=src;
    if(src.includes("unsplash.com")) { url=src.replace(/[?&]w=\d+/,"").replace(/[?&]q=\d+/,""); url+=(url.includes("?")?"&":"?")+"q=100&fm=jpg&fit=max"; }
    const blob=await fetch(url).then(r=>{ if(!r.ok) throw 0; return r.blob(); });
    const bu=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=bu; a.download=filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(bu),5000);
    return {ok:true};
  } catch { window.open(src,"_blank"); return {ok:false,fallback:true}; }
}

// ── Notification helpers ──────────────────────────────────────────────────────
const NOTIF_KEY="if_notif_prefs";
function loadNotifPrefs() { try{return JSON.parse(localStorage.getItem(NOTIF_KEY))||{};}catch{return {};} }
function saveNotifPrefs(p) { localStorage.setItem(NOTIF_KEY,JSON.stringify(p)); }
function defaultPrefs(groups) {
  const p={globalEnabled:true,groups:{}};
  (groups||[]).forEach(g=>{p.groups[g.id]={posts:true,stories:true,likes:true,comments:true};});
  return p;
}
async function registerSW() { if(!("serviceWorker" in navigator)) return null; try{ return await navigator.serviceWorker.register("/sw.js"); }catch{return null;} }
async function requestNotifPermission() { if(!("Notification" in window)) return "unsupported"; if(Notification.permission==="granted") return "granted"; return Notification.requestPermission(); }
async function sendNotifViaSW(payload) { if(!("serviceWorker" in navigator)) return; try{ const reg=await navigator.serviceWorker.ready; reg?.active?.postMessage(payload); }catch{} }

// ── Seed data ─────────────────────────────────────────────────────────────────
function seedData(myId,myName) {
  const members=[
    {id:myId,  name:myName,  avatar:AVATARS[0],nickname:"",     age:"",  mood:"😊 Happy",      hairColour:"Brown", bio:""},
    {id:"u2",  name:"Mom",   avatar:AVATARS[1],nickname:"Mama Bear",age:"52",mood:"🥰 Grateful",  hairColour:"Brown", bio:"Loves gardening and baking 🌻"},
    {id:"u3",  name:"Dad",   avatar:AVATARS[2],nickname:"The Chef", age:"55",mood:"☕ Caffeinated",hairColour:"Grey",  bio:"Weekend BBQ king 🔥"},
    {id:"u4",  name:"Sibling",avatar:AVATARS[3],nickname:"Sis",    age:"24",mood:"😎 Cool",       hairColour:"Blonde",bio:"Music, travel, coffee ✈️"},
  ];
  const gId=uid();
  return {
    groups:[{id:gId,name:"Family ❤️",emoji:"❤️",members:members.map(m=>m.id),inviteCode:uid(),createdBy:myId,pendingMembers:[]}],
    members,
    posts:[
      {id:uid(),groupId:gId,authorId:"u2",image:PHOTOS[0],caption:"Beautiful sunset from the back garden 🌅",likes:["u3","u4"],comments:[{id:uid(),authorId:"u3",text:"Gorgeous! 😍",ts:Date.now()-7200000}],ts:Date.now()-14400000},
      {id:uid(),groupId:gId,authorId:"u4",image:PHOTOS[3],caption:"Family game night 🎲 Who's ready for a rematch?",likes:[myId,"u2"],comments:[{id:uid(),authorId:myId,text:"I want a rematch! 😂",ts:Date.now()-3600000},{id:uid(),authorId:"u2",text:"Count me in!",ts:Date.now()-1800000}],ts:Date.now()-86400000},
    ],
    stories:[
      {id:uid(),groupId:gId,authorId:"u3",image:PHOTOS[4],ts:Date.now()-3600000,viewers:[]},
      {id:uid(),groupId:gId,authorId:"u2",image:PHOTOS[5],ts:Date.now()-7200000,viewers:[]},
    ],
    chats:[],
  };
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S={
  app:   {fontFamily:"'Nunito',sans-serif",background:P.bg,minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative",overflowX:"hidden"},
  topBar:{position:"sticky",top:0,zIndex:100,background:"rgba(255,248,242,0.95)",backdropFilter:"blur(14px)",borderBottom:`1.5px solid ${P.border}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8},
  nav:   {position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(255,248,242,0.97)",backdropFilter:"blur(16px)",borderTop:`1.5px solid ${P.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 env(safe-area-inset-bottom,10px)",zIndex:100},
  navBtn:a=>({background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:a?P.primary:P.muted,fontSize:10,fontWeight:a?800:500,padding:"4px 12px",transition:"color 0.2s"}),
  btn:   {background:`linear-gradient(135deg,${P.primary},${P.dark})`,color:"#fff",border:"none",borderRadius:24,padding:"10px 22px",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"},
  ghost: {background:"transparent",color:P.primary,border:`2px solid ${P.primary}`,borderRadius:24,padding:"8px 20px",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"},
  input: {width:"100%",border:`1.5px solid ${P.border}`,borderRadius:14,padding:"12px 16px",fontFamily:"'Nunito',sans-serif",fontSize:15,background:P.card,outline:"none",boxSizing:"border-box",color:P.text},
  card:  {background:P.card,borderRadius:20,boxShadow:"0 2px 14px rgba(232,96,60,0.08)",overflow:"hidden",marginBottom:16},
  av:    s=>({width:s,height:s,borderRadius:"50%",objectFit:"cover",flexShrink:0}),
};

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo({height=32}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <img src={LOGO_SRC} alt="InstaFam" style={{height,width:height,borderRadius:height*0.22,objectFit:"cover",boxShadow:"0 2px 8px rgba(232,96,60,0.25)",flexShrink:0}}/>
      <span style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:height*0.78,background:"linear-gradient(135deg,#1a3a6e,#00b4cc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-0.5}}>
        Insta<span style={{background:"linear-gradient(135deg,#00b4cc,#00d4aa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Fam</span>
      </span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({n,size=22,color="currentColor",filled=false}) {
  const I={
    heart:    filled?<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color}/>:<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>,
    comment:  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>,
    send:     <><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 10 12 15 17 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    camera:   <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" fill="none" stroke={color} strokeWidth="2"/></>,
    close:    <><line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    back:     <polyline points="15 18 9 12 15 6" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>,
    link:     <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    check:    <polyline points="20 6 9 17 4 12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>,
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    trash:    <><polyline points="3 6 5 6 21 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    people:   <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke={color} strokeWidth="2"/><circle cx="9" cy="7" r="4" fill="none" stroke={color} strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    profile:  <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke={color} strokeWidth="2"/><circle cx="12" cy="7" r="4" fill="none" stroke={color} strokeWidth="2"/></>,
    info:     <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/><line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    chat:     <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={filled?"currentColor":"none"} stroke={color} strokeWidth="2" strokeLinejoin="round"/></>,
    more:     <><circle cx="12" cy="12" r="1" fill={color}/><circle cx="19" cy="12" r="1" fill={color}/><circle cx="5" cy="12" r="1" fill={color}/></>,
    text:     <><path d="M4 7V4h16v3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 20h6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    sticker:  <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/><path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke={color} strokeWidth="3" strokeLinecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke={color} strokeWidth="3" strokeLinecap="round"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{display:"block",flexShrink:0}}>{I[n]||null}</svg>;
}

function Av({src,size=36,border,style={}}) {
  return <img src={src||AVATARS[0]} alt="" style={{...S.av(size),border:border||"none",...style}} onError={e=>{e.target.onerror=null;e.target.src=AVATARS[0];}}/>;
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({on,onChange,disabled=false}) {
  return (
    <button onClick={()=>!disabled&&onChange(!on)}
      style={{width:48,height:28,borderRadius:14,background:on&&!disabled?P.primary:P.border,border:"none",cursor:disabled?"default":"pointer",position:"relative",transition:"background 0.2s",flexShrink:0,opacity:disabled?0.45:1}}>
      <div style={{position:"absolute",top:3,left:on?23:3,width:22,height:22,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",transition:"left 0.2s"}}/>
    </button>
  );
}

// ── Story Ring ────────────────────────────────────────────────────────────────
function StoryRing({avatar,name,onClick,seen=false}) {
  return (
    <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"4px 6px",minWidth:64}}>
      <div style={{padding:2.5,borderRadius:"50%",background:seen?P.border:`linear-gradient(135deg,${P.primary},${P.accent})`}}>
        <div style={{padding:2,borderRadius:"50%",background:P.bg}}>
          <Av src={avatar} size={52} style={{display:"block"}}/>
        </div>
      </div>
      <span style={{fontSize:11,fontWeight:600,color:P.text,maxWidth:60,textAlign:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</span>
    </button>
  );
}

// ── Story Viewer ──────────────────────────────────────────────────────────────
function StoryViewer({story,author,onClose,canDelete,onDelete}) {
  useEffect(()=>{const t=setTimeout(onClose,5000);return()=>clearTimeout(t);},[story.id]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:"#000"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.3)",zIndex:1}}>
        <div style={{height:"100%",background:"#fff",animation:"sp 5s linear forwards"}}/>
      </div>
      <style>{`@keyframes sp{from{width:0}to{width:100%}}`}</style>
      <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Av src={author?.avatar} size={36}/>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{author?.name}</div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{ago(story.ts)}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {canDelete&&<button onClick={onDelete} style={{background:"rgba(192,57,43,0.8)",border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑 Delete</button>}
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color="#fff" size={26}/></button>
        </div>
      </div>
      <img src={story.image} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="story"/>
    </div>
  );
}

// ── Image Editor ─────────────────────────────────────────────────────────────
// Full drag (touch + mouse), bin zone, filters, text, stickers
function ImageEditor({image,onSave,onCancel}) {
  const canvasRef  = useRef();
  const containerRef = useRef();
  const [filter,setFilter]   = useState(0);
  const [items,setItems]     = useState([]); // [{id,type:"text"|"sticker",content,x,y,color,size}]
  const [addingText,setAddingText] = useState(false);
  const [textVal,setTextVal] = useState("");
  const [textColor,setTextColor] = useState("#ffffff");
  const [draggingId,setDraggingId]   = useState(null);
  const [overBin,setOverBin]         = useState(false);
  const dragStart = useRef({mx:0,my:0,ix:0,iy:0});

  // ── Pointer helpers ────────────────────────────────────────────────────────
  function clientPos(e) {
    if(e.touches&&e.touches.length>0) return {x:e.touches[0].clientX, y:e.touches[0].clientY};
    return {x:e.clientX, y:e.clientY};
  }

  function startDrag(e,id) {
    e.stopPropagation();
    e.preventDefault();
    const {x,y} = clientPos(e);
    const item = items.find(i=>i.id===id);
    if(!item) return;
    dragStart.current = {mx:x, my:y, ix:item.x, iy:item.y};
    setDraggingId(id);
  }

  function onMove(e) {
    if(!draggingId) return;
    e.preventDefault();
    const {x,y} = clientPos(e);
    const box = containerRef.current?.getBoundingClientRect();
    if(!box) return;
    const dx = x - dragStart.current.mx;
    const dy = y - dragStart.current.my;
    const newX = Math.max(0, Math.min(100, dragStart.current.ix + (dx/box.width)*100));
    const newY = Math.max(0, Math.min(100, dragStart.current.iy + (dy/box.height)*100));
    setItems(its => its.map(i => i.id===draggingId ? {...i,x:newX,y:newY} : i));
    // Check if over bin (bottom-center zone)
    const binY = box.bottom - 60;
    const binXL = box.left  + box.width*0.35;
    const binXR = box.right - box.width*0.35;
    setOverBin(y > binY && x > binXL && x < binXR);
  }

  function endDrag(e) {
    if(!draggingId) return;
    if(overBin) {
      setItems(its => its.filter(i => i.id!==draggingId));
    }
    setDraggingId(null);
    setOverBin(false);
  }

  // ── Add items ──────────────────────────────────────────────────────────────
  function addText() {
    if(!textVal.trim()) return;
    setItems(its=>[...its,{id:uid(),type:"text",content:textVal,x:50,y:40,color:textColor,size:24}]);
    setTextVal(""); setAddingText(false);
  }
  function addSticker(emoji) {
    setItems(its=>[...its,{id:uid(),type:"sticker",content:emoji,x:50,y:40,size:40}]);
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  function exportImage() {
    const c = canvasRef.current;
    function render(imgEl) {
      c.width  = imgEl.naturalWidth  || 800;
      c.height = imgEl.naturalHeight || 800;
      const ctx = c.getContext("2d");
      ctx.filter = FILTERS[filter].css === "none" ? "none" : FILTERS[filter].css;
      ctx.drawImage(imgEl, 0, 0);
      ctx.filter = "none";
      items.forEach(item => {
        const px = (item.x/100)*c.width;
        const py = (item.y/100)*c.height;
        if(item.type==="sticker") {
          ctx.font = `${item.size * c.width/400}px serif`;
          ctx.fillText(item.content, px, py);
        } else {
          const fs = item.size * c.width/400;
          ctx.font = `bold ${fs}px sans-serif`;
          ctx.fillStyle   = item.color;
          ctx.strokeStyle = "rgba(0,0,0,0.55)";
          ctx.lineWidth   = fs * 0.08;
          ctx.strokeText(item.content, px, py);
          ctx.fillText(item.content, px, py);
        }
      });
      try { onSave(c.toDataURL("image/jpeg", 0.92)); }
      catch { onSave(image); }
    }
    if(image.startsWith("data:")) {
      const img = new Image(); img.onload = ()=>render(img); img.src = image;
    } else {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload  = ()=>render(img);
      img.onerror = ()=>onSave(image);
      img.src = image;
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const imgStyle = {
    width:"100%", display:"block", borderRadius:10,
    filter: FILTERS[filter].css, userSelect:"none", pointerEvents:"none",
    WebkitUserSelect:"none",
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:600,background:"#111",display:"flex",flexDirection:"column",touchAction:"none"}}
      onMouseMove={onMove} onMouseUp={endDrag}
      onTouchMove={onMove} onTouchEnd={endDrag}>
      <canvas ref={canvasRef} style={{display:"none"}}/>

      {/* Top bar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"rgba(0,0,0,0.75)",flexShrink:0}}>
        <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",color:"#fff",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14}}>Cancel</button>
        <span style={{color:"#fff",fontWeight:800,fontSize:16}}>✏️ Edit Photo</span>
        <button onClick={exportImage} style={{...S.btn,padding:"7px 18px",fontSize:13}}>Done</button>
      </div>

      {/* Scrollable content */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* Canvas area — touch/drag zone */}
        <div ref={containerRef} style={{position:"relative",margin:"10px 12px 0",borderRadius:12,overflow:"hidden",flexShrink:0}}>
          <img src={image} alt="edit" style={imgStyle} draggable={false}/>

          {/* Draggable items */}
          {items.map(item=>(
            <div key={item.id}
              style={{
                position:"absolute",
                left:`${item.x}%`, top:`${item.y}%`,
                transform:"translate(-50%,-50%)",
                cursor: draggingId===item.id?"grabbing":"grab",
                userSelect:"none", WebkitUserSelect:"none",
                fontSize: item.type==="sticker" ? item.size : item.size,
                color: item.type==="text" ? item.color : undefined,
                fontWeight: item.type==="text" ? 800 : undefined,
                textShadow: item.type==="text" ? "0 1px 6px rgba(0,0,0,0.8)" : undefined,
                whiteSpace:"nowrap",
                lineHeight:1,
                zIndex: draggingId===item.id ? 20 : 10,
                opacity: draggingId===item.id && overBin ? 0.4 : 1,
                transition: "opacity 0.15s",
                WebkitTouchCallout:"none",
              }}
              onMouseDown={e=>startDrag(e,item.id)}
              onTouchStart={e=>startDrag(e,item.id)}
            >
              {item.content}
            </div>
          ))}

          {/* Bin zone — appears at bottom when dragging */}
          {draggingId&&(
            <div style={{
              position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",
              width:"30%",padding:"10px 0",borderRadius:"12px 12px 0 0",
              background: overBin?"rgba(192,57,43,0.85)":"rgba(0,0,0,0.55)",
              display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              transition:"background 0.15s",zIndex:30,
            }}>
              <span style={{fontSize:22}}>🗑</span>
              <span style={{color:"#fff",fontSize:10,fontWeight:700}}>{overBin?"Release to remove":"Drag here"}</span>
            </div>
          )}
        </div>

        <p style={{color:"rgba(255,255,255,0.35)",fontSize:11,textAlign:"center",margin:"6px 0 4px"}}>
          Drag items to move · drop on 🗑 to remove
        </p>

        {/* Add text panel */}
        {addingText&&(
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:14,padding:14,margin:"0 12px 10px"}}>
            <input value={textVal} onChange={e=>setTextVal(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addText()}
              placeholder="Type your text…" autoFocus
              style={{...S.input,background:"rgba(255,255,255,0.15)",color:"#fff",border:"1.5px solid rgba(255,255,255,0.2)",marginBottom:10}}/>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {["#ffffff","#ffcc00","#ff4444","#44ff88","#44aaff","#ff44cc","#000000"].map(c=>(
                <button key={c} onClick={()=>setTextColor(c)}
                  style={{width:28,height:28,borderRadius:"50%",background:c,
                    border:`3px solid ${textColor===c?"#fff":"transparent"}`,
                    cursor:"pointer",flexShrink:0,boxShadow:textColor===c?"0 0 0 2px rgba(255,255,255,0.3)":"none"}}/>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addText} style={{...S.btn,flex:1,fontSize:13,padding:"8px 0"}}>Add Text</button>
              <button onClick={()=>setAddingText(false)} style={{background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",borderRadius:24,padding:"8px 0",flex:1,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{padding:"0 12px",marginBottom:10}}>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Filters</p>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
            {FILTERS.map((f,i)=>(
              <button key={f.name} onClick={()=>setFilter(i)}
                style={{background:"none",border:`2px solid ${filter===i?P.primary:"rgba(255,255,255,0.2)"}`,
                  borderRadius:10,padding:"4px 6px",cursor:"pointer",flexShrink:0,textAlign:"center"}}>
                <div style={{width:50,height:50,borderRadius:6,overflow:"hidden",marginBottom:3}}>
                  <img src={image} style={{width:"100%",height:"100%",objectFit:"cover",filter:f.css}} alt={f.name} draggable={false}/>
                </div>
                <span style={{color:filter===i?P.primary:"rgba(255,255,255,0.65)",fontSize:10,fontWeight:700}}>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar — text + stickers */}
        <div style={{padding:"0 12px",marginBottom:20}}>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Add</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={()=>setAddingText(true)}
              style={{background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.2)",
                borderRadius:20,padding:"8px 14px",color:"#fff",fontFamily:"'Nunito',sans-serif",
                fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <Icon n="text" color="#fff" size={15}/> Text
            </button>
            {STICKERS.map(s=>(
              <button key={s} onClick={()=>addSticker(s)}
                style={{background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(255,255,255,0.15)",
                  borderRadius:10,padding:"6px 8px",fontSize:20,cursor:"pointer",lineHeight:1}}>
                {s}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}


// ── Image Picker ──────────────────────────────────────────────────────────────
// The <input type="file"> is rendered at full size, opacity:0, on top of the
// styled div — both inside a position:relative wrapper. The user's finger
// lands directly on the invisible input. No programmatic .click() anywhere.
function ImagePicker({onPick,label="Choose from Photo Library",hint=""}) {
  async function handle(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      // Compress before use — prevents blank pages with large camera/library images
      const d = await compressImage(f);
      onPick(d);
    } catch(err) {
      console.error("ImagePicker error:", err);
      // Last-resort fallback: try raw read
      try {
        const r = new FileReader();
        r.onload = ev => onPick(ev.target.result);
        r.readAsDataURL(f);
      } catch(e2) { console.error("Fallback read failed:", e2); }
    }
    e.target.value = "";
  }
  return (
    <div style={{position:"relative",width:"100%",borderRadius:16,overflow:"hidden",marginBottom:0}}>
      {/* Visible styled layer */}
      <div style={{
        width:"100%",border:`2px dashed ${P.primary}`,borderRadius:16,
        padding:"24px 16px",background:`${P.primary}08`,
        display:"flex",flexDirection:"column",alignItems:"center",gap:8,
      }}>
        <Icon n="camera" color={P.primary} size={30}/>
        <span style={{fontWeight:700,fontSize:15,color:P.primary}}>{label}</span>
        <span style={{fontSize:12,color:P.muted}}>Camera also available once picker opens</span>
        {hint&&<span style={{fontSize:12,color:P.muted}}>{hint}</span>}
      </div>
      {/* Invisible input stretched over the entire button — direct tap target */}
      <input
        type="file"
        accept="image/*"
        onChange={handle}
        style={{
          position:"absolute",
          inset:0,
          width:"100%",
          height:"100%",
          opacity:0,
          cursor:"pointer",
          fontSize:0,
        }}
      />
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({groupId,myId,onPost,onStory,onClose}) {
  const [tab,setTab]=useState("post"); const [image,setImage]=useState(null);
  const [editedImage,setEditedImage]=useState(null); const [caption,setCaption]=useState("");
  const [editing,setEditing]=useState(false);
  const finalImage = editedImage || image;

  function submit() {
    if(!finalImage) return;
    if(tab==="post") onPost({id:uid(),groupId,authorId:myId,image:finalImage,caption,likes:[],comments:[],ts:Date.now()});
    else onStory({id:uid(),groupId,authorId:myId,image:finalImage,ts:Date.now(),viewers:[]});
    onClose();
  }

  if(editing) return <ImageEditor image={image||''} onSave={d=>{setEditedImage(d);setEditing(false);}} onCancel={()=>setEditing(false)}/>;

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:P.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:24,paddingBottom:"env(safe-area-inset-bottom,24px)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontWeight:900,fontSize:20,color:P.primary}}>New {tab}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color={P.muted}/></button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {["post","story"].map(t=><button key={t} onClick={()=>setTab(t)} style={{...(tab===t?S.btn:S.ghost),flex:1,padding:"8px 0",textTransform:"capitalize"}}>{t}</button>)}
        </div>
        {finalImage?(
          <div style={{position:"relative",marginBottom:12}}>
            <img src={finalImage} style={{width:"100%",borderRadius:16,objectFit:"cover",maxHeight:300,display:"block"}} alt="preview"/>
            <div style={{position:"absolute",top:8,right:8,display:"flex",gap:6}}>
              <button onClick={()=>setEditing(true)} style={{background:"rgba(0,0,0,0.6)",border:"none",borderRadius:20,padding:"5px 10px",color:"#fff",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                <Icon n="edit" color="#fff" size={13}/> Edit
              </button>
              <button onClick={()=>{setImage(null);setEditedImage(null);}} style={{background:"rgba(0,0,0,0.55)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon n="close" color="#fff" size={16}/>
              </button>
            </div>
          </div>
        ):(
          <div style={{marginBottom:16}}>
            <ImagePicker onPick={setImage} hint="Only visible to this group"/>
            <button onClick={()=>setImage(PHOTOS[Math.floor(Math.random()*PHOTOS.length)])} style={{...S.ghost,width:"100%",fontSize:13,padding:"9px 0",marginTop:10}}>🖼 Use Sample Photo</button>
          </div>
        )}
        {tab==="post"&&<textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write a caption…" style={{...S.input,minHeight:80,resize:"none",marginBottom:16}}/>}
        <button onClick={submit} disabled={!finalImage} style={{...S.btn,width:"100%",opacity:finalImage?1:0.5}}>Share {tab}</button>
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({post,members,myId,onLike,onComment,onAvatarClick,onDelete}) {
  const [txt,setTxt]=useState(""); const [showC,setShowC]=useState(false); const [sv,setSv]=useState("idle");
  const [confirmDel,setConfirmDel]=useState(false);
  const author=members.find(m=>m.id===post.authorId); const liked=post.likes.includes(myId);
  const isOwn=post.authorId===myId;
  async function doSave() {
    if(sv==="saving") return; setSv("saving");
    const r=await saveImage(post.image,`instafam-${(author?.name||"photo").replace(/\s+/g,"-").toLowerCase()}-${post.id}.jpg`);
    setSv(r.fallback?"fallback":"saved"); setTimeout(()=>setSv("idle"),3000);
  }
  return (
    <div style={S.card}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px"}}>
        <button onClick={()=>onAvatarClick?.(author)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
          <Av src={author?.avatar} size={38} style={{border:`2px solid ${P.border}`}}/>
        </button>
        <div style={{flex:1}}>
          <button onClick={()=>onAvatarClick?.(author)} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontWeight:700,fontSize:14,color:P.text,fontFamily:"'Nunito',sans-serif"}}>{author?.name}</button>
          <div style={{fontSize:11,color:P.muted}}>{ago(post.ts)}</div>
        </div>
        {isOwn&&(
          <div style={{position:"relative"}}>
            <button onClick={()=>setConfirmDel(c=>!c)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
              <Icon n="more" color={P.muted} size={20}/>
            </button>
            {confirmDel&&(
              <>
                <div style={{position:"fixed",inset:0,zIndex:49}} onClick={()=>setConfirmDel(false)}/>
                <div style={{position:"absolute",right:0,top:32,background:P.card,borderRadius:14,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",border:`1px solid ${P.border}`,zIndex:50,minWidth:140}}>
                  <button onClick={()=>{onDelete(post.id);setConfirmDel(false);}}
                    style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"12px 16px",color:"#c0392b",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                    <Icon n="trash" color="#c0392b" size={16}/> Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <img src={post.image} style={{width:"100%",display:"block",maxHeight:420,objectFit:"cover"}} alt="post"/>
      <div style={{padding:"10px 16px 12px"}}>
        <div style={{display:"flex",gap:16,marginBottom:8,alignItems:"center"}}>
          <button onClick={()=>onLike(post.id)}
            style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:liked?P.primary:P.muted,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14}}
            onTouchStart={e=>e.currentTarget.style.transform="scale(1.3)"} onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
            onMouseDown={e=>e.currentTarget.style.transform="scale(1.3)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            <Icon n="heart" filled={liked} color={liked?P.primary:P.muted} size={22}/>{post.likes.length}
          </button>
          <button onClick={()=>setShowC(!showC)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:P.muted,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14}}>
            <Icon n="comment" color={P.muted} size={22}/>{post.comments.length}
          </button>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
            {sv!=="idle"&&<span style={{fontSize:11,fontWeight:700,color:sv==="saved"?"#2e7d32":P.muted}}>{sv==="saving"?"Saving…":sv==="saved"?"Saved ✓":"Opened ↗"}</span>}
            <button onClick={doSave} title="Save photo" style={{background:sv==="saved"?"#e8f5e9":"none",border:"none",cursor:"pointer",padding:4,borderRadius:8,display:"flex",alignItems:"center"}}>
              <Icon n="download" color={sv==="saved"?"#2e7d32":P.muted} size={22}/>
            </button>
          </div>
        </div>
        {post.caption&&<p style={{margin:"0 0 8px",fontSize:14,color:P.text,lineHeight:1.5}}><strong>{author?.name}</strong> {post.caption}</p>}
        {showC&&(
          <div style={{marginTop:8}}>
            {post.comments.map(c=>{
              const ca=members.find(m=>m.id===c.authorId);
              return (
                <div key={c.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                  <Av src={ca?.avatar} size={26}/>
                  <div style={{background:P.bg,borderRadius:12,padding:"6px 12px",flex:1}}>
                    <span style={{fontWeight:700,fontSize:13}}>{ca?.name} </span>
                    <span style={{fontSize:13,color:P.text}}>{c.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
          <input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&txt.trim()){onComment(post.id,txt.trim());setTxt("");}}}
            placeholder="Add a comment…" style={{...S.input,padding:"8px 14px",fontSize:13,flex:1}}/>
          <button onClick={()=>{if(txt.trim()){onComment(post.id,txt.trim());setTxt("");}}} style={{background:"none",border:"none",cursor:"pointer"}}>
            <Icon n="send" color={P.primary} size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Private Chat ──────────────────────────────────────────────────────────────
function PrivateChat({me,other,chats,onSend,onClose}) {
  const [txt,setTxt]=useState(""); const bottomRef=useRef();
  const chatId=[me.id,other.id].sort().join("_");
  const msgs=(chats||[]).filter(m=>m.chatId===chatId).sort((a,b)=>a.ts-b.ts);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs.length]);
  function send() { if(!txt.trim()) return; onSend({id:uid(),chatId,fromId:me.id,toId:other.id,text:txt.trim(),ts:Date.now()}); setTxt(""); }
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,background:P.bg,display:"flex",flexDirection:"column"}}>
      <div style={{...S.topBar,flexShrink:0}}>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Icon n="back" color={P.primary} size={26}/></button>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Av src={other.avatar} size={34} style={{border:`2px solid ${P.border}`}}/>
          <span style={{fontWeight:800,fontSize:16}}>{other.name}</span>
        </div>
        <div style={{width:34}}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px"}}>
        {msgs.length===0&&<div style={{textAlign:"center",padding:32,color:P.muted}}><p style={{fontSize:32}}>💬</p><p style={{fontWeight:700,marginTop:8}}>Start a conversation with {other.name}</p></div>}
        {msgs.map(m=>{
          const isMine=m.fromId===me.id;
          return (
            <div key={m.id} style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start",marginBottom:10}}>
              {!isMine&&<Av src={other.avatar} size={26} style={{marginRight:8,flexShrink:0,alignSelf:"flex-end"}}/>}
              <div style={{maxWidth:"72%"}}>
                <div style={{background:isMine?`linear-gradient(135deg,${P.primary},${P.dark})`:`${P.border}`,borderRadius:isMine?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px"}}>
                  <span style={{color:isMine?"#fff":P.text,fontSize:14,lineHeight:1.4}}>{m.text}</span>
                </div>
                <div style={{fontSize:10,color:P.muted,marginTop:2,textAlign:isMine?"right":"left"}}>{ago(m.ts)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"8px 16px env(safe-area-inset-bottom,16px)",borderTop:`1px solid ${P.border}`,display:"flex",gap:8,alignItems:"center",background:P.card}}>
        <input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder={`Message ${other.name}…`} style={{...S.input,flex:1,padding:"10px 14px"}}/>
        <button onClick={send} style={{...S.btn,padding:"10px 14px",borderRadius:20,flexShrink:0}}>
          <Icon n="send" color="#fff" size={18}/>
        </button>
      </div>
    </div>
  );
}

// ── Member Profile Viewer ─────────────────────────────────────────────────────
function MemberProfile({member,posts,myId,onClose,onChat}) {
  if(!member) return null;
  const theirPosts=posts.filter(p=>p.authorId===member.id);
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,background:P.bg,overflowY:"auto"}}>
      <div style={{...S.topBar}}>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Icon n="back" color={P.primary} size={26}/></button>
        <span style={{fontWeight:800,fontSize:17}}>{member.name}'s Profile</span>
        <div style={{width:34}}/>
      </div>
      <div style={{background:`linear-gradient(160deg,${P.primary},${P.dark})`,height:140,position:"relative",marginBottom:60}}>
        <div style={{position:"absolute",bottom:-50,left:"50%",transform:"translateX(-50%)"}}>
          <div style={{padding:4,borderRadius:"50%",background:P.bg}}>
            <Av src={member.avatar} size={96} style={{border:`3px solid ${P.primary}`}}/>
          </div>
        </div>
      </div>
      <div style={{textAlign:"center",padding:"0 20px 16px"}}>
        <h2 style={{margin:0,fontSize:22,fontWeight:900}}>{member.name}</h2>
        {member.nickname&&<p style={{margin:"2px 0 0",color:P.primary,fontWeight:700,fontSize:15}}>"{member.nickname}"</p>}
        {member.bio&&<p style={{margin:"10px auto 0",maxWidth:300,fontSize:14,color:P.muted,lineHeight:1.5}}>{member.bio}</p>}
        {member.id!==myId&&<button onClick={()=>onChat(member)} style={{...S.btn,marginTop:14,display:"inline-flex",alignItems:"center",gap:8}}><Icon n="chat" color="#fff" size={16}/> Message</button>}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,padding:"0 20px 16px",justifyContent:"center"}}>
        {member.age&&<span style={{background:P.accent,color:P.dark,borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700}}>🎂 Age {member.age}</span>}
        {member.mood&&<span style={{background:"#fff0eb",color:P.primary,borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700}}>{member.mood}</span>}
        {member.hairColour&&<span style={{background:`${P.primary}15`,color:P.dark,borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700}}>💇 {member.hairColour}</span>}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:32,padding:"0 20px 24px"}}>
        <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:22}}>{theirPosts.length}</div><div style={{fontSize:12,color:P.muted}}>Posts</div></div>
        <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:22}}>{theirPosts.reduce((a,p)=>a+p.likes.length,0)}</div><div style={{fontSize:12,color:P.muted}}>Likes</div></div>
      </div>
      {theirPosts.length>0&&(
        <div style={{padding:"0 12px 100px"}}>
          <h3 style={{padding:"0 4px 10px",fontWeight:800,fontSize:16}}>Posts</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3}}>
            {theirPosts.map(p=><img key={p.id} src={p.image} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:8}} alt="post"/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Group Info Modal ──────────────────────────────────────────────────────────
function GroupInfo({group,members,posts,myId,onClose,onViewMember,onApprove,onDecline,onRemoveMember}) {
  const gm=members.filter(m=>group.members.includes(m.id));
  const postCount=posts.filter(p=>p.groupId===group.id).length;
  const isOwner=group.createdBy===myId;
  const [confirmRemove,setConfirmRemove]=useState(null);
  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:P.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:24,paddingBottom:"env(safe-area-inset-bottom,24px)",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {group.picture?<img src={group.picture} style={{width:52,height:52,borderRadius:14,objectFit:"cover",flexShrink:0}} alt=""/>
              :<div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${P.primary},${P.dark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{group.emoji||"👨‍👩‍👧‍👦"}</div>}
            <div>
              <h2 style={{margin:0,fontWeight:900,fontSize:20}}>{group.name}</h2>
              <p style={{margin:"2px 0 0",fontSize:13,color:P.muted}}>{gm.length} members · {postCount} posts</p>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color={P.muted}/></button>
        </div>
        {isOwner&&(group.pendingMembers||[]).length>0&&(
          <div style={{marginBottom:16}}><ApprovalPanel pending={group.pendingMembers||[]} onApprove={onApprove} onDecline={onDecline} groupId={group.id}/></div>
        )}
        <h3 style={{fontWeight:800,fontSize:15,marginBottom:12}}>Members</h3>
        {gm.map(m=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${P.border}`}}>
            <button onClick={()=>{onViewMember(m);onClose();}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,flex:1,textAlign:"left",padding:0}}>
              <Av src={m.avatar} size={44} style={{border:`2px solid ${P.border}`}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:15,color:P.text,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  {m.name}
                  {m.id===myId&&<span style={{background:P.accent,color:P.dark,borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:700}}>You</span>}
                  {m.id===group.createdBy&&<span style={{background:`${P.primary}20`,color:P.primary,borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:700}}>Owner</span>}
                </div>
                {m.nickname&&<div style={{fontSize:12,color:P.muted}}>"{m.nickname}"</div>}
                {m.mood&&<div style={{fontSize:12,color:P.muted}}>{m.mood}</div>}
              </div>
            </button>
            {isOwner&&m.id!==myId&&(
              confirmRemove===m.id?(
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{onRemoveMember(group.id,m.id);setConfirmRemove(null);onClose();}}
                    style={{background:"#c0392b",color:"#fff",border:"none",borderRadius:16,padding:"5px 10px",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>Remove</button>
                  <button onClick={()=>setConfirmRemove(null)}
                    style={{background:P.border,color:P.text,border:"none",borderRadius:16,padding:"5px 10px",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>Cancel</button>
                </div>
              ):(
                <button onClick={()=>setConfirmRemove(m.id)}
                  style={{background:"none",border:`1.5px solid #fcc`,borderRadius:16,padding:"5px 10px",color:"#c0392b",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer",flexShrink:0}}>
                  Remove
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pending Banner ────────────────────────────────────────────────────────────
function PendingBanner({groupName}) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:800,background:`linear-gradient(160deg,${P.primary},${P.dark})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:20}}>⏳</div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:24,margin:"0 0 12px"}}>Request Sent!</h2>
      <p style={{color:"rgba(255,255,255,0.85)",fontSize:16,lineHeight:1.6,maxWidth:300,margin:"0 0 24px"}}>
        Your request to join <strong>{groupName}</strong> has been sent to the group owner. You'll be able to see the group once they approve you.
      </p>
      <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"16px 24px",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.2)"}}>
        <p style={{color:"rgba(255,255,255,0.9)",fontSize:13,margin:0,lineHeight:1.6}}>💡 You can close this page and come back later.<br/>Once approved, the group will appear in your Groups tab.</p>
      </div>
    </div>
  );
}

// ── Approval Panel ────────────────────────────────────────────────────────────
function ApprovalPanel({pending,onApprove,onDecline,groupId}) {
  if(!pending||pending.length===0) return null;
  return (
    <div style={{...S.card,padding:0,marginBottom:16,border:`2px solid ${P.primary}`,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(135deg,${P.primary},${P.dark})`,padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:16}}>🔔</span>
        <span style={{fontWeight:800,fontSize:14,color:"#fff"}}>{pending.length} pending request{pending.length!==1?"s":""}</span>
      </div>
      {pending.map((p,i)=>(
        <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderTop:i===0?"none":`1px solid ${P.border}`}}>
          <Av src={p.avatar} size={42} style={{border:`2px solid ${P.border}`}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
            <div style={{fontSize:11,color:P.muted}}>Wants to join · {ago(p.requestedAt)}</div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={()=>onApprove(groupId,p)} style={{...S.btn,fontSize:12,padding:"6px 14px"}}>✓ Approve</button>
            <button onClick={()=>onDecline(groupId,p.id)} style={{background:"#fff5f5",color:"#c0392b",border:"1.5px solid #fcc",borderRadius:20,padding:"6px 12px",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>✗</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feed Screen ───────────────────────────────────────────────────────────────
function FeedScreen({group,posts,stories,members,myId,onLike,onComment,onPostNew,onStoryNew,onBack,onApprove,onDecline,onDeletePost,onDeleteStory,onChat,onRemoveMember,chats,onSendChat}) {
  const [sv,setSv]=useState(null); const [uploading,setUploading]=useState(false);
  const [viewMember,setViewMember]=useState(null); const [showInfo,setShowInfo]=useState(false);
  const [chatWith,setChatWith]=useState(null);
  const me=members.find(m=>m.id===myId);
  const gPosts=posts.filter(p=>p.groupId===group.id).sort((a,b)=>b.ts-a.ts);
  const gStories=stories.filter(s=>s.groupId===group.id&&Date.now()-s.ts<86400000);
  const storyAuthors=[...new Map(gStories.map(s=>[s.authorId,s])).values()];
  const myStory=storyAuthors.find(s=>s.authorId===myId);
  const pendingCount=(group.pendingMembers||[]).length;
  const isOwner=group.createdBy===myId;

  return (
    <>
      {sv&&<StoryViewer story={sv} author={members.find(m=>m.id===sv.authorId)} onClose={()=>setSv(null)} canDelete={sv.authorId===myId} onDelete={()=>{onDeleteStory(sv.id);setSv(null);}}/>}
      {uploading&&<UploadModal groupId={group.id} myId={myId} onClose={()=>setUploading(false)} onPost={onPostNew} onStory={onStoryNew}/>}
      {showInfo&&<GroupInfo group={group} members={members} posts={posts} myId={myId} onClose={()=>setShowInfo(false)} onViewMember={m=>setViewMember(m)} onApprove={onApprove} onDecline={onDecline} onRemoveMember={onRemoveMember}/>}
      {viewMember&&!chatWith&&<MemberProfile member={viewMember} posts={posts} myId={myId} onClose={()=>setViewMember(null)} onChat={m=>{setViewMember(null);setChatWith(m);}}/>}
      {chatWith&&<PrivateChat me={me} other={chatWith} chats={chats||[]} onSend={onSendChat} onClose={()=>setChatWith(null)}/>}
      <div style={S.topBar}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Icon n="back" color={P.primary} size={26}/></button>
        <button onClick={()=>setShowInfo(true)} style={{background:"none",border:"none",cursor:"pointer",fontWeight:800,fontSize:17,color:P.text,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:8,maxWidth:220,position:"relative"}}>
          {group.picture?<img src={group.picture} style={{width:30,height:30,borderRadius:10,objectFit:"cover",flexShrink:0}} alt=""/>
            :<div style={{width:30,height:30,borderRadius:10,background:`linear-gradient(135deg,${P.primary},${P.dark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{group.emoji||"👨‍👩‍👧‍👦"}</div>}
          <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{group.name}</span>
          <Icon n="info" color={P.muted} size={16}/>
          {isOwner&&pendingCount>0&&<span style={{position:"absolute",top:-4,right:-4,background:P.primary,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{pendingCount}</span>}
        </button>
        <button onClick={()=>setUploading(true)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="camera" color={P.primary} size={24}/></button>
      </div>
      <div style={{paddingBottom:24}}>
        <div style={{background:P.card,borderBottom:`1px solid ${P.border}`,padding:"12px 0",marginBottom:8}}>
          <div style={{display:"flex",overflowX:"auto",paddingLeft:8,paddingRight:8,scrollbarWidth:"none"}}>
            <button onClick={()=>setUploading(true)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"4px 6px",minWidth:64}}>
              <div style={{width:58,height:58,borderRadius:"50%",background:P.bg,border:`2px dashed ${P.primary}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                {myStory?<Av src={me?.avatar} size={54} style={{display:"block"}}/>:<span style={{fontSize:26,color:P.primary}}>+</span>}
              </div>
              <span style={{fontSize:11,fontWeight:600,color:P.text}}>Your story</span>
            </button>
            {storyAuthors.filter(s=>s.authorId!==myId).map(s=>{
              const a=members.find(m=>m.id===s.authorId);
              return <StoryRing key={s.id} avatar={a?.avatar} name={a?.name} onClick={()=>setSv(s)}/>;
            })}
          </div>
        </div>
        <div style={{padding:"0 12px"}}>
          {gPosts.length===0&&(
            <div style={{textAlign:"center",padding:48,color:P.muted}}>
              <p style={{fontSize:48,margin:0}}>📸</p>
              <p style={{fontWeight:700,marginTop:12}}>No posts yet</p>
              <button onClick={()=>setUploading(true)} style={{...S.btn,marginTop:12}}>Share a post</button>
            </div>
          )}
          {gPosts.map(post=>(
            <PostCard key={post.id} post={post} members={members} myId={myId} onLike={onLike} onComment={onComment} onAvatarClick={m=>setViewMember(m)} onDelete={onDeletePost}/>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Notification Settings ─────────────────────────────────────────────────────
function NotificationSettings({groups,myId,onClose}) {
  const [prefs,setPrefs]=useState(()=>{
    const saved=loadNotifPrefs(); const merged=defaultPrefs(groups);
    if(saved.globalEnabled!==undefined) merged.globalEnabled=saved.globalEnabled;
    groups.forEach(g=>{if(saved.groups?.[g.id]) merged.groups[g.id]={...merged.groups[g.id],...saved.groups[g.id]};});
    return merged;
  });
  const [permState,setPermState]=useState(()=>"Notification" in window?Notification.permission:"unsupported");
  const [requesting,setRequesting]=useState(false);

  function toggle(path,val) {
    setPrefs(p=>{const n=JSON.parse(JSON.stringify(p));
      if(path==="global") n.globalEnabled=val;
      else if(path.startsWith("group.")){const[,gId,key]=path.split(".");if(!n.groups[gId])n.groups[gId]={posts:true,stories:true,likes:true,comments:true};n.groups[gId][key]=val;}
      saveNotifPrefs(n);return n;
    });
  }
  async function enableNotifications() {
    setRequesting(true); const r=await requestNotifPermission(); setPermState(r);
    if(r==="granted"){await registerSW();toggle("global",true);}
    setRequesting(false);
  }
  const myGroups=groups.filter(g=>g.members.includes(myId));
  const ok=permState==="granted";
  return (
    <div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:P.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:24,paddingBottom:"env(safe-area-inset-bottom,24px)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontWeight:900,fontSize:20}}>🔔 Notifications</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color={P.muted}/></button>
        </div>
        {permState==="unsupported"&&<div style={{background:"#fff3cd",border:"1px solid #ffc107",borderRadius:14,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#856404"}}>⚠️ Your browser doesn't support push notifications.</div>}
        {permState==="denied"&&<div style={{background:"#ffebee",border:"1px solid #ef9a9a",borderRadius:14,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#c62828"}}>🚫 Notifications blocked. Go to your phone Settings → InstaFam → Allow Notifications.</div>}
        {permState==="default"&&<div style={{background:`${P.primary}10`,border:`1px solid ${P.accent}`,borderRadius:14,padding:"14px 16px",marginBottom:20}}><p style={{margin:"0 0 10px",fontWeight:700,fontSize:14}}>Enable notifications to know when family posts.</p><button onClick={enableNotifications} disabled={requesting} style={{...S.btn,width:"100%",opacity:requesting?0.6:1}}>{requesting?"Asking permission…":"🔔 Enable Notifications"}</button></div>}
        <div style={{...S.card,padding:"14px 16px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontWeight:700,fontSize:15}}>All Notifications</div><div style={{fontSize:12,color:P.muted,marginTop:2}}>Master switch</div></div>
            <Toggle on={prefs.globalEnabled&&ok} disabled={!ok} onChange={v=>toggle("global",v)}/>
          </div>
        </div>
        {myGroups.length>0&&<>
          <h3 style={{fontWeight:800,fontSize:14,color:P.muted,marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>Per Group</h3>
          {myGroups.map(g=>(
            <div key={g.id} style={{...S.card,padding:"14px 16px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                {g.picture?<img src={g.picture} style={{width:36,height:36,borderRadius:10,objectFit:"cover"}} alt=""/>
                  :<div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${P.primary},${P.dark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{g.emoji||"👨‍👩‍👧‍👦"}</div>}
                <span style={{fontWeight:700,fontSize:15}}>{g.name}</span>
              </div>
              {[["posts","📸 New posts"],["stories","✨ New stories"],["likes","❤️ Likes on your posts"],["comments","💬 Comments on your posts"]].map(([key,label])=>(
                <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:14}}>{label}</span>
                  <Toggle on={prefs.globalEnabled&&prefs.groups[g.id]?.[key]!==false&&ok} disabled={!prefs.globalEnabled||!ok} onChange={v=>toggle(`group.${g.id}.${key}`,v)}/>
                </div>
              ))}
            </div>
          ))}
        </>}
        <div style={{background:`${P.primary}10`,borderRadius:14,padding:"12px 16px",fontSize:13,color:P.muted,lineHeight:1.6}}>
          💡 Notifications work best when InstaFam is added to your Home Screen.
        </div>
      </div>
    </div>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────
function ProfileScreen({myId,members,groups,posts,onSaveProfile,chats,onSendChat}) {
  const me=members.find(m=>m.id===myId)||{};
  const [editing,setEditing]=useState(false); const [draft,setDraft]=useState({});
  const [showNotif,setShowNotif]=useState(false); const [chatWith,setChatWith]=useState(null);
  const myPosts=posts.filter(p=>p.authorId===myId);
  const myGroups=groups.filter(g=>g.members.includes(myId));
  // Unread chat count
  const unread=(chats||[]).filter(m=>m.toId===myId).length;

  function startEdit() { setDraft({name:me.name||"",nickname:me.nickname||"",age:me.age||"",mood:me.mood||"",hairColour:me.hairColour||"",bio:me.bio||"",avatar:me.avatar||AVATARS[0]}); setEditing(true); }
  function save() { onSaveProfile({...me,...draft}); setEditing(false); }

  // All members I share a group with (excluding myself)
  const groupMemberIds=new Set(myGroups.flatMap(g=>g.members).filter(id=>id!==myId));
  const contacts=members.filter(m=>groupMemberIds.has(m.id));

  if(chatWith) return <PrivateChat me={me} other={chatWith} chats={chats} onSend={onSendChat} onClose={()=>setChatWith(null)}/>;

  return (
    <div style={{paddingBottom:100}}>
      {showNotif&&<NotificationSettings groups={groups} myId={myId} onClose={()=>setShowNotif(false)}/>}
      <div style={{background:`linear-gradient(160deg,${P.primary},${P.dark})`,height:140,position:"relative",marginBottom:64}}>
        <div style={{position:"absolute",bottom:-52,left:"50%",transform:"translateX(-50%)"}}>
          <div style={{padding:4,borderRadius:"50%",background:P.bg}}>
            <Av src={me.avatar} size={96} style={{border:`3px solid ${P.primary}`}}/>
          </div>
        </div>
      </div>
      <div style={{textAlign:"center",padding:"0 20px"}}>
        <h2 style={{margin:0,fontSize:22,fontWeight:900}}>{me.name}</h2>
        {me.nickname&&<p style={{margin:"2px 0 0",color:P.primary,fontWeight:700}}>"{me.nickname}"</p>}
        {me.bio&&<p style={{margin:"8px auto 0",maxWidth:300,fontSize:14,color:P.muted,lineHeight:1.5}}>{me.bio}</p>}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginTop:12}}>
          {me.age&&<span style={{background:P.accent,color:P.dark,borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700}}>🎂 Age {me.age}</span>}
          {me.mood&&<span style={{background:"#fff0eb",color:P.primary,borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700}}>{me.mood}</span>}
          {me.hairColour&&<span style={{background:`${P.primary}15`,color:P.dark,borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700}}>💇 {me.hairColour}</span>}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:32,marginTop:20}}>
          <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:22}}>{myPosts.length}</div><div style={{fontSize:12,color:P.muted}}>Posts</div></div>
          <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:22}}>{myGroups.length}</div><div style={{fontSize:12,color:P.muted}}>Groups</div></div>
          <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:22}}>{myPosts.reduce((a,p)=>a+p.likes.length,0)}</div><div style={{fontSize:12,color:P.muted}}>Likes</div></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={startEdit} style={{...S.btn,display:"inline-flex",alignItems:"center",gap:8}}><Icon n="edit" color="#fff" size={16}/> Edit Profile</button>
          <button onClick={()=>setShowNotif(true)} style={{...S.ghost,display:"inline-flex",alignItems:"center",gap:8}}>🔔 Notifications</button>
        </div>
      </div>

      {/* Messages / Contacts */}
      {contacts.length>0&&(
        <div style={{padding:"24px 16px 0"}}>
          <h3 style={{fontWeight:800,fontSize:16,marginBottom:12}}>💬 Messages</h3>
          {contacts.map(c=>(
            <button key={c.id} onClick={()=>setChatWith(c)}
              style={{width:"100%",background:P.card,border:`1.5px solid ${P.border}`,borderRadius:16,padding:"12px 16px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
              <Av src={c.avatar} size={40} style={{border:`2px solid ${P.border}`}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:P.text}}>{c.name}</div>
                {c.mood&&<div style={{fontSize:12,color:P.muted}}>{c.mood}</div>}
              </div>
              <Icon n="chat" color={P.primary} size={20}/>
            </button>
          ))}
        </div>
      )}

      {myPosts.length>0&&(
        <div style={{padding:"24px 12px 0"}}>
          <h3 style={{padding:"0 4px 10px",fontWeight:800,fontSize:16}}>Your Posts</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3}}>
            {myPosts.map(p=><img key={p.id} src={p.image} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:8}} alt="post"/>)}
          </div>
        </div>
      )}
      <div style={{margin:"24px 16px 0",...S.card,padding:20,background:`linear-gradient(135deg,${P.primary}12,${P.accent}28)`,border:`1px solid ${P.border}`}}>
        <h4 style={{margin:"0 0 8px",fontWeight:800,color:P.primary}}>📱 Add to Home Screen</h4>
        <p style={{margin:0,fontSize:13,color:P.text,lineHeight:1.6}}><strong>iPhone:</strong> tap Share → "Add to Home Screen" · <strong>Android:</strong> tap ⋮ → "Add to Home Screen"</p>
      </div>

      {editing&&(
        <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end"}}>
          <div style={{background:P.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:24,paddingBottom:"env(safe-area-inset-bottom,24px)",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontWeight:900,fontSize:20,color:P.primary}}>Edit Profile</div>
              <button onClick={()=>setEditing(false)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color={P.muted}/></button>
            </div>
            <div style={{textAlign:"center",marginBottom:20}}>
              <Av src={draft.avatar} size={80} style={{margin:"0 auto 12px",border:`3px solid ${P.primary}`}}/>
              <ImagePicker label="Change Profile Photo" onPick={d=>setDraft(x=>({...x,avatar:d}))}/>
            </div>
            {[{label:"Display name",key:"name",type:"text",placeholder:"Your name"},{label:"Nickname",key:"nickname",type:"text",placeholder:"e.g. Mama Bear"},{label:"Age",key:"age",type:"number",placeholder:"e.g. 32"},{label:"Bio",key:"bio",type:"textarea",placeholder:"A short bio about you…"}].map(f=>(
              <div key={f.key} style={{marginBottom:14}}>
                <label style={{fontWeight:700,fontSize:13,display:"block",marginBottom:5}}>{f.label}</label>
                {f.type==="textarea"?<textarea value={draft[f.key]} onChange={e=>setDraft(x=>({...x,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{...S.input,minHeight:72,resize:"none"}}/>
                  :<input type={f.type} value={draft[f.key]} onChange={e=>setDraft(x=>({...x,[f.key]:e.target.value}))} placeholder={f.placeholder} style={S.input}/>}
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <label style={{fontWeight:700,fontSize:13,display:"block",marginBottom:5}}>Current Mood</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {MOODS.map(m=><button key={m} onClick={()=>setDraft(x=>({...x,mood:m}))} style={{background:draft.mood===m?P.primary:P.bg,color:draft.mood===m?"#fff":P.text,border:`1.5px solid ${draft.mood===m?P.primary:P.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:draft.mood===m?700:500}}>{m}</button>)}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontWeight:700,fontSize:13,display:"block",marginBottom:5}}>Hair Colour</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {HAIR.map(h=><button key={h} onClick={()=>setDraft(x=>({...x,hairColour:h}))} style={{background:draft.hairColour===h?P.primary:P.bg,color:draft.hairColour===h?"#fff":P.text,border:`1.5px solid ${draft.hairColour===h?P.primary:P.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:draft.hairColour===h?700:500}}>{h}</button>)}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={save} style={{...S.btn,flex:1}}>Save Changes</button>
              <button onClick={()=>setEditing(false)} style={{...S.ghost,flex:1}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Groups Screen ─────────────────────────────────────────────────────────────
function GroupsScreen({groups,members,myId,onSelectGroup,onCreateGroup,onRenameGroup,onDeleteGroup,onGroupPicture,onApprove,onDecline}) {
  const [creating,setCreating]=useState(false); const [newName,setNewName]=useState("");
  const [editState,setEditState]=useState({}); const [shareModal,setShareModal]=useState(null);
  const [picGroupId,setPicGroupId]=useState(null); // which group is having its picture changed
  const me=members.find(m=>m.id===myId);

  function create() { if(!newName.trim()) return; onCreateGroup(newName.trim()); setNewName(""); setCreating(false); }
  function startRename(g) { setEditState(s=>({...s,[g.id]:{mode:"rename",val:g.name}})); }
  function cancelEdit(id) { setEditState(s=>{const n={...s};delete n[id];return n;}); }
  function submitRename(g) { const v=editState[g.id]?.val?.trim(); if(v) onRenameGroup(g.id,v); cancelEdit(g.id); }
  function startDel(id) { setEditState(s=>({...s,[id]:{mode:"del"}})); }
  function confirmDel(id) { onDeleteGroup(id); cancelEdit(id); }

  // WhatsApp invite link share
  function openShareModal(g) { setShareModal(g); }

  return (
    <div style={{padding:"16px 16px 100px"}}>
      {shareModal&&<ShareInviteModal group={shareModal} senderName={me?.name||"Someone"} onClose={()=>setShareModal(null)}/>}
      {picGroupId&&(
        <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end"}}>
          <div style={{background:P.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:24,paddingBottom:"env(safe-area-inset-bottom,24px)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontWeight:900,fontSize:18,color:P.text}}>Group Photo</div>
              <button onClick={()=>setPicGroupId(null)} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color={P.muted}/></button>
            </div>
            <ImagePicker label="Choose Group Photo" onPick={d=>{onGroupPicture(picGroupId,d);setPicGroupId(null);}}/>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{margin:0,fontSize:22,fontWeight:900}}>Your Groups</h2>
        <button onClick={()=>setCreating(!creating)} style={S.btn}>+ New Group</button>
      </div>
      {creating&&(
        <div style={{...S.card,padding:20,marginBottom:20}}>
          <p style={{margin:"0 0 12px",fontWeight:700}}>Name your group</p>
          <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&create()} placeholder="e.g. Summer Fam 🌻" style={{...S.input,marginBottom:12}} autoFocus/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={create} style={{...S.btn,flex:1}}>Create</button>
            <button onClick={()=>setCreating(false)} style={{...S.ghost,flex:1}}>Cancel</button>
          </div>
        </div>
      )}
      {groups.length===0&&<div style={{textAlign:"center",padding:48,color:P.muted}}><p style={{fontSize:48,margin:0}}>👨‍👩‍👧‍👦</p><p style={{marginTop:12,fontWeight:700}}>No groups yet</p><p style={{fontSize:14}}>Create one and invite your family!</p></div>}
      {groups.map(g=>{
        const gm=members.filter(m=>g.members.includes(m.id));
        const isOwner=g.createdBy===myId; const es=editState[g.id];
        return (
          <div key={g.id} style={S.card}>
            {es?.mode==="rename"&&(
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${P.border}`,background:`${P.primary}08`}}>
                <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:P.primary}}>Rename group</p>
                <input value={es.val} onChange={e=>setEditState(s=>({...s,[g.id]:{...s[g.id],val:e.target.value}}))} onKeyDown={e=>{if(e.key==="Enter")submitRename(g);if(e.key==="Escape")cancelEdit(g.id);}} style={{...S.input,marginBottom:10}} autoFocus/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>submitRename(g)} style={{...S.btn,flex:1,fontSize:13,padding:"8px 0"}}>Save</button>
                  <button onClick={()=>cancelEdit(g.id)} style={{...S.ghost,flex:1,fontSize:13,padding:"8px 0"}}>Cancel</button>
                </div>
              </div>
            )}
            {es?.mode==="del"&&(
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${P.border}`,background:"#fff5f5"}}>
                <p style={{margin:"0 0 4px",fontWeight:700,fontSize:14,color:"#c0392b"}}>Delete "{g.name}"?</p>
                <p style={{margin:"0 0 12px",fontSize:13,color:P.muted}}>All posts and stories will be permanently removed.</p>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>confirmDel(g.id)} style={{...S.btn,flex:1,fontSize:13,padding:"8px 0",background:"#c0392b"}}>Yes, delete</button>
                  <button onClick={()=>cancelEdit(g.id)} style={{...S.ghost,flex:1,fontSize:13,padding:"8px 0"}}>Cancel</button>
                </div>
              </div>
            )}
            {isOwner&&<ApprovalPanel pending={g.pendingMembers||[]} onApprove={onApprove} onDecline={onDecline} groupId={g.id}/>}
            <div style={{padding:"16px 16px 12px",cursor:"pointer"}} onClick={()=>onSelectGroup(g)}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{width:56,height:56,borderRadius:16,overflow:"hidden",flexShrink:0,position:"relative",cursor:isOwner?"pointer":"default"}} onClick={isOwner?e=>{e.stopPropagation();setPicGroupId(g.id);}:undefined}>
                  {g.picture?<img src={g.picture} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="group"/>
                    :<div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${P.primary},${P.dark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{g.emoji||"👨‍👩‍👧‍👦"}</div>}
                  {isOwner&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.28)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}><Icon n="camera" color="#fff" size={18}/></div>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:17,color:P.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.name}</div>
                  <div style={{fontSize:12,color:P.muted,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    {gm.length} member{gm.length!==1?"s":""}
                    {isOwner&&<span style={{background:P.accent,color:P.dark,borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:700}}>Owner</span>}
                    {isOwner&&(g.pendingMembers||[]).length>0&&<span style={{background:P.primary,color:"#fff",borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:700}}>🔔 {(g.pendingMembers||[]).length} pending</span>}
                  </div>
                </div>
              </div>
              <div style={{display:"flex"}}>
                {gm.slice(0,5).map((m,i)=><Av key={m.id} src={m.avatar} size={28} style={{border:`2px solid ${P.card}`,marginLeft:i===0?0:-8}}/>)}
                {gm.length>5&&<div style={{width:28,height:28,borderRadius:"50%",background:P.accent,border:`2px solid ${P.card}`,marginLeft:-8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:P.dark}}>+{gm.length-5}</div>}
              </div>
            </div>
            <div style={{borderTop:`1px solid ${P.border}`,padding:"10px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>onSelectGroup(g)} style={{...S.btn,flex:1,fontSize:13,padding:"8px 0",minWidth:60}}>Open</button>
              <button onClick={()=>openShareModal(g)} style={{background:"#25D366",color:"#fff",border:"none",borderRadius:24,padding:"8px 14px",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              {isOwner&&<>
                <button onClick={()=>startRename(g)} style={{background:P.bg,border:`1.5px solid ${P.border}`,borderRadius:24,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:P.muted,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}><Icon n="edit" color={P.muted} size={15}/> Rename</button>
                <button onClick={()=>startDel(g.id)} style={{background:"#fff5f5",border:"1.5px solid #fcc",borderRadius:24,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#c0392b",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}><Icon n="trash" color="#c0392b" size={15}/> Delete</button>
              </>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Share Invite Modal (WhatsApp + copy) ──────────────────────────────────────
function ShareInviteModal({group,senderName,onClose}) {
  const [recipientName,setRecipientName]=useState("");
  const [copied,setCopied]=useState(false);
  const link=`${window.location.origin}${window.location.pathname}?join=${group.inviteCode}&group=${encodeURIComponent(group.name)}`;

  const iosSteps="1. Tap the link above on your phone\n2. Enter your name\n3. In Safari, tap the Share icon (□↑) at the bottom\n4. Tap 'Add to Home Screen'\n5. Tap 'Add' — InstaFam will appear as an app icon!\n6. Open it and wait for the group owner to approve you.";
  const androidSteps="1. Tap the link above on your phone\n2. Enter your name\n3. In Chrome, tap the menu (⋮) top right\n4. Tap 'Add to Home Screen'\n5. Tap 'Add' — InstaFam will appear as an app icon!\n6. Open it and wait for the group owner to approve you.";

  function buildMessage(platform) {
    const name=recipientName.trim()||"there";
    return `Hey ${name}! 👋\n\n${senderName} wants you to join the group *${group.name}* on *InstaFam* — the members-only platform for sharing memories in a small and private group. 📸\n\nHere's your invite link:\n${link}\n\n*How to get started:*\n\n📱 *iPhone (Safari):*\n${iosSteps}\n\n🤖 *Android (Chrome):*\n${androidSteps}\n\nSee you there! 🎉`;
  }

  function sendWhatsApp() {
    const msg=encodeURIComponent(buildMessage("whatsapp"));
    window.open(`https://wa.me/?text=${msg}`,"_blank");
  }

  function copyText() {
    navigator.clipboard?.writeText(buildMessage("copy")).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2500);
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:P.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:24,paddingBottom:"env(safe-area-inset-bottom,24px)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontWeight:900,fontSize:20,color:P.text}}>Invite to {group.name}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color={P.muted}/></button>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{fontWeight:700,fontSize:13,display:"block",marginBottom:6,color:P.text}}>Recipient's first name (optional)</label>
          <input value={recipientName} onChange={e=>setRecipientName(e.target.value)} placeholder="e.g. Sarah, Uncle Bob…" style={S.input}/>
          <p style={{margin:"6px 0 0",fontSize:12,color:P.muted}}>Personalises the message — leave blank for "there"</p>
        </div>
        {/* Preview */}
        <div style={{background:`${P.primary}08`,border:`1.5px solid ${P.border}`,borderRadius:14,padding:14,marginBottom:16,fontSize:13,color:P.text,lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:180,overflowY:"auto"}}>
          {buildMessage("preview")}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={sendWhatsApp} style={{background:"#25D366",color:"#fff",border:"none",borderRadius:24,padding:"12px 0",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send via WhatsApp
          </button>
          <button onClick={copyText} style={{...S.ghost,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {copied?<><Icon n="check" color={P.primary} size={16}/> Copied!</>:<><Icon n="link" color={P.primary} size={16}/> Copy</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function Onboarding({onDone,joinCode,joinGroupName}) {
  const [name,setName]=useState("");
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${P.primary} 0%,${P.dark} 50%,#2d0d00 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <img src={LOGO_SRC} alt="InstaFam" style={{width:100,height:100,borderRadius:24,boxShadow:"0 8px 32px rgba(0,0,0,0.35)",objectFit:"cover"}}/>
        </div>
        <div style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:42,color:"#fff",letterSpacing:-1}}>Insta<span style={{color:"#7ee8f5"}}>Fam</span></div>
        <p style={{color:"rgba(255,255,255,0.8)",marginTop:8,fontSize:16}}>Your private family & friends space 🏡</p>
      </div>
      <div style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(20px)",borderRadius:28,padding:32,width:"100%",maxWidth:360,border:"1px solid rgba(255,255,255,0.2)"}}>
        {joinGroupName&&<div style={{marginBottom:20,background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"10px 16px",fontSize:14,color:"#fff"}}>🎉 You've been invited to join <strong>{joinGroupName}</strong>!</div>}
        <p style={{color:"#fff",fontWeight:700,marginBottom:12,fontSize:16}}>What's your name?</p>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&onDone(name.trim())}
          placeholder="e.g. Alex, Mom, Uncle Bob…" style={{...S.input,marginBottom:16,background:"rgba(255,255,255,0.92)"}} autoFocus/>
        <button onClick={()=>name.trim()&&onDone(name.trim())} disabled={!name.trim()} style={{...S.btn,width:"100%",fontSize:16,padding:"14px 0",opacity:name.trim()?1:0.5}}>
          {joinCode?"Join Group →":"Get Started →"}
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [myId]=useState(()=>{let id=localStorage.getItem("if_id");if(!id){id=uid();localStorage.setItem("if_id",id);}return id;});
  const [myName,setMyName]=useState(()=>localStorage.getItem("if_name")||"");
  const [data,setData]=useState(()=>{const s=localStorage.getItem("if_data");return s?JSON.parse(s):null;});
  const [tab,setTab]=useState("groups");
  const [activeGroup,setActiveGroup]=useState(null);

  const params=new URLSearchParams(window.location.search);
  const joinCode=params.get("join"); const joinGroupName=params.get("group")||"";

  useEffect(()=>{
    if(!joinCode||!data||!myName) return;
    const group=data.groups.find(g=>g.inviteCode===joinCode);
    if(!group) return;
    const alreadyMember=group.members.includes(myId);
    const alreadyPending=(group.pendingMembers||[]).some(p=>p.id===myId);
    if(!alreadyMember&&!alreadyPending) {
      const me=data.members.find(m=>m.id===myId);
      setData(d=>({...d,groups:d.groups.map(g=>g.id===group.id?{...g,pendingMembers:[...(g.pendingMembers||[]),{id:myId,name:me?.name||myName,avatar:me?.avatar||AVATARS[0],requestedAt:Date.now()}]}:g)}));
    }
    window.history.replaceState({},"",window.location.pathname);
  },[joinCode]);

  useEffect(()=>{if(data) localStorage.setItem("if_data",JSON.stringify(data));},[data]);
  useEffect(()=>{registerSW();},[]);

  function onboard(name) {
    setMyName(name); localStorage.setItem("if_name",name);
    let base=data;
    if(!base) { base=seedData(myId,name); }
    else {
      const exists=base.members.find(m=>m.id===myId);
      base={...base,members:exists?base.members.map(m=>m.id===myId?{...m,name}:m):[...base.members,{id:myId,name,avatar:AVATARS[0],nickname:"",age:"",mood:"",hairColour:"",bio:""}]};
    }
    if(joinCode) {
      const g=base.groups.find(g=>g.inviteCode===joinCode);
      const alreadyMember=g?.members.includes(myId);
      const alreadyPending=(g?.pendingMembers||[]).some(p=>p.id===myId);
      if(g&&!alreadyMember&&!alreadyPending) {
        const me=base.members.find(m=>m.id===myId);
        base={...base,groups:base.groups.map(gr=>gr.inviteCode===joinCode?{...gr,pendingMembers:[...(gr.pendingMembers||[]),{id:myId,name:me?.name||name,avatar:me?.avatar||AVATARS[0],requestedAt:Date.now()}]}:gr)};
      }
    }
    window.history.replaceState({},"",window.location.pathname);
    setData(base);
  }

  function saveProfile(updated) { setMyName(updated.name); localStorage.setItem("if_name",updated.name); setData(d=>({...d,members:d.members.map(m=>m.id===myId?updated:m)})); }
  function createGroup(name) { setData(d=>({...d,groups:[...d.groups,{id:uid(),name,emoji:"👨‍👩‍👧‍👦",members:[myId],inviteCode:uid(),createdBy:myId,pendingMembers:[]}]})); }
  function setGroupPicture(gId,pic) { setData(d=>({...d,groups:d.groups.map(g=>g.id===gId&&g.createdBy===myId?{...g,picture:pic}:g)})); setActiveGroup(ag=>ag&&ag.id===gId?{...ag,picture:pic}:ag); }
  function renameGroup(id,name) { setData(d=>({...d,groups:d.groups.map(g=>g.id===id&&g.createdBy===myId?{...g,name}:g)})); setActiveGroup(ag=>ag&&ag.id===id?{...ag,name}:ag); }
  function deleteGroup(id) { setData(d=>({...d,groups:d.groups.filter(g=>!(g.id===id&&g.createdBy===myId)),posts:d.posts.filter(p=>p.groupId!==id),stories:d.stories.filter(s=>s.groupId!==id)})); setActiveGroup(null); }
  function removeMember(gId,mId) { setData(d=>({...d,groups:d.groups.map(g=>g.id===gId&&g.createdBy===myId?{...g,members:g.members.filter(id=>id!==mId)}:g)})); setActiveGroup(ag=>ag&&ag.id===gId?{...ag,members:ag.members.filter(id=>id!==mId)}:ag); }

  function approveMember(groupId,applicant) {
    setData(d=>{
      const alreadyGlobal=d.members.find(m=>m.id===applicant.id);
      return {...d,
        members:alreadyGlobal?d.members:[...d.members,{id:applicant.id,name:applicant.name,avatar:applicant.avatar,nickname:"",age:"",mood:"",hairColour:"",bio:""}],
        groups:d.groups.map(g=>g.id===groupId&&g.createdBy===myId?{...g,members:[...g.members,applicant.id],pendingMembers:(g.pendingMembers||[]).filter(p=>p.id!==applicant.id)}:g),
      };
    });
    setActiveGroup(ag=>ag&&ag.id===groupId?{...ag,members:[...ag.members,applicant.id],pendingMembers:(ag.pendingMembers||[]).filter(p=>p.id!==applicant.id)}:ag);
  }
  function declineMember(groupId,applicantId) {
    setData(d=>({...d,groups:d.groups.map(g=>g.id===groupId&&g.createdBy===myId?{...g,pendingMembers:(g.pendingMembers||[]).filter(p=>p.id!==applicantId)}:g)}));
    setActiveGroup(ag=>ag&&ag.id===groupId?{...ag,pendingMembers:(ag.pendingMembers||[]).filter(p=>p.id!==applicantId)}:ag);
  }

  function like(pid) {
    setData(d=>{
      const post=d.posts.find(p=>p.id===pid);
      const newLiked=post&&!post.likes.includes(myId);
      if(newLiked&&post.authorId!==myId) {
        const prefs=loadNotifPrefs(); const group=d.groups.find(g=>g.id===post.groupId); const me=d.members.find(m=>m.id===myId);
        if(prefs.globalEnabled&&prefs.groups?.[post.groupId]?.likes!==false&&Notification?.permission==="granted"&&group&&me)
          sendNotifViaSW({type:"LIKE",groupName:group.name,authorName:me.name,postId:pid});
      }
      return {...d,posts:d.posts.map(p=>p.id===pid?{...p,likes:p.likes.includes(myId)?p.likes.filter(i=>i!==myId):[...p.likes,myId]}:p)};
    });
  }
  function comment(pid,text) {
    setData(d=>{
      const post=d.posts.find(p=>p.id===pid);
      if(post&&post.authorId!==myId) {
        const prefs=loadNotifPrefs(); const group=d.groups.find(g=>g.id===post.groupId); const me=d.members.find(m=>m.id===myId);
        if(prefs.globalEnabled&&prefs.groups?.[post.groupId]?.comments!==false&&Notification?.permission==="granted"&&group&&me)
          sendNotifViaSW({type:"COMMENT",groupName:group.name,authorName:me.name,text,postId:pid});
      }
      return {...d,posts:d.posts.map(p=>p.id===pid?{...p,comments:[...p.comments,{id:uid(),authorId:myId,text,ts:Date.now()}]}:p)};
    });
  }
  function newPost(post) {
    setData(d=>{
      const group=d.groups.find(g=>g.id===post.groupId); const author=d.members.find(m=>m.id===post.authorId);
      const prefs=loadNotifPrefs();
      if(prefs.globalEnabled&&prefs.groups?.[post.groupId]?.posts!==false&&Notification?.permission==="granted"&&group&&author)
        sendNotifViaSW({type:"NEW_POST",groupName:group.name,authorName:author.name,caption:post.caption||""});
      return {...d,posts:[post,...d.posts]};
    });
  }
  function newStory(story) {
    setData(d=>{
      const group=d.groups.find(g=>g.id===story.groupId); const author=d.members.find(m=>m.id===story.authorId);
      const prefs=loadNotifPrefs();
      if(prefs.globalEnabled&&prefs.groups?.[story.groupId]?.stories!==false&&Notification?.permission==="granted"&&group&&author)
        sendNotifViaSW({type:"NEW_STORY",groupName:group.name,authorName:author.name});
      return {...d,stories:[story,...d.stories]};
    });
  }
  function deletePost(pid) { setData(d=>({...d,posts:d.posts.filter(p=>!(p.id===pid&&p.authorId===myId))})); }
  function deleteStory(sid) { setData(d=>({...d,stories:d.stories.filter(s=>!(s.id===sid&&s.authorId===myId))})); }
  function sendChat(msg) { setData(d=>({...d,chats:[...(d.chats||[]),msg]})); }

  if(!myName) return (<><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/><Onboarding onDone={onboard} joinCode={joinCode} joinGroupName={joinGroupName}/></>);

  const pendingInGroup=(data?.groups||[]).find(g=>(g.pendingMembers||[]).some(p=>p.id===myId)&&!g.members.includes(myId));
  const hasAnyApprovedGroup=(data?.groups||[]).some(g=>g.members.includes(myId));
  if(pendingInGroup&&!hasAnyApprovedGroup) return (<><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/><PendingBanner groupName={pendingInGroup.name}/></>);

  const groups=data?.groups||[]; const members=data?.members||[];
  const posts=data?.posts||[];   const stories=data?.stories||[]; const chats=data?.chats||[];
  // Always use fresh group data from store — prevents stale activeGroup state
  const liveActiveGroup = activeGroup ? (groups.find(g=>g.id===activeGroup.id)||activeGroup) : null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.app}>
        {!liveActiveGroup&&(
          <div style={S.topBar}>
            <Logo height={32}/>
            <span style={{fontSize:13,fontWeight:700,color:P.muted}}>Hi, {myName.split(" ")[0]} 👋</span>
          </div>
        )}
        {liveActiveGroup?(
          <FeedScreen group={liveActiveGroup} posts={posts} stories={stories} members={members} myId={myId}
            onLike={like} onComment={comment} onPostNew={newPost} onStoryNew={newStory} onBack={()=>setActiveGroup(null)}
            onApprove={approveMember} onDecline={declineMember} onDeletePost={deletePost} onDeleteStory={deleteStory}
            onChat={m=>m} onRemoveMember={removeMember} chats={chats} onSendChat={sendChat}/>
        ):tab==="groups"?(
          <GroupsScreen groups={groups} members={members} myId={myId}
            onSelectGroup={g=>setActiveGroup(g)} onCreateGroup={createGroup}
            onRenameGroup={renameGroup} onDeleteGroup={deleteGroup} onGroupPicture={setGroupPicture}
            onApprove={approveMember} onDecline={declineMember}/>
        ):(
          <ProfileScreen myId={myId} members={members} groups={groups} posts={posts} onSaveProfile={saveProfile} chats={chats} onSendChat={sendChat}/>
        )}
        {!liveActiveGroup&&(
          <nav style={S.nav}>
            {[{id:"groups",icon:"people",label:"Groups"},{id:"profile",icon:"profile",label:"Profile"}].map(n=>(
              <button key={n.id} style={S.navBtn(tab===n.id)} onClick={()=>setTab(n.id)}>
                <Icon n={n.icon} size={24} color={tab===n.id?P.primary:P.muted} filled={tab===n.id}/>
                {n.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
