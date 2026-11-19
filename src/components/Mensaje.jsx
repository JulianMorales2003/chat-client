import { SERVER, REACCIONES } from '../config.js';

export default function Mensaje({ m, yo, reacciones, onReaccionar }) {
  if (m.tipo === 'UNION' || m.tipo === 'SALIDA') {
    return (
      <li className={`sistema ${m.tipo.toLowerCase()}`}>
        <span>{m.tipo === 'UNION' ? '🧑‍🍳' : '👋'} {m.contenido}</span>
        <small>{m.fecha}</small>
      </li>
    );
  }

  const mio = m.autor === yo;
  const lista = Object.entries(reacciones || {}).filter(([, autores]) => autores.length > 0);

  return (
    <li className={`fila ${mio ? 'mio' : 'otro'}`}>
      {!mio && <span className="avatar" title={m.autor}>{m.avatar}</span>}
      <div className="burbuja-col">
        <div className={`burbuja ${m.tipo.toLowerCase()}`}>
          {!mio && <b className="autor">{m.autor}</b>}
          {m.tipo === 'TEXTO' && <p>{m.contenido}</p>}
          {m.tipo === 'IMAGEN' && (
            <figure className="polaroid">
              <img src={SERVER + m.contenido} alt={`Foto enviada por ${m.autor}`} />
              <figcaption>Plato de {m.autor}</figcaption>
            </figure>
          )}
          {m.tipo === 'AUDIO' && (
            <div className="nota-voz">
              <span>🎙️ Nota de voz</span>
              <audio controls src={SERVER + m.contenido} />
            </div>
          )}
          <small className="hora">{m.fecha}</small>
          <div className="reaccionar" role="group" aria-label="Reaccionar">
            {REACCIONES.map((r) => (
              <button key={r} type="button" onClick={() => onReaccionar(m.id, r)} aria-label={`Reaccionar ${r}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {lista.length > 0 && (
          <div className="reacciones">
            {lista.map(([emoji, autores]) => (
              <button
                key={emoji}
                type="button"
                className={`reaccion ${autores.includes(yo) ? 'propia' : ''}`}
                title={autores.join(', ')}
                onClick={() => onReaccionar(m.id, emoji)}
              >
                {emoji} {autores.length}
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
