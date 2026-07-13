import { useState } from 'react';

const infoSections = [
  {
    id: 'levels',
    title: 'Los niveles',
    text: 'Cada nivel revela una capa distinta de la experiencia.',
  },
  {
    id: 'locations',
    title: 'Las localizaciones',
    text: 'Cada localización permanece velada hasta la confirmación del invitado.',
  },
  {
    id: 'signal',
    title: 'La señal',
    text: 'Cada evento existe solo para quienes saben interpretar las señales.',
  },
];

export default function EventAccessNotice({ styles }) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [openSections, setOpenSections] = useState([]);

  const toggleSection = (sectionId) => {
    setOpenSections((currentSections) =>
      currentSections.includes(sectionId)
        ? currentSections.filter((currentSection) => currentSection !== sectionId)
        : [...currentSections, sectionId],
    );
  };

  return (
    <section className={styles.levelInfoCard}>
      <button
        type='button'
        className={styles.levelInfoIntro}
        onClick={() => setNoticeOpen((isOpen) => !isOpen)}
        aria-expanded={noticeOpen}
        aria-controls='level-info-details'
      >
        <strong>
          No se entra por curiosidad. Se entra por invitación, preservando  así la
          naturaleza de  la organización.
        </strong>
        <span>
          Reservar no implica acceso garantizado: solo muestra temporalmente los
          pases de entrada hasta que la organización confirme la admisión.
        </span>
      </button>

      <div
        id='level-info-details'
        className={styles.levelInfoDetails}
        data-open={noticeOpen}
      >
        <div className={styles.levelInfoDetailsInner}>
          {infoSections.map((section) => {
            const sectionOpen = openSections.includes(section.id);

            return (
              <article key={section.id} className={styles.levelInfoItem}>
                <button
                  type='button'
                  className={styles.levelInfoTrigger}
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={sectionOpen}
                  aria-controls={`level-info-${section.id}`}
                >
                  {section.title}
                </button>

                <div
                  id={`level-info-${section.id}`}
                  className={styles.levelInfoPanel}
                  data-open={sectionOpen}
                >
                  <p>{section.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
