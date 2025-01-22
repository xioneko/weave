import type { EnterTransition, ExitTransition } from "./PopperTransition.vue"

export const fadeIn: EnterTransition = el => {
  el.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 100,
  })
}

export const fadeOut: ExitTransition = (el, done) => {
  el.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 100,
  }).onfinish = done
}

export const fadeScaleIn: EnterTransition = el => {
  el.animate(
    [
      { opacity: 0, transform: "scale(0.95)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    {
      duration: 100,
      easing: "ease-out",
    },
  )
}

export const fadeScaleOut: ExitTransition = (el, done) => {
  el.animate(
    [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(0.95)" },
    ],
    {
      duration: 100,
      easing: "ease-out",
    },
  ).onfinish = done
}
