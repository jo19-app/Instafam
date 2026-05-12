import { useState, useEffect, useRef } from "react";

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
const MOODS = ["😊 Happy","😂 Laughing","😍 In love","🥰 Grateful","😌 Peaceful","🤩 Excited",
  "😎 Cool","🥳 Celebrating","😴 Tired","🤔 Thinking","😤 Determined","🌟 Inspired","☕ Caffeinated"];
const HAIR = ["Blonde","Brown","Black","Red","Auburn","Grey","White","Silver","Blue","Pink","Purple","Bald","Other"];

function uid() { return Math.random().toString(36).slice(2,10); }
function ago(ts) {
  const d=(Date.now()-ts)/1000;
  if(d<60) return "just now";
  if(d<3600) return `${Math.floor(d/60)}m ago`;
  if(d<86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}
function readFile(file) {
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(file); });
}
async function saveImage(src, filename="instafam-photo.jpg") {
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

function seedData(myId,myName) {
  const members=[
    {id:myId, name:myName, avatar:AVATARS[0], nickname:"", age:"", mood:"😊 Happy", hairColour:"Brown", bio:""},
    {id:"u2", name:"Mom", avatar:AVATARS[1], nickname:"Mama Bear", age:"52", mood:"🥰 Grateful", hairColour:"Brown", bio:"Loves gardening and baking 🌻"},
    {id:"u3", name:"Dad", avatar:AVATARS[2], nickname:"The Chef", age:"55", mood:"☕ Caffeinated", hairColour:"Grey", bio:"Weekend BBQ king 🔥"},
    {id:"u4", name:"Sibling", avatar:AVATARS[3], nickname:"Sis", age:"24", mood:"😎 Cool", hairColour:"Blonde", bio:"Music, travel, coffee ✈️"},
  ];
  const gId=uid();
  return {
    groups:[{id:gId,name:"Family ❤️",emoji:"❤️",members:members.map(m=>m.id),inviteCode:uid(),createdBy:myId}],
    members,
    posts:[
      {id:uid(),groupId:gId,authorId:"u2",image:PHOTOS[0],caption:"Beautiful sunset from the back garden 🌅",likes:["u3","u4"],comments:[{id:uid(),authorId:"u3",text:"Gorgeous! 😍",ts:Date.now()-7200000}],ts:Date.now()-14400000},
      {id:uid(),groupId:gId,authorId:"u4",image:PHOTOS[3],caption:"Family game night 🎲 Who's ready for a rematch?",likes:[myId,"u2"],comments:[{id:uid(),authorId:myId,text:"I want a rematch! 😂",ts:Date.now()-3600000},{id:uid(),authorId:"u2",text:"Count me in!",ts:Date.now()-1800000}],ts:Date.now()-86400000},
    ],
    stories:[
      {id:uid(),groupId:gId,authorId:"u3",image:PHOTOS[4],ts:Date.now()-3600000,viewers:[]},
      {id:uid(),groupId:gId,authorId:"u2",image:PHOTOS[5],ts:Date.now()-7200000,viewers:[]},
    ],
  };
}

const S = {
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
      <img src="/icon-192.png" alt="Instafam" style={{height,width:height,borderRadius:height*0.22,objectFit:"cover",boxShadow:"0 2px 8px rgba(232,96,60,0.25)"}}/>
      <span style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:height*0.78,background:`linear-gradient(135deg,#1a3a6e,#00b4cc)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-0.5}}>
        Insta<span style={{background:`linear-gradient(135deg,#00b4cc,#00d4aa)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Fam</span>
      </span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({n,size=22,color="currentColor",filled=false}) {
  const I={
    heart:   filled?<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color}/>:<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>,
    comment: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>,
    send:    <><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/></>,
    download:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 10 12 15 17 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    camera:  <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" fill="none" stroke={color} strokeWidth="2"/></>,
    close:   <><line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    back:    <polyline points="15 18 9 12 15 6" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>,
    link:    <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    check:   <polyline points="20 6 9 17 4 12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>,
    edit:    <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    trash:   <><polyline points="3 6 5 6 21 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    people:  <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke={color} strokeWidth="2"/><circle cx="9" cy="7" r="4" fill="none" stroke={color} strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    profile: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke={color} strokeWidth="2"/><circle cx="12" cy="7" r="4" fill="none" stroke={color} strokeWidth="2"/></>,
    info:    <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/><line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{display:"block",flexShrink:0}}>{I[n]||null}</svg>;
}

function Av({src,size=36,border,style={}}) {
  return <img src={src||AVATARS[0]} alt="" style={{...S.av(size),border:border||"none",...style}} onError={e=>{e.target.onerror=null;e.target.src=AVATARS[0];}}/>;
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
function StoryViewer({story,author,onClose}) {
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
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color="#fff" size={26}/></button>
      </div>
      <img src={story.image} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="story"/>
    </div>
  );
}

// ── Image Picker ──────────────────────────────────────────────────────────────
function ImagePicker({onPick,label="Choose from Photo Library",hint=""}) {
  const libRef=useRef(); const camRef=useRef();
  async function handle(e) { const f=e.target.files?.[0]; if(!f) return; try{const d=await readFile(f);onPick(d);}catch{} }
  return (
    <div>
      <input ref={libRef} type="file" accept="image/*" onChange={handle} style={{display:"none"}}/>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={handle} style={{display:"none"}}/>
      <button onClick={()=>{libRef.current.value="";libRef.current.click();}}
        style={{width:"100%",border:`2px dashed ${P.primary}`,borderRadius:16,padding:"24px 16px",cursor:"pointer",background:`${P.primary}08`,display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginBottom:10}}>
        <Icon n="camera" color={P.primary} size={30}/>
        <span style={{fontWeight:700,fontSize:15,color:P.primary}}>{label}</span>
        {hint&&<span style={{fontSize:12,color:P.muted}}>{hint}</span>}
      </button>
      <button onClick={()=>{camRef.current.value="";camRef.current.click();}} style={{...S.ghost,width:"100%",fontSize:13,padding:"9px 0"}}>📷 Take Photo</button>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({post,members,myId,onLike,onComment,onAvatarClick}) {
  const [txt,setTxt]=useState(""); const [showC,setShowC]=useState(false); const [sv,setSv]=useState("idle");
  const author=members.find(m=>m.id===post.authorId); const liked=post.likes.includes(myId);
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
        <div>
          <button onClick={()=>onAvatarClick?.(author)} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontWeight:700,fontSize:14,color:P.text,fontFamily:"'Nunito',sans-serif"}}>{author?.name}</button>
          <div style={{fontSize:11,color:P.muted}}>{ago(post.ts)}</div>
        </div>
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

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({groupId,myId,onPost,onStory,onClose}) {
  const [tab,setTab]=useState("post"); const [image,setImage]=useState(null); const [caption,setCaption]=useState("");
  function submit() {
    if(!image) return;
    if(tab==="post") onPost({id:uid(),groupId,authorId:myId,image,caption,likes:[],comments:[],ts:Date.now()});
    else onStory({id:uid(),groupId,authorId:myId,image,ts:Date.now(),viewers:[]});
    onClose();
  }
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
        {image?(
          <div style={{position:"relative",marginBottom:16}}>
            <img src={image} style={{width:"100%",borderRadius:16,objectFit:"cover",maxHeight:300,display:"block"}} alt="preview"/>
            <button onClick={()=>setImage(null)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.55)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon n="close" color="#fff" size={16}/>
            </button>
          </div>
        ):(
          <div style={{marginBottom:16}}>
            <ImagePicker onPick={setImage} hint="Only visible to this group"/>
            <button onClick={()=>setImage(PHOTOS[Math.floor(Math.random()*PHOTOS.length)])} style={{...S.ghost,width:"100%",fontSize:13,padding:"9px 0",marginTop:8}}>🖼 Use Sample Photo</button>
          </div>
        )}
        {tab==="post"&&<textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write a caption…" style={{...S.input,minHeight:80,resize:"none",marginBottom:16}}/>}
        <button onClick={submit} disabled={!image} style={{...S.btn,width:"100%",opacity:image?1:0.5}}>Share {tab}</button>
      </div>
    </div>
  );
}

// ── Member Profile Viewer ─────────────────────────────────────────────────────
function MemberProfile({member,posts,onClose}) {
  if(!member) return null;
  const theirPosts=posts.filter(p=>p.authorId===member.id);
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,background:P.bg,overflowY:"auto"}}>
      <div style={{...S.topBar}}>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Icon n="back" color={P.primary} size={26}/></button>
        <span style={{fontWeight:800,fontSize:17,color:P.text}}>{member.name}'s Profile</span>
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
function GroupInfo({group,members,posts,myId,onClose,onViewMember}) {
  const gm=members.filter(m=>group.members.includes(m.id));
  const postCount=posts.filter(p=>p.groupId===group.id).length;
  return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:P.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:24,paddingBottom:"env(safe-area-inset-bottom,24px)",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 style={{margin:0,fontWeight:900,fontSize:20}}>{group.name}</h2>
            <p style={{margin:"2px 0 0",fontSize:13,color:P.muted}}>{gm.length} members · {postCount} posts</p>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><Icon n="close" color={P.muted}/></button>
        </div>
        <h3 style={{fontWeight:800,fontSize:15,marginBottom:12,color:P.text}}>Members</h3>
        {gm.map(m=>(
          <button key={m.id} onClick={()=>{onViewMember(m);onClose();}}
            style={{width:"100%",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${P.border}`,textAlign:"left"}}>
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
            <Icon n="back" color={P.muted} size={16}/>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Feed Screen ───────────────────────────────────────────────────────────────
function FeedScreen({group,posts,stories,members,myId,onLike,onComment,onPostNew,onStoryNew,onBack}) {
  const [sv,setSv]=useState(null); const [uploading,setUploading]=useState(false);
  const [viewMember,setViewMember]=useState(null); const [showInfo,setShowInfo]=useState(false);
  const me=members.find(m=>m.id===myId);
  const gPosts=posts.filter(p=>p.groupId===group.id).sort((a,b)=>b.ts-a.ts);
  const gStories=stories.filter(s=>s.groupId===group.id&&Date.now()-s.ts<86400000);
  const storyAuthors=[...new Map(gStories.map(s=>[s.authorId,s])).values()];
  const myStory=storyAuthors.find(s=>s.authorId===myId);
  return (
    <>
      {sv&&<StoryViewer story={sv} author={members.find(m=>m.id===sv.authorId)} onClose={()=>setSv(null)}/>}
      {uploading&&<UploadModal groupId={group.id} myId={myId} onClose={()=>setUploading(false)} onPost={onPostNew} onStory={onStoryNew}/>}
      {showInfo&&<GroupInfo group={group} members={members} posts={posts} myId={myId} onClose={()=>setShowInfo(false)} onViewMember={m=>setViewMember(m)}/>}
      {viewMember&&<MemberProfile member={viewMember} posts={posts} onClose={()=>setViewMember(null)}/>}
      <div style={S.topBar}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><Icon n="back" color={P.primary} size={26}/></button>
        <button onClick={()=>setShowInfo(true)} style={{background:"none",border:"none",cursor:"pointer",fontWeight:800,fontSize:17,color:P.text,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:6}}>
          {group.name} <Icon n="info" color={P.muted} size={16}/>
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
            <PostCard key={post.id} post={post} members={members} myId={myId} onLike={onLike} onComment={onComment} onAvatarClick={m=>setViewMember(m)}/>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────
function ProfileScreen({myId,members,groups,posts,onSaveProfile}) {
  const me=members.find(m=>m.id===myId)||{};
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState({});
  const myPosts=posts.filter(p=>p.authorId===myId);
  const myGroups=groups.filter(g=>g.members.includes(myId));

  function startEdit() { setDraft({name:me.name||"",nickname:me.nickname||"",age:me.age||"",mood:me.mood||"",hairColour:me.hairColour||"",bio:me.bio||"",avatar:me.avatar||AVATARS[0]}); setEditing(true); }
  function save() { onSaveProfile({...me,...draft}); setEditing(false); }

  return (
    <div style={{paddingBottom:100}}>
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
        <button onClick={startEdit} style={{...S.btn,marginTop:20,display:"inline-flex",alignItems:"center",gap:8}}>
          <Icon n="edit" color="#fff" size={16}/> Edit Profile
        </button>
      </div>
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
            {[
              {label:"Display name",key:"name",type:"text",placeholder:"Your name"},
              {label:"Nickname",key:"nickname",type:"text",placeholder:"e.g. Mama Bear"},
              {label:"Age",key:"age",type:"number",placeholder:"e.g. 32"},
              {label:"Bio",key:"bio",type:"textarea",placeholder:"A short bio about you…"},
            ].map(f=>(
              <div key={f.key} style={{marginBottom:14}}>
                <label style={{fontWeight:700,fontSize:13,color:P.text,display:"block",marginBottom:5}}>{f.label}</label>
                {f.type==="textarea"
                  ?<textarea value={draft[f.key]} onChange={e=>setDraft(x=>({...x,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{...S.input,minHeight:72,resize:"none"}}/>
                  :<input type={f.type} value={draft[f.key]} onChange={e=>setDraft(x=>({...x,[f.key]:e.target.value}))} placeholder={f.placeholder} style={S.input}/>
                }
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <label style={{fontWeight:700,fontSize:13,color:P.text,display:"block",marginBottom:5}}>Current Mood</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {MOODS.map(m=>(
                  <button key={m} onClick={()=>setDraft(x=>({...x,mood:m}))} style={{background:draft.mood===m?P.primary:P.bg,color:draft.mood===m?"#fff":P.text,border:`1.5px solid ${draft.mood===m?P.primary:P.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:draft.mood===m?700:500}}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontWeight:700,fontSize:13,color:P.text,display:"block",marginBottom:5}}>Hair Colour</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {HAIR.map(h=>(
                  <button key={h} onClick={()=>setDraft(x=>({...x,hairColour:h}))} style={{background:draft.hairColour===h?P.primary:P.bg,color:draft.hairColour===h?"#fff":P.text,border:`1.5px solid ${draft.hairColour===h?P.primary:P.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:draft.hairColour===h?700:500}}>{h}</button>
                ))}
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
function GroupsScreen({groups,members,myId,onSelectGroup,onCreateGroup,onRenameGroup,onDeleteGroup}) {
  const [creating,setCreating]=useState(false); const [newName,setNewName]=useState("");
  const [copiedId,setCopiedId]=useState(null); const [editState,setEditState]=useState({});

  function create() { if(!newName.trim()) return; onCreateGroup(newName.trim()); setNewName(""); setCreating(false); }
  function copyLink(g) {
    const link=`${window.location.origin}${window.location.pathname}?join=${g.inviteCode}&group=${encodeURIComponent(g.name)}`;
    navigator.clipboard?.writeText(link).catch(()=>{});
    setCopiedId(g.id); setTimeout(()=>setCopiedId(null),2000);
  }
  function startRename(g) { setEditState(s=>({...s,[g.id]:{mode:"rename",val:g.name}})); }
  function cancelEdit(id) { setEditState(s=>{const n={...s};delete n[id];return n;}); }
  function submitRename(g) { const v=editState[g.id]?.val?.trim(); if(v) onRenameGroup(g.id,v); cancelEdit(g.id); }
  function startDel(id) { setEditState(s=>({...s,[id]:{mode:"del"}})); }
  function confirmDel(id) { onDeleteGroup(id); cancelEdit(id); }

  return (
    <div style={{padding:"16px 16px 100px"}}>
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
      {groups.length===0&&(
        <div style={{textAlign:"center",padding:48,color:P.muted}}>
          <p style={{fontSize:48,margin:0}}>👨‍👩‍👧‍👦</p>
          <p style={{marginTop:12,fontWeight:700}}>No groups yet</p>
          <p style={{fontSize:14}}>Create one and invite your family!</p>
        </div>
      )}
      {groups.map(g=>{
        const gm=members.filter(m=>g.members.includes(m.id));
        const isOwner=g.createdBy===myId;
        const es=editState[g.id];
        return (
          <div key={g.id} style={S.card}>
            {es?.mode==="rename"&&(
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${P.border}`,background:`${P.primary}08`}}>
                <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:P.primary}}>Rename group</p>
                <input value={es.val} onChange={e=>setEditState(s=>({...s,[g.id]:{...s[g.id],val:e.target.value}}))}
                  onKeyDown={e=>{if(e.key==="Enter") submitRename(g);if(e.key==="Escape") cancelEdit(g.id);}}
                  style={{...S.input,marginBottom:10}} autoFocus/>
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
            <div style={{padding:"16px 16px 12px",cursor:"pointer"}} onClick={()=>onSelectGroup(g)}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{width:48,height:48,borderRadius:16,background:`linear-gradient(135deg,${P.primary},${P.dark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
                  {g.emoji||"👨‍👩‍👧‍👦"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:17,color:P.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.name}</div>
                  <div style={{fontSize:12,color:P.muted,display:"flex",alignItems:"center",gap:6}}>
                    {gm.length} member{gm.length!==1?"s":""}
                    {isOwner&&<span style={{background:P.accent,color:P.dark,borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:700}}>Owner</span>}
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
              <button onClick={()=>copyLink(g)} style={{...S.ghost,flex:1,fontSize:13,padding:"8px 0",minWidth:60,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                {copiedId===g.id?<><Icon n="check" color={P.primary} size={14}/>Copied!</>:<><Icon n="link" color={P.primary} size={14}/>Invite</>}
              </button>
              {isOwner&&<>
                <button onClick={()=>startRename(g)} style={{background:P.bg,border:`1.5px solid ${P.border}`,borderRadius:24,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:P.muted,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>
                  <Icon n="edit" color={P.muted} size={15}/> Rename
                </button>
                <button onClick={()=>startDel(g.id)} style={{background:"#fff5f5",border:"1.5px solid #fcc",borderRadius:24,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#c0392b",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>
                  <Icon n="trash" color="#c0392b" size={15}/> Delete
                </button>
              </>}
            </div>
          </div>
        );
      })}
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
          <img src="/icon-512.png" alt="Instafam" style={{width:100,height:100,borderRadius:24,boxShadow:"0 8px 32px rgba(0,0,0,0.35)"}}/>
        </div>
        <div style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:42,color:"#fff",letterSpacing:-1}}>
          Insta<span style={{color:"#7ee8f5"}}>Fam</span>
        </div>
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
  const [myId]=useState(()=>{ let id=localStorage.getItem("if_id"); if(!id){id=uid();localStorage.setItem("if_id",id);} return id; });
  const [myName,setMyName]=useState(()=>localStorage.getItem("if_name")||"");
  const [data,setData]=useState(()=>{ const s=localStorage.getItem("if_data"); return s?JSON.parse(s):null; });
  const [tab,setTab]=useState("groups");
  const [activeGroup,setActiveGroup]=useState(null);

  const params=new URLSearchParams(window.location.search);
  const joinCode=params.get("join");
  const joinGroupName=params.get("group")||"";

  // PWA deep-link: already logged-in user receives a new invite link
  useEffect(()=>{
    if(!joinCode||!data||!myName) return;
    const group=data.groups.find(g=>g.inviteCode===joinCode);
    if(!group) return;
    if(!group.members.includes(myId)) {
      setData(d=>({...d,groups:d.groups.map(g=>g.id===group.id?{...g,members:[...g.members,myId]}:g)}));
    }
    window.history.replaceState({},"",window.location.pathname);
  },[joinCode]);

  useEffect(()=>{ if(data) localStorage.setItem("if_data",JSON.stringify(data)); },[data]);

  function onboard(name) {
    setMyName(name); localStorage.setItem("if_name",name);
    let base=data;
    if(!base) {
      base=seedData(myId,name);
    } else {
      const exists=base.members.find(m=>m.id===myId);
      base={...base,members:exists
        ?base.members.map(m=>m.id===myId?{...m,name}:m)
        :[...base.members,{id:myId,name,avatar:AVATARS[0],nickname:"",age:"",mood:"",hairColour:"",bio:""}]
      };
    }
    // Join group as MEMBER only — never as owner
    if(joinCode) {
      const g=base.groups.find(g=>g.inviteCode===joinCode);
      if(g&&!g.members.includes(myId)) {
        base={...base,groups:base.groups.map(gr=>gr.inviteCode===joinCode?{...gr,members:[...gr.members,myId]}:gr)};
      }
    }
    window.history.replaceState({},"",window.location.pathname);
    setData(base);
  }

  function saveProfile(updated) { setMyName(updated.name); localStorage.setItem("if_name",updated.name); setData(d=>({...d,members:d.members.map(m=>m.id===myId?updated:m)})); }
  function createGroup(name) { setData(d=>({...d,groups:[...d.groups,{id:uid(),name,emoji:"👨‍👩‍👧‍👦",members:[myId],inviteCode:uid(),createdBy:myId}]})); }
  function renameGroup(id,name) { setData(d=>({...d,groups:d.groups.map(g=>g.id===id&&g.createdBy===myId?{...g,name}:g)})); setActiveGroup(ag=>ag&&ag.id===id?{...ag,name}:ag); }
  function deleteGroup(id) { setData(d=>({...d,groups:d.groups.filter(g=>!(g.id===id&&g.createdBy===myId)),posts:d.posts.filter(p=>p.groupId!==id),stories:d.stories.filter(s=>s.groupId!==id)})); setActiveGroup(ag=>ag&&ag.id===id?null:ag); }
  function like(pid) { setData(d=>({...d,posts:d.posts.map(p=>p.id===pid?{...p,likes:p.likes.includes(myId)?p.likes.filter(i=>i!==myId):[...p.likes,myId]}:p)})); }
  function comment(pid,text) { setData(d=>({...d,posts:d.posts.map(p=>p.id===pid?{...p,comments:[...p.comments,{id:uid(),authorId:myId,text,ts:Date.now()}]}:p)})); }
  function newPost(post) { setData(d=>({...d,posts:[post,...d.posts]})); }
  function newStory(story) { setData(d=>({...d,stories:[story,...d.stories]})); }

  if(!myName) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <Onboarding onDone={onboard} joinCode={joinCode} joinGroupName={joinGroupName}/>
    </>
  );

  const groups=data?.groups||[]; const members=data?.members||[];
  const posts=data?.posts||[];   const stories=data?.stories||[];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.app}>
        {!activeGroup&&(
          <div style={S.topBar}>
            <Logo height={32}/>
            <span style={{fontSize:13,fontWeight:700,color:P.muted}}>Hi, {myName.split(" ")[0]} 👋</span>
          </div>
        )}
        {activeGroup?(
          <FeedScreen group={activeGroup} posts={posts} stories={stories} members={members} myId={myId}
            onLike={like} onComment={comment} onPostNew={newPost} onStoryNew={newStory} onBack={()=>setActiveGroup(null)}/>
        ):tab==="groups"?(
          <GroupsScreen groups={groups} members={members} myId={myId}
            onSelectGroup={g=>setActiveGroup(g)} onCreateGroup={createGroup}
            onRenameGroup={renameGroup} onDeleteGroup={deleteGroup}/>
        ):(
          <ProfileScreen myId={myId} members={members} groups={groups} posts={posts} onSaveProfile={saveProfile}/>
        )}
        {!activeGroup&&(
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
