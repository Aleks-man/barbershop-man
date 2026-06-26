export const overlayOpenEvent = 'barbershop:overlay-open'

export const announceOverlayOpen = (sourceId: string) => {
  window.dispatchEvent(
    new CustomEvent<string>(overlayOpenEvent, {
      detail: sourceId,
    }),
  )
}

export const getOverlaySourceId = (event: Event) =>
  event instanceof CustomEvent && typeof event.detail === 'string'
    ? event.detail
    : null
