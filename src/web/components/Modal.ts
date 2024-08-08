export class Modal {
    readonly id : string;
    readonly modal : HTMLDivElement;

    constructor(title: string, content: string, actions?: HTMLButtonElement[]) {
        this.id = `modal-${document.querySelectorAll('#modal-container>.modal').length}`;
        this.modal = document.createElement("div");
        this.modal.id = this.id;
        this.modal.classList.add("modal");
        this.modal.innerHTML = `
          <div class="modal-head">${title}</div>
          <div class="modal-body"><p>${content}</p></div>
          <div class="modal-footer"></div>
        `;

        if (!actions) {
            actions = [ this.getDefaultButton() ];
        }

        this.setCloseButtonAction(actions);

        actions.forEach(action => {
            this.modal.getElementsByClassName('modal-footer')[0].appendChild(action);
        })
        document.getElementById('modal-container')?.appendChild(this.modal);
    }

    public open() {
        this.modal.setAttribute("open","true");
    }

    public close() {
        this.modal.removeAttribute("open");
    }

    private getDefaultButton(): HTMLButtonElement {
        const button = document.createElement("button");
        button.classList.add(".modal-close-button");
        button.textContent = "Close";

        return button;
    }

    private setCloseButtonAction(buttons: HTMLButtonElement[]) {
        buttons
            .filter(button => button.classList.contains('.modal-close-button'))
            .forEach(button => {button.addEventListener("click", () => this.close())});
    }

    static closeButton(text: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.classList.add(".modal-close-button");
        button.textContent = text;

        return button;
    }
}
