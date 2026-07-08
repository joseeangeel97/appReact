import { useState } from 'react';

const infoSections = [
  {
    id: 'levels',
    title: 'Los niveles',
    levels: [
      {
        name: 'Nivel I: El Atrio',
        paragraphs: [
          'El Atrio es la primera puerta de entrada a la plataforma.',
          'Está pensado para invitados selectos que comienzan a formar parte del universo privado de la marca. Los eventos de este nivel son elegantes, cuidados y exclusivos, pero mantienen un carácter más abierto dentro del círculo privado.',
          'Aquí predominan las experiencias de descubrimiento: cócteles de networking, seminarios selectos, cenas sensoriales y celebraciones personalizadas.',
          'El objetivo de este nivel es crear una primera conexión entre el invitado y la comunidad.',
        ],
        profile:
          'Personas con interés en el lujo, el networking, la cultura, la gastronomía, los negocios y las experiencias privadas.',
        experience:
          'Sofisticada, accesible dentro de la exclusividad, social y de descubrimiento.',
        feeling:
          'Entrar en una antesala reservada, donde todo está cuidado, pero aún queda mucho por revelar.',
      },
      {
        name: 'Nivel II: El Círculo',
        paragraphs: [
          'El Círculo representa un acceso más privado, estratégico y refinado.',
          'Los invitados de este nivel ya no solo asisten: empiezan a pertenecer. Las experiencias son más cerradas, con una selección más cuidadosa de perfiles y una intención más clara detrás de cada encuentro.',
          'Aquí aparecen galas privadas, eventos corporativos de alto nivel, presentaciones de productos de lujo y conferencias reservadas.',
          'El objetivo de este nivel es generar relaciones de valor, alianzas, prestigio y presencia dentro de un entorno de confianza.',
        ],
        profile:
          'Directivos, empresarios, inversores, líderes de marca, creadores influyentes, coleccionistas y perfiles con alto valor relacional.',
        experience:
          'Más estratégica, más íntima, más curada y con mayor nivel de protocolo.',
        feeling:
          'Entrar en una sala donde cada persona ha sido elegida por una razón.',
      },
      {
        name: 'Nivel III: El Santuario',
        paragraphs: [
          'El Santuario es el nivel más alto de acceso.',
          'Está reservado para miembros especiales, invitados excepcionales y perfiles que representan plenamente el espíritu de la plataforma. Aquí la exclusividad ya no se anuncia: se da por entendida.',
          'Las experiencias de este nivel son secretas, ceremoniales, inmersivas y profundamente personalizadas. El acceso es limitado y la localización se mantiene en clave hasta la confirmación final.',
          'Aquí se celebran cenas secretas, galas supremas, encuentros ultraprivados, presentaciones exclusivas y ceremonias de cierre.',
          'El objetivo de este nivel es crear experiencias irrepetibles, casi legendarias, donde el invitado no solo participa, sino que forma parte del mito.',
        ],
        profile:
          'Miembros de máxima confianza, figuras influyentes, coleccionistas, embajadores privados, socios estratégicos y personas invitadas directamente por la organización.',
        experience:
          'Muy íntima, simbólica, sensorial, altamente personalizada y de acceso restringido.',
        feeling: 'Cruzar una puerta que no todos saben que existe.',
      },
    ],
  },
  {
    id: 'locations',
    title: 'Las localizaciones',
    intro: {
      title: 'El Padre nunca está lejos. Su forma revela la entrada.',
      paragraphs: [
        'Toda localización de Paternostrum comparte una ley común: antes de encontrar el lugar, debe reconocerse la presencia del Padre.',
        'Puede aparecer como figura, estatua, retrato, sombra, inscripción, inicial, relieve, geometría, forma arquitectónica o símbolo de origen, autoridad, guía y protección.',
        'La localización explica el sentido del lugar. La señal indica cómo reconocerlo.',
      ],
    },
    locations: [
      {
        name: 'Jardín de Mercurio',
        explanation:
          'Un enclave de movimiento, palabra e intercambio. Representa el arte de conectar sin forzar, de hablar sin revelar demasiado y de abrir caminos mediante encuentros aparentemente casuales.',
        energy: 'ágil, magnética, social, estratégica.',
      },
      {
        name: 'Biblioteca de Obsidiana',
        explanation:
          'Un espacio de conocimiento reservado y silencio profundo. La obsidiana simboliza protección, claridad oscura y verdades que no se entregan fácilmente.',
        energy: 'intelectual, introspectiva, elegante, hermética.',
      },
      {
        name: 'Mesa Lunar',
        explanation:
          'Una localización íntima y sensorial, marcada por la intuición, la noche y los reflejos. Todo gira alrededor de una presencia central, suave y casi ritual.',
        energy: 'sensorial, íntima, nocturna, envolvente.',
      },
      {
        name: 'Salón del Número Secreto',
        explanation:
          'Un lugar dedicado a cifras, fechas, aniversarios, códigos privados y memorias cifradas. Aquí los números no decoran: guardan significado.',
        energy: 'personal, simbólica, emocional, ceremonial.',
      },
      {
        name: 'Palacio Sin Nombre',
        explanation:
          'Un espacio de lujo silencioso, sin necesidad de mostrarse. Su poder nace de la ausencia de nombre, de aquello que existe solo para quienes han sido convocados.',
        energy: 'majestuosa, discreta, solemne, exclusiva.',
      },
      {
        name: 'Cámara de Marfil',
        explanation:
          'Un recinto de decisión, orden y autoridad. Evoca acuerdos privados, precisión, jerarquía y poder contenido.',
        energy: 'ejecutiva, precisa, sobria, poderosa.',
      },
      {
        name: 'Galería del Alquimista',
        explanation:
          'Un espacio de transformación y revelación. Aquí la materia se convierte en símbolo, el objeto en deseo y la presentación en ceremonia.',
        energy: 'creativa, lujosa, transformadora, magnética.',
      },
      {
        name: 'Observatorio de Saturno',
        explanation:
          'Un lugar elevado, mental y visionario. Saturno representa tiempo, estructura, destino y mirada a largo plazo.',
        energy: 'visionaria, estratégica, fría, contemplativa.',
      },
      {
        name: 'Isla Sumergida',
        explanation:
          'Una localización ligada a lo oculto, lo perdido y lo legendario. Evoca una belleza bajo la superficie, un mundo que solo aparece cuando se sabe descender.',
        energy: 'mítica, profunda, secreta, hipnótica.',
      },
      {
        name: 'Teatro Astral',
        explanation:
          'Un escenario simbólico donde la máscara, la belleza y el destino se cruzan. Todo parece preparado para una ceremonia escrita por fuerzas invisibles.',
        energy: 'dramática, ceremonial, estética, cósmica.',
      },
      {
        name: 'Sala del Zodíaco',
        explanation:
          'Un espacio de arquetipos, equilibrio y selección. Su lógica gira alrededor del número doce, la geometría circular y la posición exacta de cada presencia.',
        energy: 'selectiva, simbólica, magnética, ordenada.',
      },
      {
        name: 'Cripta de Cristal',
        explanation:
          'Un lugar de custodia y revelación. La cripta protege; el cristal muestra. Su tensión está en permitir ver sin entregar del todo.',
        energy: 'preciosa, secreta, fría, ritual.',
      },
      {
        name: 'Santuario de la Rosa Negra',
        explanation:
          'Un espacio final, oscuro y transformador. La rosa negra representa rareza, deseo, despedida y belleza imposible.',
        energy: 'oscura, elegante, final, transformadora.',
      },
    ],
  },
  {
    id: 'signal',
    title: 'La señal',
    intro: {
      title: 'Primero se busca al Padre. Después se lee la marca.',
      paragraphs: [
        'Antes de leer cualquier señal específica, busca la presencia del Padre.',
        'Puede estar cerca de la entrada, del centro del espacio, de una figura elevada, de una inscripción discreta o de una forma que parezca vigilar el paso.',
        'Solo cuando la señal responde, la entrada empieza a revelarse.',
      ],
    },
    signals: [
      {
        name: 'Señal común de Paternostrum',
        signs:
          'Figura, estatua, retrato, sombra, inscripción, inicial, relieve, geometría o símbolo de origen.',
        key: 'El Padre nunca está lejos. Su forma revela la entrada.',
      },
      {
        name: 'Señal del Jardín de Mercurio',
        signs:
          'Figura alada, fuente pequeña, caminos cruzados, hojas brillantes, metal plateado o terraza interior escondida.',
        key:
          'Donde el murmullo fluye sin elevarse y los caminos se cruzan sin anunciarse, Mercurio deja su marca.',
      },
      {
        name: 'Señal de la Biblioteca de Obsidiana',
        signs:
          'Piedra negra, puerta oscura, libros antiguos, cristal negro, lámparas bajas, página sin título o inscripción casi invisible.',
        key:
          'Donde el silencio pesa más que la voz y los libros parecen guardar algo, la Obsidiana empieza a hablar.',
      },
      {
        name: 'Señal de la Mesa Lunar',
        signs:
          'Mesa redonda, luz plateada, velas blancas, copas claras, superficies nacaradas, agua quieta o círculo incompleto.',
        key:
          'Donde la luz no ilumina del todo y todo parece dispuesto en círculo, la Luna señala la mesa.',
      },
      {
        name: 'Señal del Salón del Número Secreto',
        signs:
          'Número repetido, placa discreta, mesa numerada, reloj detenido, fecha escondida o secuencia demasiado precisa.',
        key: 'El número que insiste es el número que guía.',
      },
      {
        name: 'Señal del Palacio Sin Nombre',
        signs:
          'Entrada sin cartel, fachada sobria, mármol discreto, dorado apagado, cortinas pesadas, simetría perfecta o escudo vacío.',
        key: 'La puerta que no presume suele ser la que guarda más.',
      },
      {
        name: 'Señal de la Cámara de Marfil',
        signs:
          'Tonos blancos, crema o hueso, líneas rectas, mesa de decisión, sillas ordenadas, columna clara, firma o relieve frontal.',
        key: 'Donde todo parece medido antes de ser dicho, la Cámara se reconoce.',
      },
      {
        name: 'Señal de la Galería del Alquimista',
        signs:
          'Vitrinas, metal oscuro, oro envejecido, reflejos cálidos, símbolos alquímicos, pieza central iluminada o llave antigua.',
        key: 'Si un objeto parece reliquia y no simple objeto, el Alquimista está cerca.',
      },
      {
        name: 'Señal del Observatorio de Saturno',
        signs:
          'Azotea, ventana panorámica, esfera, reloj, anillo, estructura circular, tonos azul oscuro o gris, mapas o líneas frías.',
        key: 'Mira hacia arriba. Donde la ciudad se vuelve mapa, Saturno observa.',
      },
      {
        name: 'Señal de la Isla Sumergida',
        signs:
          'Agua, reflejos, entrada bajo el nivel de la calle, sótanos elegantes, pasillos descendentes, azul profundo, espejos oscuros, ola o concha.',
        key: 'Lo sumergido no se encuentra de frente: se encuentra descendiendo.',
      },
      {
        name: 'Señal del Teatro Astral',
        signs:
          'Cortinas pesadas, escenario, máscara, luces suspendidas, techos altos, estrellas, constelaciones, terciopelo u ojo elevado.',
        key:
          'Donde la sala mira hacia arriba y la luz se vuelve ceremonia, el Teatro se abre.',
      },
      {
        name: 'Señal de la Sala del Zodíaco',
        signs:
          'Doce marcas, doce asientos, doce luces, mesa circular, rueda simbólica, arcos, signos o geometría radial demasiado perfecta.',
        key: 'Cuenta el círculo. Si el doce aparece, la sala responde.',
      },
      {
        name: 'Señal de la Cripta de Cristal',
        signs:
          'Cristal, vitrinas, reflejos nítidos, superficies transparentes, luces blancas, sala silenciosa, pieza protegida o forma visible solo desde cierto ángulo.',
        key:
          'Lo que brilla en silencio no siempre está expuesto; a veces está custodiado.',
      },
      {
        name: 'Señal del Santuario de la Rosa Negra',
        signs:
          'Rosa negra, terciopelo oscuro, fragancia intensa, velas profundas, madera oscura, tonos vino o negro, espina o puerta final.',
        key: 'Donde la flor oscura aparece, el último paso está cerca.',
      },
    ],
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
          No se entra por curiosidad. Se entra por invitación, preservando la
          naturaleza del nacimiento de la organización.
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
                  {section.levels ? (
                    <div className={styles.levelInfoLevelGrid}>
                      {section.levels.map((level) => (
                        <section key={level.name} className={styles.levelInfoLevel}>
                          <h4>{level.name}</h4>
                          {level.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                          <dl>
                            <div>
                              <dt>Perfil del invitado</dt>
                              <dd>{level.profile}</dd>
                            </div>
                            <div>
                              <dt>Tipo de experiencia</dt>
                              <dd>{level.experience}</dd>
                            </div>
                            <div>
                              <dt>Sensación del nivel</dt>
                              <dd>{level.feeling}</dd>
                            </div>
                          </dl>
                        </section>
                      ))}
                    </div>
                  ) : section.locations ? (
                    <div className={styles.levelInfoLocationWrap}>
                      <section className={styles.levelInfoLocationIntro}>
                        <h4>{section.intro.title}</h4>
                        {section.intro.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </section>
                      <div className={styles.levelInfoLocationGrid}>
                        {section.locations.map((location) => (
                          <section
                            key={location.name}
                            className={styles.levelInfoLocation}
                          >
                            <h4>{location.name}</h4>
                            <p>{location.explanation}</p>
                            <dl>
                              <div>
                                <dt>Tipo de energía</dt>
                                <dd>{location.energy}</dd>
                              </div>
                            </dl>
                          </section>
                        ))}
                      </div>
                    </div>
                  ) : section.signals ? (
                    <div className={styles.levelInfoLocationWrap}>
                      <section className={styles.levelInfoLocationIntro}>
                        <h4>{section.intro.title}</h4>
                        {section.intro.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </section>
                      <div className={styles.levelInfoLocationGrid}>
                        {section.signals.map((signal) => (
                          <section
                            key={signal.name}
                            className={styles.levelInfoSignal}
                          >
                            <h4>{signal.name}</h4>
                            <dl>
                              <div>
                                <dt>Rastro visible</dt>
                                <dd>{signal.signs}</dd>
                              </div>
                              <div>
                                <dt>Clave velada</dt>
                                <dd>{signal.key}</dd>
                              </div>
                            </dl>
                          </section>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>{section.text}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
