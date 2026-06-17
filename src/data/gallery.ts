import room01 from '../assets/gallery/room/room-01.webp'
import room02 from '../assets/gallery/room/room-02.webp'
import room03 from '../assets/gallery/room/room-03.webp'
import room04 from '../assets/gallery/room/room-04.webp'
import room05 from '../assets/gallery/room/room-05.webp'
import work01 from '../assets/gallery/works/work-01.webp'
import work02 from '../assets/gallery/works/work-02.webp'
import work03 from '../assets/gallery/works/work-03.webp'
import work04 from '../assets/gallery/works/work-04.webp'
import work05 from '../assets/gallery/works/work-05.webp'
import work06 from '../assets/gallery/works/work-06.webp'
import work07 from '../assets/gallery/works/work-07.webp'
import work08 from '../assets/gallery/works/work-08.webp'
import work09 from '../assets/gallery/works/work-09.webp'
import work10 from '../assets/gallery/works/work-10.webp'
import work11 from '../assets/gallery/works/work-11.webp'
import work12 from '../assets/gallery/works/work-12.webp'
import work13 from '../assets/gallery/works/work-13.webp'
import work14 from '../assets/gallery/works/work-14.webp'
import work15 from '../assets/gallery/works/work-15.webp'
import work16 from '../assets/gallery/works/work-16.webp'
import work17 from '../assets/gallery/works/work-17.webp'

export type GalleryImage = {
  src: string
  alt: string
}

export const workGallery: GalleryImage[] = [
  work01,
  work02,
  work03,
  work04,
  work05,
  work06,
  work07,
  work08,
  work09,
  work10,
  work11,
  work12,
  work13,
  work14,
  work15,
  work16,
  work17,
].map((src, index) => ({
  src,
  alt: `Работа барбершопа Gentleman's Room ${index + 1}`,
}))

export const roomGallery: GalleryImage[] = [
  room01,
  room02,
  room03,
  room04,
  room05,
].map((src, index) => ({
  src,
  alt: `Интерьер мастерской Gentleman's Room ${index + 1}`,
}))
