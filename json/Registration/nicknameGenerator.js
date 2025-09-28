import { generateNickname } from '../Utils/utils.js';

export class NicknameGenerator {
    constructor(form) {
        this.nicknameInput = document.getElementById('nicknameInput');
        this.generateNicknameBtn = document.getElementById('generateNickname');
        this.nicknameAttempts = 0;
    }

    init() {
        this.nicknameInput.value = generateNickname();
        this.generateNicknameBtn.addEventListener('click', () => {
            if (this.nicknameAttempts < 5) {
                this.nicknameInput.value = generateNickname();
                this.nicknameAttempts++;
                if (this.nicknameAttempts === 5) {
                    this.nicknameInput.readOnly = false;
                    this.generateNicknameBtn.textContent = 'Edit Manually';
                    this.generateNicknameBtn.disabled = true;
                }
            }
        });
    }
}