/**
 * Section3 Slider Script
 * Horizontal scrolling cards with navigation arrows
 * Compatible with Astro view transitions
 */

class Section3Slider {
  private track: HTMLElement | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;
  private dots: HTMLButtonElement[] = [];
  private currentIndex: number = 0;
  private cardsPerView: number = 1;
  private totalCards: number = 0;
  private maxIndex: number = 0;
  private autoplayInterval: number | null = null;
  private startX: number = 0;
  private isDragging: boolean = false;
  private isInitialized: boolean = false;
  
  constructor() {
    this.init();
  }
  
  init() {
    // Listen for astro:page-load to reinitialize after navigation
    document.addEventListener('astro:page-load', () => this.setup());
    
    // Also initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    // Prevent double initialization
    if (this.isInitialized) {
      this.cleanup();
    }

    this.track = document.getElementById('editorsPicksTrack');
    this.prevBtn = document.querySelector('.slider-prev');
    this.nextBtn = document.querySelector('.slider-next');
    this.dots = Array.from(document.querySelectorAll('.slider-dot'));
    
    if (!this.track || !this.prevBtn || !this.nextBtn) return;
    
    this.calculateLayout();
    this.bindEvents();
    this.updateSlider();
    this.startAutoplay();
    this.isInitialized = true;
  }
  
  cleanup() {
    this.stopAutoplay();
    this.isInitialized = false;
    // Event listeners are automatically cleaned up when elements are replaced
  }
  
  calculateLayout() {
    this.cardsPerView = window.innerWidth >= 1200 ? 4 : 
                        window.innerWidth >= 768 ? 3 : 
                        window.innerWidth >= 640 ? 2 : 1;
    this.totalCards = this.track ? this.track.children.length : 0;
    this.maxIndex = Math.max(0, this.totalCards - this.cardsPerView);
  }
  
  updateSlider() {
    if (!this.track) return;
    
    const cardWidth = this.track.children[0]?.getBoundingClientRect().width || 0;
    const gap = 24; // 1.5rem gap
    const translateX = this.currentIndex * (cardWidth + gap);
    
    this.track.style.transform = `translateX(-${translateX}px)`;
    
    // Update navigation buttons
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
    
    // Update dots
    const activeDotIndex = Math.floor(this.currentIndex / this.cardsPerView);
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeDotIndex);
    });
  }
  
  goToNext() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex += 1;
      this.updateSlider();
    }
  }
  
  goToPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.updateSlider();
    }
  }
  
  bindEvents() {
    // Navigation buttons
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.goToNext());
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.goToPrev());
    }
    
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.currentIndex = index * this.cardsPerView;
        if (this.currentIndex > this.maxIndex) this.currentIndex = this.maxIndex;
        this.updateSlider();
      });
    });
    
    // Hover pause/resume
    const sliderSection = document.querySelector('.section3-slider');
    if (sliderSection) {
      sliderSection.addEventListener('mouseenter', () => this.stopAutoplay());
      sliderSection.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target as Element).closest && (e.target as Element).closest('.section3-slider')) {
        if (e.key === 'ArrowLeft') this.goToPrev();
        if (e.key === 'ArrowRight') this.goToNext();
      }
    });
    
    // Touch events
    if (this.track) {
      this.track.addEventListener('touchstart', (e) => {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
        this.stopAutoplay();
      });
      
      this.track.addEventListener('touchmove', (e) => {
        if (!this.isDragging) return;
        e.preventDefault();
      });
      
      this.track.addEventListener('touchend', (e) => {
        if (!this.isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const diff = this.startX - endX;
        const minSwipeDistance = 50;
        
        if (Math.abs(diff) > minSwipeDistance) {
          if (diff > 0) {
            this.goToNext();
          } else {
            this.goToPrev();
          }
        }
        
        this.isDragging = false;
        this.startAutoplay();
      });
    }
    
    // Window resize
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.calculateLayout();
        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        this.updateSlider();
      }, 300);
    });
  }
  
  startAutoplay() {
    this.stopAutoplay(); // Clear any existing interval
    this.autoplayInterval = window.setInterval(() => {
      if (this.currentIndex >= this.maxIndex) {
        this.currentIndex = 0;
      } else {
        this.currentIndex += 1;
      }
      this.updateSlider();
    }, 5000);
  }
  
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

// Initialize slider
new Section3Slider();