import { useEffect, useRef } from 'react';
import Login from './components/Login.jsx';
import Mensaje from './components/Mensaje.jsx';
import BarraEnvio from './components/BarraEnvio.jsx';
import { useChat } from './useChat.js';

const textoEscribiendo = (nombres) => {
  if (nombres.length === 0) return '';
  if (nombres.length === 1) return `${nombres[0]} está revolviendo la olla…`;
  if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]} están cocinando algo…`;
  return `${nombres.length} personas están picando cebolla…`;
};

export default function App() {
  const chat = useChat();
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.mensajes.length]);

  if (chat.estado === 'fuera' || (chat.estado === 'conectando' && chat.mensajes.length === 0)) {
    return <Login onEntrar={chat.entrar} conectando={chat.estado === 'conectando'} />;
  }

  const prendido = chat.estado === 'conectado';

  return (
    <div className="cocina">
      <header className="cabecera">
        <div className="marca">
          <img src="/olla.svg" alt="" width="40" height="40" />
          <div>
            <h1>El Fogón</h1>
            <p>Antojos y recetas colombianas en vivo</p>
          </div>
        </div>
        <div className={`estado ${prendido ? 'on' : 'off'}`} role="status">
          {prendido ? '🔥 Fogón prendido' : '🧯 Fogón apagado · reconectando…'}
        </div>
        <div className="yo">
          <span className="avatar">{chat.yo.avatar}</span>
          <b>{chat.yo.nombre}</b>
          <button type="button" className="btn-salir" onClick={chat.salir}>
            Salir
          </button>
        </div>
      </header>

      <aside className="tablero">
        <h2>En la cocina</h2>
        <p className="tablero-sub">{chat.usuarios.length} {chat.usuarios.length === 1 ? 'cocinero' : 'cocineros'}</p>
        <ul>
          {chat.usuarios.map((u) => (
            <li key={u.nombre} className={u.nombre === chat.yo.nombre ? 'yo-mismo' : ''}>
              <span className="avatar">{u.avatar}</span>
              <span>{u.nombre}{u.nombre === chat.yo.nombre && ' (tú)'}</span>
              {chat.escribiendo.includes(u.nombre) && <span className="burbujitas" aria-label="escribiendo"><i /><i /><i /></span>}
            </li>
          ))}
        </ul>
        <div className="receta-dia">
          <p>Receta del día</p>
          <strong>Ajiaco santafereño</strong>
          <small>Papa criolla, sabanera y pastusa, pollo, mazorca y guascas. Crema y alcaparras al servir.</small>
        </div>
      </aside>

      <main className="mesa">
        <ul className="mensajes" aria-live="polite">
          {chat.mensajes.length === 0 && <li className="vacio">La olla está montada. ¡Saluda a la cocina! 👋</li>}
          {chat.mensajes.map((m) => (
            <Mensaje key={m.id} m={m} yo={chat.yo.nombre} reacciones={chat.reacciones[m.id]} onReaccionar={chat.reaccionar} />
          ))}
          <li ref={finRef} />
        </ul>
        <p className="escribiendo">{textoEscribiendo(chat.escribiendo)}</p>
        <BarraEnvio
          deshabilitado={!prendido}
          onTexto={(t) => chat.enviar('TEXTO', t)}
          onArchivo={async (tipo, archivo) => chat.enviar(tipo, await chat.subir(archivo))}
          onEscribiendo={chat.avisarEscritura}
        />
      </main>
    </div>
  );
}
