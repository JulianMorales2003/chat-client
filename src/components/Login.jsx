import { useState } from 'react';
import { AVATARES } from '../config.js';

export default function Login({ onEntrar, conectando }) {
  const [nombre, setNombre] = useState('');
  const [avatar, setAvatar] = useState(AVATARES[0].emoji);

  const entrar = (e) => {
    e.preventDefault();
    if (nombre.trim()) onEntrar(nombre.trim().slice(0, 30), avatar);
  };

  return (
    <div className="login-fondo">
      <form className="pizarra" onSubmit={entrar}>
        <div className="humo" aria-hidden="true"><span /><span /><span /></div>
        <p className="pizarra-kicker">Hoy en el menú</p>
        <h1>El Fogón</h1>
        <p className="pizarra-sub">Antojos, recetas y fotos de comida colombiana, en vivo.</p>

        <label className="pizarra-label" htmlFor="nombre">¿Cómo te dicen, veci?</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" maxLength={30} autoFocus />

        <p className="pizarra-label">Escoge tu plato</p>
        <div className="avatares" role="radiogroup" aria-label="Avatar">
          {AVATARES.map((a) => (
            <button
              type="button"
              key={a.emoji}
              role="radio"
              aria-checked={avatar === a.emoji}
              className={`avatar-op ${avatar === a.emoji ? 'sel' : ''}`}
              onClick={() => setAvatar(a.emoji)}
              title={a.nombre}
            >
              <span>{a.emoji}</span>
              <small>{a.nombre}</small>
            </button>
          ))}
        </div>

        <button className="btn-fogon" disabled={!nombre.trim() || conectando}>
          {conectando ? 'Prendiendo el fogón…' : 'Entrar a la cocina 🔥'}
        </button>
      </form>
    </div>
  );
}
