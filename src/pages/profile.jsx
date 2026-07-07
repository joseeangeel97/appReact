import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import Footer from '../components/Footer';
import FieldLabel from '../components/FieldLabel';
import ImageCarousel from '../components/ImageCarousel';
import Tooltip from '../components/Tooltip';
import { useSessionActions } from '../utils/sessionProfile';
import styles from './profile.module.css';

const fieldLabelClasses = {
  className: styles.fieldLabel,
  textClassName: styles.fieldLabelText,
};

const tooltipClasses = {
  wrapperClassName: styles.tooltipWrapper,
  triggerClassName: styles.tooltipTrigger,
  bubbleClassName: styles.tooltipBubble,
};

export default function Profile() {
  const navigate = useNavigate();
  const { replaceSession } = useSessionActions();
  const redirectTimeoutRef = useRef(null);
  // Datos que el usuario define y que después se usarán para el acceso de iniciado.
  const [alias, setAlias] = useState('');
  const [phrase, setPhrase] = useState('');
  const [phrasesOpen, setPhrasesOpen] = useState(false);
  const [hiddenThought, setHiddenThought] = useState('');
  const [showHiddenThought, setShowHiddenThought] = useState(false);
  const [phraseOptions, setPhraseOptions] = useState([]);
  const [phrasesStatus, setPhrasesStatus] = useState('loading');
  const [number, setNumber] = useState('');
  const [imageOptions, setImageOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagesStatus, setImagesStatus] = useState('loading');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    // Carga las imágenes disponibles para elegir avatar.
    async function loadProfileImages() {
      try {
        const response = await fetch('/api/profile-images');

        if (!response.ok) {
          throw new Error('Profile images request failed');
        }

        const data = await response.json();
        const images = Array.isArray(data.images) ? data.images : [];

        if (!isMounted) {
          return;
        }

        setImageOptions(images);
        setSelectedImage(images[0] || null);
        setImagesStatus(images.length > 0 ? 'ready' : 'empty');
      } catch {
        if (isMounted) {
          setImagesStatus('error');
        }
      }
    }

    // Carga las frases identificativas que vienen de la base de datos.
    async function loadKeySentences() {
      try {
        const response = await fetch('/api/key-sentences');

        if (!response.ok) {
          throw new Error('Key sentences request failed');
        }

        const data = await response.json();
        const sentences = Array.isArray(data.sentences) ? data.sentences : [];

        if (!isMounted) {
          return;
        }

        setPhraseOptions(sentences);
        setPhrasesStatus(sentences.length > 0 ? 'ready' : 'empty');
      } catch {
        if (isMounted) {
          setPhrasesStatus('error');
        }
      }
    }

    loadProfileImages();
    loadKeySentences();

    // Evita actualizar estado si el componente se desmonta durante una petición.
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Limpia la redirección programada si el usuario sale antes de tiempo.
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    // Todos estos campos son necesarios para crear un perfil completo.
    if (
      !alias.trim() ||
      !phrase.trim() ||
      !hiddenThought.trim() ||
      !number ||
      !selectedImage
    ) {
      setError('Todos los campos del perfil son obligatorios');
      return;
    }

    if (Number(number) < 1) {
      setError('El número personal debe ser mayor que cero');
      return;
    }

    setSaveStatus('saving');

    try {
      // El backend normaliza textos y guarda la frase contraseña como hash.
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          alias,
          phrase,
          hiddenThought,
          number,
          // No persistimos la imagen que manda el navegador; el servidor valida este id.
          imageId: selectedImage.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'No se pudo guardar el perfil');
        setSaveStatus('idle');
        return;
      }

      const data = await response.json();

      replaceSession(data.session);
      setSaveStatus('success');
      setSuccessMessage(
        'Perfil creado correctamente. Redirigiendo al inicio...',
      );
      // Deja ver el mensaje de éxito antes de volver al inicio.
      redirectTimeoutRef.current = setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch {
      setError('Error de conexión, intenta nuevamente');
      setSaveStatus('idle');
    }
  };

  // Fuente usada para la tarjeta de previsualización del perfil.
  const previewImageSrc = selectedImage?.src;

  return (
    <>
      <main className={styles.profileMain}>
        <section className={styles.profileSection}>
          <header className={styles.profileHeader}>
            <h1>Crear perfil</h1>
            <p>
              Define tu alias, una frase identificativa y un número de perfil.
              Selecciona la imagen que mejor represente tu presencia en esta
              plataforma exclusiva.
            </p>
          </header>

          <form className={styles.profileForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <FieldLabel htmlFor='alias' {...fieldLabelClasses}>
                Alias
              </FieldLabel>
              <input
                id='alias'
                type='text'
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder='Introduce tu alias'
                required
              />
            </div>

            <div className={styles.formRow}>
              <FieldLabel
                htmlFor='phrase'
                tooltip={
                  <Tooltip id='phrase-tooltip' {...tooltipClasses}>
                    Recuerda esta frase: más adelante se te pedirá junto a tu
                    pensamiento más oculto para poder ingresar.
                  </Tooltip>
                }
                {...fieldLabelClasses}
              >
                Frase identificativa
              </FieldLabel>
              <div className={styles.phraseAccordion}>
                <Button
                  id='phrase'
                  type='button'
                  className={`${styles.phraseTrigger} ${phrasesOpen ? styles.phraseTriggerOpen : ''}`}
                  onClick={() => setPhrasesOpen((isOpen) => !isOpen)}
                  disabled={phrasesStatus !== 'ready'}
                  aria-expanded={phrasesOpen}
                  aria-controls='phrase-options'
                >
                  <span>
                    {phrase ||
                      (phrasesStatus === 'loading'
                        ? 'Cargando frases...'
                        : 'Selecciona una frase')}
                  </span>
                  <span className={styles.phraseChevron} aria-hidden='true' />
                </Button>

                {phrasesOpen && phrasesStatus === 'ready' && (
                  <div
                    id='phrase-options'
                    className={styles.phrasePanel}
                    role='listbox'
                    aria-label='Frases identificativas'
                  >
                    {phraseOptions.map((phraseOption) => (
                      <Button
                        key={phraseOption.id}
                        type='button'
                        className={`${styles.phraseOption} ${
                          phrase === phraseOption.text
                            ? styles.phraseOptionSelected
                            : ''
                        }`}
                        onClick={() => {
                          setPhrase(phraseOption.text);
                          setPhrasesOpen(false);
                        }}
                        role='option'
                        aria-selected={phrase === phraseOption.text}
                      >
                        {phraseOption.text}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {phrasesStatus === 'loading' && (
                <p className={styles.imageStatus}>Cargando frases...</p>
              )}
              {phrasesStatus === 'empty' && (
                <p className={styles.imageStatus}>No hay frases disponibles</p>
              )}
              {phrasesStatus === 'error' && (
                <p className={styles.imageStatus}>
                  No se pudieron cargar las frases
                </p>
              )}
            </div>

            <div className={styles.formRow}>
              <FieldLabel
                htmlFor='hiddenThought'
                tooltip={
                  <Tooltip id='hidden-thought-tooltip' {...tooltipClasses}>
                    Esta frase contraseña se guardará protegida y deberás
                    recordarla para ingresar más adelante.
                  </Tooltip>
                }
                {...fieldLabelClasses}
              >
                Pensamiento más oculto
              </FieldLabel>
              <div className={styles.passwordField}>
                <input
                  id='hiddenThought'
                  type={showHiddenThought ? 'text' : 'password'}
                  value={hiddenThought}
                  onChange={(e) => setHiddenThought(e.target.value)}
                  placeholder='Introduce tu frase contraseña'
                  required
                />
                {/* Permite comprobar la frase escrita sin cambiar el valor guardado. */}
                <Button
                  type='button'
                  onClick={() =>
                    setShowHiddenThought((isVisible) => !isVisible)
                  }
                  aria-label={
                    showHiddenThought
                      ? 'Ocultar frase contraseña'
                      : 'Mostrar frase contraseña'
                  }
                >
                  {showHiddenThought ? 'Ocultar' : 'Ver'}
                </Button>
              </div>
            </div>

            <div className={styles.formRow}>
              <FieldLabel
                htmlFor='number'
                tooltip={
                  <Tooltip id='number-tooltip' {...tooltipClasses}>
                    Recuerda este número: más adelante se te pedirá junto a tu
                    pensamiento más oculto y frase identificativa para poder
                    ingresar.
                  </Tooltip>
                }
                {...fieldLabelClasses}
              >
                Número personal
              </FieldLabel>
              <input
                id='number'
                type='number'
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder='Introduce tu número'
                min='1'
                required
              />
            </div>

            <div className={styles.formRow}>
              <FieldLabel {...fieldLabelClasses}>
                Selecciona tu imagen
              </FieldLabel>
              {imagesStatus === 'loading' && (
                <p className={styles.imageStatus}>Cargando imágenes...</p>
              )}
              {imagesStatus === 'empty' && (
                <p className={styles.imageStatus}>
                  No hay imágenes disponibles
                </p>
              )}
              {imagesStatus === 'error' && (
                <p className={styles.imageStatus}>
                  No se pudieron cargar las imágenes
                </p>
              )}
              {imagesStatus === 'ready' && (
                // Carrusel compartido: recibe clases para adaptarse al diseño de perfil.
                <ImageCarousel
                  images={imageOptions}
                  selectedImageId={selectedImage?.id}
                  onImageChange={setSelectedImage}
                  label='Seleccionar imagen de perfil'
                  className={styles.profileCarousel}
                  viewportClassName={styles.profileCarouselViewport}
                  imageButtonClassName={styles.profileCarouselImageButton}
                  trackClassName={styles.profileCarouselTrack}
                  imageClassName={styles.profileCarouselImage}
                  imageInfoClassName={styles.profileCarouselInfo}
                />
              )}
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <div
                  className={styles.previewAvatar}
                  style={
                    previewImageSrc
                      ? { backgroundImage: `url("${previewImageSrc}")` }
                      : undefined
                  }
                >
                  {selectedImage && (
                    <img
                      src={previewImageSrc}
                      alt='Avatar seleccionado'
                      onError={(event) => {
                        // Si la URL optimizada falla, intenta cargar la URL original.
                        const fallbackSrc = selectedImage.originalSrc;

                        if (
                          fallbackSrc &&
                          event.currentTarget.src !== fallbackSrc
                        ) {
                          event.currentTarget.src = fallbackSrc;
                        }
                      }}
                    />
                  )}
                </div>
                <div className={styles.previewInfo}>
                  <h2>{alias || 'Alias pendiente'}</h2>
                  <p>{phrase || 'Frase identificativa pendiente'}</p>
                </div>
              </div>
              <div className={styles.previewDetails}>
                <p>
                  <span>Número de perfil</span>
                  <strong>{number || 'No asignado'}</strong>
                </p>
                <p>
                  <span>Imagen</span>
                  <strong>{selectedImage?.label || 'No seleccionada'}</strong>
                </p>
              </div>
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}
            {successMessage && (
              <p className={styles.successMessage}>{successMessage}</p>
            )}

            <Button
              type='submit'
              className={styles.submitButton}
              disabled={saveStatus === 'saving' || saveStatus === 'success'}
            >
              {saveStatus === 'saving'
                ? 'Guardando...'
                : saveStatus === 'success'
                  ? 'Perfil creado'
                  : 'Crear perfil'}
            </Button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
