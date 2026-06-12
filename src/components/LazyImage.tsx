import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  srcSet?: string
  sizes?: string
  className?: string
  containerClassName?: string
  placeholderColor?: string
  onLoad?: () => void
  onError?: () => void
  priority?: boolean
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  className,
  containerClassName,
  placeholderColor = 'rgba(0, 18, 51, 0.3)',
  onLoad,
  onError,
  priority = false,
  objectFit = 'cover',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const container = containerRef.current
    if (!container) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observerRef.current?.disconnect()
          }
        })
      },
      {
        rootMargin: '200px 0px',
        threshold: 0,
      }
    )

    observerRef.current.observe(container)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [priority])

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(true)
    onError?.()
  }, [onError])

  // If image is already cached, it may have loaded before the listener attached
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && isInView && !hasError) {
      setIsLoaded(true)
    }
  }, [isInView, hasError])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        backgroundColor: placeholderColor,
      }}
    >
      {/* Skeleton placeholder — pulsing animation */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: placeholderColor }}
          aria-hidden="true"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[rgba(255,77,109,0.1)]"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-2 text-[#FF4D6D]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs font-medium">Failed to load</span>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'auto' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-500 ease-out',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
          }}
        />
      )}

      {/* Fade-in overlay for smooth transition */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        style={{ backgroundColor: placeholderColor }}
        aria-hidden="true"
      />
    </div>
  )
}
