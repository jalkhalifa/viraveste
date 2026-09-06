"use client";
import { Bell } from "lucide-react";import { useEffect,useState } from "react";
export function NotificationBell({className="bare"}:{className?:string}){const [count,setCount]=useState(0);useEffect(()=>{fetch("/api/notifications?count=1").then(r=>r.ok?r.json():Promise.reject()).then(data=>setCount(data.unread||0)).catch(()=>{})},[]);return <a className={className+" notification-bell"} href="/perfil/notificacoes" aria-label={count?"Notificações: "+count+" não lidas":"Notificações"}><Bell/>{count>0&&<i>{count>99?"99+":count}</i>}</a>}
