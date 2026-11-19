export const SERVER = (import.meta.env.VITE_SERVER_URL || 'http://localhost:8080').replace(/\/$/, '');
export const WS_URL = SERVER.replace(/^http/, 'ws') + '/ws';

/** Avatares de comida que se escogen al entrar */
export const AVATARES = [
  { emoji: '🫓', nombre: 'Arepa' },
  { emoji: '🌽', nombre: 'Mazorca' },
  { emoji: '🍌', nombre: 'Patacón' },
  { emoji: '🧀', nombre: 'Quesito' },
  { emoji: '🥑', nombre: 'Aguacate' },
  { emoji: '🥘', nombre: 'Sancocho' },
  { emoji: '🍳', nombre: 'Calentado' },
  { emoji: '☕', nombre: 'Tinto' },
];

/** Reacciones con sabor */
export const REACCIONES = ['🤤', '😋', '🔥', '👏', '🌶️'];

/** Frases rápidas del fogón */
export const ANTOJOS = ['¿Quién trae el ají? 🌶️', '¡A la mesa! 🍽️', 'Pásame la receta 📝', '¿Hay tinto? ☕'];
