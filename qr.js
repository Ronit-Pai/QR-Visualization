class AnimatedQRGenerator {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.animationState = {
            isRunning: false,
            isPaused: false,
            currentStep: 0,
            totalSteps: 0,
            animationId: null,
            qrCode: null,
            modules: [],
            pattern: []
        };
        this.updateCharCounter();
    }

    initElements() {
        this.textInput = document.getElementById('textInput');
        this.animationMode = document.getElementById('animationMode');
        this.errorCorrection = document.getElementById('errorCorrection');
        this.speedSlider = document.getElementById('speed');
        this.speedValue = document.getElementById('speedValue');
        this.moduleSizeSelect = document.getElementById('moduleSize');
        this.generateBtn = document.getElementById('generateBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.canvas = document.getElementById('qrCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.progressBar = document.getElementById('progressBar');
        this.status = document.getElementById('status');
        this.charCount = document.getElementById('charCount');
        this.charStatus = document.getElementById('charStatus');
    }

    bindEvents() {
        this.textInput.addEventListener('input', () => this.updateCharCounter());
        this.speedSlider.addEventListener('input', () => this.updateSpeedDisplay());
        this.generateBtn.addEventListener('click', () => this.generateQR());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.saveBtn.addEventListener('click', () => this.saveImage());
    }

    updateCharCounter() {
        const length = this.textInput.value.length;
        this.charCount.textContent = length;
        
        this.charStatus.className = '';
        if (length > 1000) {
            this.charStatus.textContent = ' (Very long - use high error correction)';
            this.charStatus.className = 'error';
        } else if (length > 500) {
            this.charStatus.textContent = ' (Long text - may need larger QR version)';
            this.charStatus.className = 'warning';
        } else if (length === 0) {
            this.charStatus.textContent = ' (Enter some text)';
        } else {
            this.charStatus.textContent = ' (Good length)';
        }
    }

    updateSpeedDisplay() {
        this.speedValue.textContent = `${this.speedSlider.value} ms`;
    }

    generateQR() {
        const text = this.textInput.value.trim();
        if (!text) {
            alert('Please enter some text to encode');
            return;
        }

        try {
            
            const typeNumber = 0; 
            const errorCorrectionLevel = this.errorCorrection.value;
            
            this.animationState.qrCode = qrcode(typeNumber, errorCorrectionLevel);
            this.animationState.qrCode.addData(text);
            this.animationState.qrCode.make();

            
            this.setupCanvas();
            
            
            this.generateModuleData();
            
            
            this.generateAnimationPattern();
            
            
            this.startAnimation();

        } catch (error) {
            console.error('QR Generation Error:', error);
            alert('Error generating QR code. Try reducing text length or changing error correction level.');
        }
    }

    setupCanvas() {
        const moduleSize = parseInt(this.moduleSizeSelect.value);
        const moduleCount = this.animationState.qrCode.getModuleCount();
        const quietZone = 4; 
        
        const totalSize = (moduleCount + (2 * quietZone)) * moduleSize;
        
        this.canvas.width = totalSize;
        this.canvas.height = totalSize;
        
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, totalSize, totalSize);
        
        this.canvasSettings = {
            moduleSize,
            moduleCount,
            quietZone,
            totalSize,
            offset: quietZone * moduleSize
        };
    }

    generateModuleData() {
        const { moduleCount } = this.canvasSettings;
        const modules = [];
        
        
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                const isDark = this.animationState.qrCode.isDark(row, col);
                if (isDark) { 
                    modules.push({
                        row,
                        col,
                        x: this.canvasSettings.offset + col * this.canvasSettings.moduleSize,
                        y: this.canvasSettings.offset + row * this.canvasSettings.moduleSize,
                        isDark: true
                    });
                }
            }
        }
        
        this.animationState.modules = modules;
    }

    generateAnimationPattern() {
        const modules = [...this.animationState.modules];
        const mode = this.animationMode.value;
        let pattern = [];

        switch (mode) {
            case 'sequential':
                pattern = modules.sort((a, b) => a.row - b.row || a.col - b.col);
                break;
            
            case 'spiral':
                pattern = this.generateSpiralPattern(modules);
                break;
            
            case 'random':
                pattern = this.shuffleArray([...modules]);
                break;
            
            case 'wave':
                pattern = this.generateWavePattern(modules);
                break;
            
            case 'corners':
                pattern = this.generateCornerPattern(modules);
                break;
            
            default:
                pattern = modules;
        }

        this.animationState.pattern = pattern;
        this.animationState.totalSteps = pattern.length;
    }

    generateSpiralPattern(modules) {
        const { moduleCount } = this.canvasSettings;
        const center = { row: moduleCount / 2, col: moduleCount / 2 };
        
        return modules.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.row - center.row, 2) + Math.pow(a.col - center.col, 2));
            const distB = Math.sqrt(Math.pow(b.row - center.row, 2) + Math.pow(b.col - center.col, 2));
            return distA - distB;
        });
    }

    generateWavePattern(modules) {
        return modules.sort((a, b) => {
            const waveA = Math.sin(a.col * 0.2) * 5 + a.row;
            const waveB = Math.sin(b.col * 0.2) * 5 + b.row;
            return waveA - waveB;
        });
    }

    generateCornerPattern(modules) {
        const { moduleCount } = this.canvasSettings;
        
        return modules.sort((a, b) => {
            const cornerDistA = Math.min(
                a.row + a.col, // top-left
                (moduleCount - 1 - a.row) + a.col, // bottom-left
                a.row + (moduleCount - 1 - a.col), // top-right
                (moduleCount - 1 - a.row) + (moduleCount - 1 - a.col) // bottom-right
            );
            const cornerDistB = Math.min(
                b.row + b.col,
                (moduleCount - 1 - b.row) + b.col,
                b.row + (moduleCount - 1 - b.col),
                (moduleCount - 1 - b.row) + (moduleCount - 1 - b.col)
            );
            return cornerDistA - cornerDistB;
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startAnimation() {
        this.animationState.isRunning = true;
        this.animationState.isPaused = false;
        this.animationState.currentStep = 0;
        this.updateControls();
        this.animate();
    }

    animate() {
        if (!this.animationState.isRunning || this.animationState.isPaused) return;

        if (this.animationState.currentStep >= this.animationState.totalSteps) {
            this.completeAnimation();
            return;
        }

        
        const module = this.animationState.pattern[this.animationState.currentStep];
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(
            module.x,
            module.y,
            this.canvasSettings.moduleSize,
            this.canvasSettings.moduleSize
        );

        this.animationState.currentStep++;
        this.updateProgress();

        const speed = parseInt(this.speedSlider.value);
        this.animationState.animationId = setTimeout(() => this.animate(), speed);
    }

    togglePause() {
        if (!this.animationState.isRunning) return;

        this.animationState.isPaused = !this.animationState.isPaused;
        this.pauseBtn.textContent = this.animationState.isPaused ? '▶️ Resume' : '⏸️ Pause';
        
        if (!this.animationState.isPaused) {
            this.animate();
        }
        
        this.status.textContent = this.animationState.isPaused ? 'Animation paused' : 'Animation running...';
    }

    reset() {
        this.stopAnimation();
        this.clearCanvas();
        this.animationState.currentStep = 0;
        this.updateProgress();
        this.updateControls();
        this.status.textContent = 'Ready to generate QR code';
    }

    stopAnimation() {
        this.animationState.isRunning = false;
        this.animationState.isPaused = false;
        if (this.animationState.animationId) {
            clearTimeout(this.animationState.animationId);
            this.animationState.animationId = null;
        }
    }

    completeAnimation() {
        this.stopAnimation();
        this.updateControls();
        const qrInfo = `${this.canvasSettings.moduleCount}×${this.canvasSettings.moduleCount}`;
        this.status.textContent = `Animation complete! QR code (${qrInfo}) with ${this.animationState.totalSteps} dark modules is ready to scan`;
    }

    clearCanvas() {
        if (this.canvasSettings) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, this.canvasSettings.totalSize, this.canvasSettings.totalSize);
        }
    }

    updateProgress() {
        const percentage = (this.animationState.currentStep / this.animationState.totalSteps) * 100;
        this.progressBar.style.width = percentage + '%';
        this.status.textContent = `Drawing... ${this.animationState.currentStep}/${this.animationState.totalSteps} (${Math.round(percentage)}%)`;
    }

    updateControls() {
        const { isRunning, isPaused, currentStep, totalSteps } = this.animationState;
        
        this.generateBtn.disabled = isRunning && !isPaused;
        this.pauseBtn.disabled = !isRunning;
        this.resetBtn.disabled = !isRunning && currentStep === 0;
        this.saveBtn.disabled = isRunning || currentStep === 0;
        
        if (!isRunning && currentStep > 0) {
            this.pauseBtn.textContent = '⏸️ Pause';
        }
    }

    saveImage() {
        try {
            const link = document.createElement('a');
            link.download = 'animated-qr-code.png';
            link.href = this.canvas.toDataURL();
            link.click();
            this.status.textContent = 'QR code saved successfully!';
        } catch (error) {
            alert('Error saving image: ' + error.message);
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new AnimatedQRGenerator();
});


