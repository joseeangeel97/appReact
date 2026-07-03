import { useState } from 'react';

import Button from './Button';
import styles from './ImageCarousel.module.css';

const getClassName = (...classNames) => classNames.filter(Boolean).join(' ');

export default function ImageCarousel({
  images = [],
  selectedImageId,
  onImageChange,
  label = 'Galeria de imagenes',
  className,
  viewportClassName,
  imageButtonClassName,
  trackClassName,
  imageClassName,
  imageInfoClassName,
  imageFit,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) {
    return null;
  }

  const selectedIndex = images.findIndex((image) => image.id === selectedImageId);
  const activeIndex =
    selectedIndex >= 0 ? selectedIndex : Math.min(currentIndex, images.length - 1);
  const activeImage = images[activeIndex];

  const setImageIndex = (nextIndex) => {
    setCurrentIndex(nextIndex);
    onImageChange?.(images[nextIndex]);
  };

  const goToPrevious = () => {
    const nextIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setImageIndex(nextIndex);
  };

  const goToNext = () => {
    const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    setImageIndex(nextIndex);
  };

  return (
    <section className={getClassName(styles.carousel, className)} aria-label={label}>
      <div className={getClassName(styles.viewport, viewportClassName)}>
        <Button
          type='button'
          className={`${styles.controlButton} ${styles.previousButton}`}
          onClick={goToPrevious}
          aria-label='Imagen anterior'
        >
          &lt;
        </Button>

        <Button
          type='button'
          className={getClassName(styles.imageButton, imageButtonClassName)}
          onClick={goToNext}
          aria-label='Ver siguiente imagen'
        >
          <div
            className={getClassName(styles.track, trackClassName)}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((image) => (
              <img
                key={image.id || `${image.src}-${image.label}`}
                className={getClassName(styles.image, imageClassName)}
                src={image.src}
                alt={image.label || 'Imagen del carrusel'}
                style={imageFit ? { objectFit: imageFit } : undefined}
              />
            ))}
          </div>
        </Button>

        <Button
          type='button'
          className={`${styles.controlButton} ${styles.nextButton}`}
          onClick={goToNext}
          aria-label='Imagen siguiente'
        >
          &gt;
        </Button>
      </div>

      <div className={styles.indicators} aria-label='Seleccionar imagen'>
        {images.map((image, index) => (
          <Button
            type='button'
            key={image.id || `${image.src}-${index}`}
            className={`${styles.indicator} ${
              index === activeIndex ? styles.activeIndicator : ''
            }`}
            onClick={() => setImageIndex(index)}
            aria-label={`Ir a imagen ${index + 1}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>

      <div className={imageInfoClassName}>
        <h3>{activeImage.label || 'Imagen sin titulo'}</h3>
        {activeImage.description && <p>{activeImage.description}</p>}
      </div>
    </section>
  );
}
