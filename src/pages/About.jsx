import { useEffect, useState } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';

import styles from './About.module.css';

const eventTypes = [
  'Cócteles de networking exclusivos',
  'Conferencias y seminarios selectos',
  'Experiencias gastronómicas únicas',
  'Eventos corporativos de alto nivel',
  'Celebraciones y aniversarios personalizados',
  'Presentaciones de productos de lujo',
];

const galaEventType = 'Galas y eventos de gala privados';

const vortexSlots = [
  { x: 50, y: 8, tilt: -3 },
  { x: 84, y: 50, tilt: 1 },
  { x: 66, y: 79, tilt: -2 },
  { x: 31, y: 80, tilt: 2 },
  { x: 15, y: 50, tilt: -2 },
  { x: 28, y: 24, tilt: 3 },
];

const galaVortexSlot = { x: 80, y: 26, tilt: 2 };

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getRandomOffset(range) {
  return Math.random() * range * 2 - range;
}

function createVortexItems(randomize = false) {
  const labels = randomize ? shuffleItems(eventTypes) : eventTypes;

  const regularItems = labels.map((label, index) => {
    const slot = vortexSlots[index];
    const x = slot.x + (randomize ? getRandomOffset(3.2) : 0);
    const y = slot.y + (randomize ? getRandomOffset(3.2) : 0);
    const dx = x - 50;
    const dy = y - 50;
    const orbitRadius = Math.sqrt(dx * dx + dy * dy);
    const orbitAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

    return {
      label,
      angle: orbitAngle,
      direction: index % 2 === 0 ? 1 : -1,
      radius: orbitRadius,
      tilt: slot.tilt + (randomize ? getRandomOffset(2.2) : 0),
    };
  });

  const galaOffset = randomize ? 1.1 : 0;
  const galaX = galaVortexSlot.x + getRandomOffset(galaOffset);
  const galaY = galaVortexSlot.y + getRandomOffset(galaOffset);
  const galaDx = galaX - 50;
  const galaDy = galaY - 50;

  return [
    ...regularItems,
    {
      label: galaEventType,
      angle: (Math.atan2(galaDy, galaDx) * 180) / Math.PI + 90,
      direction: 1,
      radius: Math.sqrt(galaDx * galaDx + galaDy * galaDy),
      tilt: galaVortexSlot.tilt + (randomize ? getRandomOffset(1) : 0),
    },
  ];
}

function getVortexItemStyle(item, orbitRotation) {
  const angle = item.angle + orbitRotation * item.direction;
  const radians = (angle * Math.PI) / 180;

  return {
    '--x': `${50 + Math.sin(radians) * item.radius}%`,
    '--y': `${50 - Math.cos(radians) * item.radius}%`,
    '--tilt': `${item.tilt}deg`,
  };
}

export default function About() {
  const [vortexItems, setVortexItems] = useState(() => createVortexItems());
  const [vortexActive, setVortexActive] = useState(false);
  const [orbitRotation, setOrbitRotation] = useState(0);

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      setVortexItems(createVortexItems(true));
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    if (!vortexActive) {
      return undefined;
    }

    let animationFrameId;
    let lastTimestamp = 0;

    const rotateVortex = (timestamp) => {
      if (lastTimestamp) {
        const elapsed = timestamp - lastTimestamp;
        setOrbitRotation((currentRotation) => (currentRotation + elapsed * 0.018) % 360);
      }

      lastTimestamp = timestamp;
      animationFrameId = window.requestAnimationFrame(rotateVortex);
    };

    animationFrameId = window.requestAnimationFrame(rotateVortex);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [vortexActive]);

  return (
    <>
      <Header />
      <main className={styles.aboutPage}>
        <section className={styles.aboutVortexHero}>
          <div>
            <span>Origen reservado</span>
            <h1>Paternostrum nace alrededor de una señal</h1>
            <p>
              Una plataforma privada para experiencias que no se anuncian: se
              reconocen. El encuentro aparece cuando la intención, el lugar y
              la persona adecuada coinciden.
            </p>
          </div>
        </section>

        {/* Sección: Clase de eventos */}
        <section className={`${styles.eventsSection} ${styles.aboutPanel}`}>
          <h2>Clase de eventos que ofrecemos</h2>
          <ul
            className={`${styles.vortexList} ${
              vortexActive ? styles.vortexListActive : ''
            }`}
          >
            {vortexItems.map((item) => (
              <li
                key={item.label}
                style={getVortexItemStyle(item, orbitRotation)}
              >
                <span>{item.label}</span>
              </li>
            ))}
            <li
              className={styles.vortexCenter}
              onMouseEnter={() => setVortexActive(true)}
              onMouseLeave={() => setVortexActive(false)}
              onFocus={() => setVortexActive(true)}
              onBlur={() => setVortexActive(false)}
              tabIndex={0}
              aria-label='Activar movimiento del vórtice'
            >
              Paternostrum
            </li>
          </ul>
        </section>

        {/* Sección: Por qué nació este proyecto */}
        <section className={`${styles.originSection} ${styles.aboutPanel}`}>
          <h2>Por qué nació este proyecto</h2>
          <p>
            Nació de la necesidad de crear un espacio donde personas de
            intereses similares y estándares elevados pudieran conectar y
            compartir experiencias auténticas. En un mundo saturado de eventos
            masivos, decidimos ofrecer algo diferente: encuentros íntimos,
            cuidadosamente organizados y accesibles solo para aquellos que
            comparten nuestra visión de exclusividad y excelencia.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
