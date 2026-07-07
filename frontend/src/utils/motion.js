export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const cardHover = {
  rest: { y: 0, boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.07)' },
  hover: {
    y: -4,
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

export const scaleOnTap = {
  tap: { scale: 0.97, transition: { duration: 0.1 } },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

export const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.25, ease: 'easeInOut' },
}
