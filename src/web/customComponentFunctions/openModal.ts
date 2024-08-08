export function closeModal(event: MouseEvent): void {
    const modal: HTMLElement | null | undefined = (event.target as HTMLButtonElement).parentElement?.parentElement;
    if (!modal) {return}
    modal.setAttribute("open","false")
}
