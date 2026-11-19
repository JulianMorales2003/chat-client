import { Suspense, lazy, useRef, useState } from 'react';

// El selector de emojis pesa bastante: se descarga solo la primera vez que se abre
const EmojiPicker = lazy(() => import('emoji-picker-react'));
import { ANTOJOS } from '../config.js';

export default function BarraEnvio({ onTexto, onArchivo, onEscribiendo, deshabilitado }) {
  const [texto, setTexto] = useState('');
  const [verEmojis, setVerEmojis] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const grabadorRef = useRef(null);

  const mandar = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    onTexto(texto.trim());
    setTexto('');
    setVerEmojis(false);
  };

  const subirArchivo = async (tipo, archivo) => {
    setSubiendo(true);
    setError('');
    try {
      await onArchivo(tipo, archivo);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  async function grabar() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const grabador = new MediaRecorder(stream);
      const partes = [];
      grabador.ondataavailable = (e) => partes.push(e.data);
      grabador.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = grabador.mimeType || 'audio/webm';
        const blob = new Blob(partes, { type: mime });
        const ext = mime.includes('mp4') ? 'mp4' : 'webm';
        subirArchivo('AUDIO', new File([blob], 'nota.' + ext, { type: mime }));
      };
      grabador.start();
      grabadorRef.current = grabador;
      setGrabando(true);
    } catch {
      setError('No se pudo usar el micrófono (solo funciona en localhost o HTTPS).');
    }
  }

  function parar() {
    grabadorRef.current?.stop();
    setGrabando(false);
  }

  return (
    <div className="barra-wrap">
      <div className="antojos">
        {ANTOJOS.map((a) => (
          <button key={a} type="button" disabled={deshabilitado} onClick={() => onTexto(a)}>
            {a}
          </button>
        ))}
      </div>
      {error && <p className="barra-error" role="alert">{error}</p>}
      {verEmojis && (
        <div className="picker">
          <Suspense fallback={<div className="picker-cargando">Cargando emojis…</div>}>
          <EmojiPicker
            onEmojiClick={(e) => setTexto((t) => t + e.emoji)}
            theme="light"
            emojiStyle="native"
            searchPlaceHolder="Buscar emoji"
            width={320}
            height={380}
            previewConfig={{ showPreview: false }}
          />
          </Suspense>
        </div>
      )}
      <form className="barra" onSubmit={mandar}>
        <button type="button" className="icono" onClick={() => setVerEmojis(!verEmojis)} aria-label="Emojis" title="Emojis">
          😄
        </button>
        <label className={`icono ${subiendo ? 'ocupado' : ''}`} title="Foto del plato" aria-label="Enviar foto">
          📷
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={deshabilitado || subiendo}
            onChange={(e) => {
              const archivo = e.target.files[0];
              if (archivo) subirArchivo('IMAGEN', archivo);
              e.target.value = '';
            }}
          />
        </label>
        <button
          type="button"
          className={`icono ${grabando ? 'grabando' : ''}`}
          onClick={grabando ? parar : grabar}
          disabled={deshabilitado || subiendo}
          aria-label={grabando ? 'Detener grabación' : 'Grabar nota de voz'}
          title={grabando ? 'Detener' : 'Nota de voz'}
        >
          {grabando ? '⏹️' : '🎙️'}
        </button>
        <input
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            onEscribiendo();
          }}
          placeholder={grabando ? 'Grabando nota de voz…' : 'Escribe tu antojo…'}
          maxLength={1000}
          disabled={deshabilitado}
        />
        <button className="btn-servir" disabled={deshabilitado || !texto.trim()}>
          Servir
        </button>
      </form>
    </div>
  );
}
