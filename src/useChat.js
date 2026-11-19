import { useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { SERVER, WS_URL } from './config.js';

/**
 * Toda la conexion STOMP del chat:
 *  - se suscribe a /topic/sala, /topic/usuarios y /topic/escribiendo
 *  - publica en /app/chat.unirse, /app/chat.enviar y /app/chat.escribiendo
 */
export function useChat() {
  const [estado, setEstado] = useState('fuera'); // fuera | conectando | conectado | reconectando
  const [yo, setYo] = useState(null); // { nombre, avatar }
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [escribiendo, setEscribiendo] = useState([]);
  const [reacciones, setReacciones] = useState({}); // { idMensaje: { emoji: [autores] } }
  const clientRef = useRef(null);
  const timers = useRef({});
  const ultimoAviso = useRef(0);

  const alMensaje = useCallback((m) => {
    if (m.tipo === 'REACCION') {
      // Cada reaccion es un "toggle": si el autor ya habia reaccionado con ese emoji, se quita
      setReacciones((prev) => {
        const delMensaje = { ...(prev[m.refId] || {}) };
        const autores = new Set(delMensaje[m.contenido] || []);
        autores.has(m.autor) ? autores.delete(m.autor) : autores.add(m.autor);
        delMensaje[m.contenido] = [...autores];
        return { ...prev, [m.refId]: delMensaje };
      });
      return;
    }
    if (m.tipo !== 'UNION' && m.tipo !== 'SALIDA') quitarEscribiendo(m.autor);
    setMensajes((prev) => [...prev, m]);
  }, []);

  function quitarEscribiendo(nombre) {
    clearTimeout(timers.current[nombre]);
    setEscribiendo((prev) => prev.filter((n) => n !== nombre));
  }

  const entrar = useCallback(
    (nombre, avatar) => {
      setYo({ nombre, avatar });
      setEstado('conectando');
      const client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 3000,
        onConnect: () => {
          setEstado('conectado');
          client.subscribe('/topic/sala', (f) => alMensaje(JSON.parse(f.body)));
          client.subscribe('/topic/usuarios', (f) => setUsuarios(JSON.parse(f.body)));
          client.subscribe('/topic/escribiendo', (f) => {
            const quien = f.body;
            if (!quien || quien === nombre) return;
            setEscribiendo((prev) => (prev.includes(quien) ? prev : [...prev, quien]));
            clearTimeout(timers.current[quien]);
            timers.current[quien] = setTimeout(() => quitarEscribiendo(quien), 2000);
          });
          // al (re)conectar se vuelve a anunciar: la sesion WebSocket es nueva
          client.publish({ destination: '/app/chat.unirse', body: JSON.stringify({ tipo: 'UNION', autor: nombre, avatar }) });
        },
        onWebSocketClose: () => setEstado((e) => (e === 'fuera' ? e : 'reconectando')),
      });
      client.activate();
      clientRef.current = client;
    },
    [alMensaje]
  );

  const salir = useCallback(() => {
    clientRef.current?.deactivate();
    clientRef.current = null;
    setEstado('fuera');
    setMensajes([]);
    setUsuarios([]);
    setReacciones({});
    setEscribiendo([]);
  }, []);

  const publicar = (destino, cuerpo) => {
    if (!clientRef.current?.connected) return false;
    clientRef.current.publish({ destination: destino, body: JSON.stringify(cuerpo) });
    return true;
  };

  const enviar = (tipo, contenido) => publicar('/app/chat.enviar', { tipo, contenido });
  const reaccionar = (refId, emoji) => publicar('/app/chat.enviar', { tipo: 'REACCION', contenido: emoji, refId });

  /** Avisa "esta escribiendo" maximo una vez por segundo */
  const avisarEscritura = () => {
    const ahora = Date.now();
    if (ahora - ultimoAviso.current < 1000 || !clientRef.current?.connected) return;
    ultimoAviso.current = ahora;
    clientRef.current.publish({ destination: '/app/chat.escribiendo', body: yo?.nombre || '' });
  };

  /** Fotos y notas de voz se suben por HTTP; por el WebSocket solo viaja la URL */
  const subir = async (archivo) => {
    const datos = new FormData();
    datos.append('archivo', archivo);
    const r = await fetch(SERVER + '/api/archivos', { method: 'POST', body: datos });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.error || 'No se pudo subir el archivo');
    return json.url;
  };

  useEffect(() => {
    return () => {
      clientRef.current?.deactivate();
    };
  }, []);

  return { estado, yo, mensajes, usuarios, escribiendo, reacciones, entrar, salir, enviar, reaccionar, avisarEscritura, subir };
}
