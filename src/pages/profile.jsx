import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageCarousel from '../components/ImageCarousel';
import styles from './profile.module.css';

export default function Profile() {
  const [alias, setAlias] = useState('');
  const [phrase, setPhrase] = useState('');
  const [number, setNumber] = useState('');
  const [imageOptions, setImageOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagesStatus, setImagesStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

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

    loadProfileImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert(
      `Perfil guardado:\nAlias: ${alias}\nFrase: ${phrase}\nNúmero: ${number}`,
    );
  };

  const previewImageSrc = selectedImage?.src;

  return (
    <>
      <Header />
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
              <label htmlFor='alias'>Alias</label>
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
              <label htmlFor='phrase'>Frase identificativa</label>
              <textarea
                id='phrase'
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder='Escribe una frase breve y sentencial'
                required
              />
            </div>

            <div className={styles.formRow}>
              <label htmlFor='number'>Número personal</label>
              <input
                id='number'
                type='number'
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder='Selecciona tu número'
                min='1'
                required
              />
            </div>

            <div className={styles.formRow}>
              <label>Selecciona tu imagen</label>
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
              <p>Número de perfil: {number || 'No asignado'}</p>
              <p>Imagen: {selectedImage?.label || 'No seleccionada'}</p>
            </div>

            <button type='submit' className={styles.submitButton}>
              Guardar perfil
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
