class Visualizer {
    constructor(container, audioContext, sourceNode) {
        this.container = container;
        this.audioContext = audioContext;
        this.sourceNode = sourceNode;
        this.currentStyle = 'frequency-waves';
        this.isActive = false;
        
        // Create analyzer nodes for different frequency ranges
        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 2048;
        this.bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // Create additional analyzer for bass frequencies
        this.bassAnalyzer = this.audioContext.createAnalyser();
        this.bassAnalyzer.fftSize = 512;
        this.bassBufferLength = this.bassAnalyzer.frequencyBinCount;
        this.bassDataArray = new Uint8Array(this.bassBufferLength);
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        // Handle resize
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Animation frame and particle system
        this.animationFrame = null;
        this.particles = [];
        this.lastTime = performance.now();
        
        // Initialize particle system
        this.initParticles();

        // Initialize nebula nodes
        this.nebulaClouds = Array(15).fill().map(() => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 100 + 50,
            hue: Math.random() * 360,
            speed: Math.random() * 0.5 + 0.2
        }));

        // Initialize circuit nodes
        this.circuitNodes = Array(20).fill().map(() => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            connections: [],
            pulses: [],
            hue: Math.random() * 60 + 120 // Cyber green/blue range
        }));
        // Create connections between nodes
        this.circuitNodes.forEach(node => {
            const nearestNodes = this.findNearestNodes(node, 3);
            node.connections = nearestNodes;
        });

        // Add rotation state for circuit flow
        this.circuitRotation = 0;
        this.rotationSpeed = 0;
        this.lastBassIntensity = 0;
        this.rotationCenter = { x: 0, y: 0 };

        // Initialize DNA Helix components
        this.dnaStrands = Array(20).fill().map(() => ({
            offset: Math.random() * Math.PI * 2,
            basePairs: Array(15).fill().map(() => ({
                energy: Math.random(),
                hue: Math.random() * 360,
                connection: Math.random()
            }))
        }));
        this.dnaRotation = 0;
        this.dnaUnwind = 0;

        // Initialize Crystal Cave formations
        this.crystals = Array(12).fill().map(() => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 100 + 50,
            angle: Math.random() * Math.PI * 2,
            growth: 0,
            energy: Math.random(),
            hue: Math.random() * 60 + 180, // Blue/cyan range
            branches: Array(5).fill().map(() => ({
                angle: Math.random() * Math.PI * 2,
                length: Math.random() * 0.5 + 0.5,
                pulse: 0
            }))
        }));
        this.lastCrystalPulse = performance.now();
    }

    initParticles() {
        this.particles = Array(200).fill().map(() => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            life: Math.random(),
            hue: Math.random() * 360
        }));
    }

    resizeCanvas() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.sourceNode.connect(this.analyzer);
        this.sourceNode.connect(this.bassAnalyzer);
        this.lastTime = performance.now();
        this.draw();
    }

    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        this.sourceNode.disconnect(this.analyzer);
        this.sourceNode.disconnect(this.bassAnalyzer);
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    setStyle(style) {
        this.currentStyle = style;
    }

    draw() {
        if (!this.isActive) return;

        this.animationFrame = requestAnimationFrame(() => this.draw());
        
        switch (this.currentStyle) {
            case 'frequency-waves':
                this.drawFrequencyWaves();
                break;
            case 'particle-field':
                this.drawParticleField();
                break;
            case 'color-pulse':
                this.drawColorPulse();
                break;
            case 'spectrum-bars':
                this.drawSpectrumBars();
                break;
            case 'aurora':
                this.drawAurora();
                break;
            case 'nebula':
                this.drawNebula();
                break;
            case 'circuit-flow':
                this.drawCircuitFlow();
                break;
            case 'dna-helix':
                this.drawDNAHelix();
                break;
            case 'crystal-cave':
                this.drawCrystalCave();
                break;
        }
    }

    drawFrequencyWaves() {
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);
        
        // Create a layered effect with multiple waves
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const time = performance.now() / 1000;
        const layers = 3;
        
        for (let layer = 0; layer < layers; layer++) {
            this.ctx.beginPath();
            
            const sliceWidth = this.width / this.bufferLength;
            let x = 0;
            
            for (let i = 0; i < this.bufferLength; i++) {
                const v = this.dataArray[i] / 128.0;
                const y = (v * this.height * 0.5) + 
                         Math.sin(x / this.width * 8 + time + layer) * 20 * (layer + 1);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            // Create dynamic gradient based on audio intensity
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            const bassIntensity = this.bassDataArray.reduce((a, b) => a + b) / this.bassBufferLength;
            const hue1 = (time * 20 + layer * 120) % 360;
            const hue2 = (hue1 + 60) % 360;
            
            gradient.addColorStop(0, `hsla(${hue1}, 80%, 50%, ${0.6 - layer * 0.15})`);
            gradient.addColorStop(1, `hsla(${hue2}, 80%, 50%, ${0.3 - layer * 0.1})`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 4 - layer;
            this.ctx.stroke();
        }
    }

    drawParticleField() {
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);
        
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const bassIntensity = this.bassDataArray.reduce((a, b) => a + b) / this.bassBufferLength / 255;
        const avgFrequency = this.dataArray.reduce((a, b) => a + b) / this.bufferLength / 255;
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position with bass-influenced movement
            particle.x += particle.speedX * (1 + bassIntensity * 5) * deltaTime * 60;
            particle.y += particle.speedY * (1 + bassIntensity * 5) * deltaTime * 60;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.width;
            if (particle.x > this.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.height;
            if (particle.y > this.height) particle.y = 0;
            
            // Update particle life and size based on audio
            particle.life = (particle.life + deltaTime * (0.1 + avgFrequency)) % 1;
            const size = particle.size * (1 + bassIntensity * 2);
            
            // Draw particle with dynamic color and size
            const hue = (particle.hue + avgFrequency * 180) % 360;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.4 + particle.life * 0.6})`;
            this.ctx.fill();
            
            // Draw connecting lines between nearby particles
            this.particles.forEach(other => {
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.15 * (1 - distance / 100)})`;
                    this.ctx.stroke();
                }
            });
        });
    }

    drawColorPulse() {
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);
        
        const bassIntensity = this.bassDataArray.reduce((a, b) => a + b) / this.bassBufferLength / 255;
        const avgFrequency = this.dataArray.reduce((a, b) => a + b) / this.bufferLength / 255;
        
        // Create multiple layers of color pulses
        const time = performance.now() / 1000;
        const layers = 3;
        
        for (let i = 0; i < layers; i++) {
            const hue = (time * 30 + i * 120) % 360;
            const scale = 1 + i * 0.5;
            const x = this.width / 2 + Math.sin(time + i) * 50;
            const y = this.height / 2 + Math.cos(time + i) * 50;
            
            const gradient = this.ctx.createRadialGradient(
                x, y, 0,
                x, y, this.width * scale * (0.5 + bassIntensity * 0.5)
            );
            
            gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, ${0.4 * avgFrequency})`);
            gradient.addColorStop(1, 'rgba(26, 26, 26, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    drawSpectrumBars() {
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);
        
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const bars = 128;
        const barWidth = this.width / bars;
        const time = performance.now() / 1000;
        
        // Draw mirrored spectrum bars
        for (let i = 0; i < bars; i++) {
            const freqIndex = Math.floor(i * this.bufferLength / bars);
            const value = this.dataArray[freqIndex];
            const percent = value / 255;
            const height = this.height * 0.5 * percent;
            
            // Calculate bar positions
            const x = i * barWidth;
            const hue = (i / bars * 360 + time * 30) % 360;
            
            // Draw upper bar
            const gradient1 = this.ctx.createLinearGradient(x, this.height/2 - height, x, this.height/2);
            gradient1.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.8)`);
            gradient1.addColorStop(1, `hsla(${hue}, 80%, 50%, 0.2)`);
            
            this.ctx.fillStyle = gradient1;
            this.ctx.fillRect(x, this.height/2 - height, barWidth - 1, height);
            
            // Draw lower bar (mirrored)
            const gradient2 = this.ctx.createLinearGradient(x, this.height/2, x, this.height/2 + height);
            gradient2.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.2)`);
            gradient2.addColorStop(1, `hsla(${hue}, 80%, 50%, 0.8)`);
            
            this.ctx.fillStyle = gradient2;
            this.ctx.fillRect(x, this.height/2, barWidth - 1, height);
            
            // Add glow effect
            if (percent > 0.5) {
                this.ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${(percent - 0.5) * 0.5})`;
                this.ctx.fillRect(x - barWidth, this.height/2 - height * 1.2, barWidth * 3, height * 2.4);
            }
        }
    }

    drawAurora() {
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);
        
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const time = performance.now() / 3000;
        const bassIntensity = this.bassDataArray.reduce((a, b) => a + b) / this.bassBufferLength / 255;
        
        // Create multiple aurora layers
        const layers = 5;
        const points = 8;
        
        for (let l = 0; l < layers; l++) {
            this.ctx.beginPath();
            
            const layerOffset = l * (Math.PI / layers);
            const amplitude = 150 * (1 + bassIntensity);
            
            for (let i = 0; i <= points; i++) {
                const x = (i / points) * this.width;
                const freqIndex = Math.floor((i / points) * this.bufferLength);
                const frequency = this.dataArray[freqIndex] / 255;
                
                // Create complex wave pattern
                const y = this.height * (0.2 + l * 0.15) +
                         Math.sin(x / 200 + time + layerOffset) * amplitude * frequency +
                         Math.cos(x / 100 - time * 2 + layerOffset) * amplitude * 0.5;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    // Use quadratic curves for smoother lines
                    const prevX = ((i - 1) / points) * this.width;
                    const cpX = (prevX + x) / 2;
                    this.ctx.quadraticCurveTo(cpX, y, x, y);
                }
            }
            
            // Create dynamic gradient
            const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
            const hueBase = time * 30 + l * 60;
            gradient.addColorStop(0, `hsla(${hueBase % 360}, 80%, 50%, ${0.5 - l * 0.08})`);
            gradient.addColorStop(0.5, `hsla(${(hueBase + 30) % 360}, 80%, 50%, ${0.3 - l * 0.05})`);
            gradient.addColorStop(1, `hsla(${(hueBase + 60) % 360}, 80%, 50%, ${0.1 - l * 0.02})`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 30 * (1 + bassIntensity) * (1 - l * 0.15);
            this.ctx.stroke();
            
            // Add glow effect
            if (l < 2) {
                this.ctx.shadowColor = `hsla(${hueBase % 360}, 80%, 50%, 0.5)`;
                this.ctx.shadowBlur = 20 * bassIntensity;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }
        }
    }

    // Helper function for circuit-flow
    findNearestNodes(node, count) {
        return this.circuitNodes
            .filter(n => n !== node)
            .sort((a, b) => {
                const distA = Math.hypot(node.x - a.x, node.y - a.y);
                const distB = Math.hypot(node.x - b.x, node.y - b.y);
                return distA - distB;
            })
            .slice(0, count);
    }

    drawNebula() {
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);
        
        const time = performance.now() / 1000;
        const bassIntensity = this.bassDataArray.reduce((a, b) => a + b) / this.bassBufferLength / 255;
        const avgFrequency = this.dataArray.reduce((a, b) => a + b) / this.bufferLength / 255;
        
        // Create dark space background with subtle stars
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Update and draw nebula clouds
        this.nebulaClouds.forEach((cloud, i) => {
            // Move clouds based on audio
            cloud.x += Math.sin(time + i) * cloud.speed * (1 + bassIntensity * 2);
            cloud.y += Math.cos(time + i) * cloud.speed * (1 + bassIntensity * 2);
            
            // Wrap around screen
            cloud.x = (cloud.x + this.width) % this.width;
            cloud.y = (cloud.y + this.height) % this.height;
            
            // Create dynamic gradients for each cloud
            const gradient = this.ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.radius * (1 + avgFrequency)
            );
            
            const hue = (cloud.hue + time * 10) % 360;
            gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, ${0.3 * (1 + bassIntensity)})`);
            gradient.addColorStop(0.4, `hsla(${(hue + 30) % 360}, 70%, 40%, 0.2)`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            // Draw cloud
            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(cloud.x, cloud.y, cloud.radius * (1 + avgFrequency), 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow effect based on audio intensity
            if (bassIntensity > 0.5) {
                this.ctx.shadowBlur = 20 * bassIntensity;
                this.ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.5)`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
        
        // Add twinkling stars
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 2 * (1 + avgFrequency);
            
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawCircuitFlow() {
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);
        
        const time = performance.now() / 1000;
        const bassIntensity = this.bassDataArray.reduce((a, b) => a + b) / this.bassBufferLength / 255;
        const avgFrequency = this.dataArray.reduce((a, b) => a + b) / this.bufferLength / 255;
        
        // Create dark background with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Update rotation based on bass hits
        const bassDelta = bassIntensity - this.lastBassIntensity;
        if (bassDelta > 0.3) { // Bass hit threshold
            // Change rotation direction and speed based on bass intensity
            this.rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.02 + bassIntensity * 0.08);
            // Update rotation center for more dynamic movement
            this.rotationCenter = {
                x: this.width * (0.3 + Math.random() * 0.4),
                y: this.height * (0.3 + Math.random() * 0.4)
            };
        }
        this.lastBassIntensity = bassIntensity;

        // Apply rotation momentum with damping
        this.circuitRotation += this.rotationSpeed;
        this.rotationSpeed *= 0.99; // Gradual slowdown

        // Save the current canvas state
        this.ctx.save();
        
        // Apply rotation transform
        this.ctx.translate(this.rotationCenter.x, this.rotationCenter.y);
        this.ctx.rotate(this.circuitRotation);
        this.ctx.translate(-this.rotationCenter.x, -this.rotationCenter.y);
        
        // Update and draw circuit nodes
        this.circuitNodes.forEach(node => {
            // Create data pulses based on audio intensity
            if (Math.random() < bassIntensity * 0.3) {
                node.connections.forEach(target => {
                    node.pulses.push({
                        x: node.x,
                        y: node.y,
                        targetX: target.x,
                        targetY: target.y,
                        progress: 0,
                        hue: node.hue + this.circuitRotation * 30 // Add rotation-based hue shift
                    });
                });
            }
            
            // Draw node with intensity-based glow
            const nodeSize = 4 * (1 + avgFrequency + (bassIntensity * 2));
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${node.hue + this.circuitRotation * 30}, 80%, 50%, ${0.8 + avgFrequency * 0.2})`;
            
            // Add stronger glow on bass hits
            if (bassIntensity > 0.6) {
                this.ctx.shadowBlur = 15 * bassIntensity;
                this.ctx.shadowColor = `hsla(${node.hue + this.circuitRotation * 30}, 80%, 50%, 0.8)`;
            }
            
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Draw connections with dynamic opacity
            node.connections.forEach(target => {
                this.ctx.beginPath();
                this.ctx.moveTo(node.x, node.y);
                this.ctx.lineTo(target.x, target.y);
                const connectionOpacity = 0.15 + (bassIntensity * 0.2);
                this.ctx.strokeStyle = `hsla(${node.hue + this.circuitRotation * 30}, 70%, 50%, ${connectionOpacity})`;
                this.ctx.lineWidth = 1 + (bassIntensity * 2);
                this.ctx.stroke();
            });
            
            // Update and draw pulses with enhanced effects
            node.pulses = node.pulses.filter(pulse => {
                pulse.progress += 0.02 * (1 + bassIntensity * 2);
                
                if (pulse.progress >= 1) return false;
                
                const x = pulse.x + (pulse.targetX - pulse.x) * pulse.progress;
                const y = pulse.y + (pulse.targetY - pulse.y) * pulse.progress;
                
                // Draw larger pulses during bass hits
                const pulseSize = 3 * (1 + bassIntensity);
                this.ctx.beginPath();
                this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${pulse.hue}, 80%, 50%, ${(1 - pulse.progress) * (1 + bassIntensity)})`;
                
                // Enhanced glow effect
                this.ctx.shadowBlur = 10 * (1 + bassIntensity);
                this.ctx.shadowColor = `hsla(${pulse.hue}, 80%, 50%, 0.8)`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                
                return true;
            });
        });

        // Restore canvas state
        this.ctx.restore();
        
        // Add intense background glow on bass hits
        if (bassIntensity > 0.6) {
            const gradient = this.ctx.createRadialGradient(
                this.width/2, this.height/2, 0,
                this.width/2, this.height/2, this.width/2
            );
            const glowIntensity = (bassIntensity - 0.6) * 0.3;
            gradient.addColorStop(0, `hsla(${(time * 30 + this.circuitRotation * 50) % 360}, 70%, 50%, ${glowIntensity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    drawDNAHelix() {
        const now = performance.now() / 1000;
        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);

        // Calculate audio intensities
        const bassIntensity = this.bassDataArray.reduce((a, b) => a + b) / this.bassBufferLength / 255;
        const avgFrequency = this.dataArray.reduce((a, b) => a + b) / this.bufferLength / 255;

        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Update DNA rotation and unwinding based on audio
        this.dnaRotation += (bassIntensity * 0.1 + 0.02);
        this.dnaUnwind = Math.sin(now * 0.5) * avgFrequency * 0.5;

        // Draw each DNA strand
        this.dnaStrands.forEach((strand, index) => {
            const centerX = this.width / 2;
            const startY = -200;
            const height = this.height + 400;
            const width = 200 * (1 + this.dnaUnwind);

            // Draw the main helix strands
            ['rgba(0, 150, 255, 0.6)', 'rgba(255, 100, 255, 0.6)'].forEach((color, strandIndex) => {
                this.ctx.beginPath();
                for (let y = 0; y <= height; y += 5) {
                    const progress = y / height;
                    const phase = progress * Math.PI * 20 + this.dnaRotation + strand.offset;
                    const x = centerX + Math.sin(phase + strandIndex * Math.PI) * width;
                    const actualY = startY + y;

                    if (y === 0) {
                        this.ctx.moveTo(x, actualY);
                    } else {
                        this.ctx.lineTo(x, actualY);
                    }
                }
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 4 * (1 + bassIntensity);
                this.ctx.stroke();
            });

            // Draw base pairs and energy connections
            strand.basePairs.forEach((base, baseIndex) => {
                const progress = baseIndex / strand.basePairs.length;
                const y = startY + progress * height;
                const phase = progress * Math.PI * 20 + this.dnaRotation + strand.offset;

                // Update base pair energy based on frequency data
                const freqIndex = Math.floor(progress * this.bufferLength);
                base.energy = Math.max(base.energy, this.dataArray[freqIndex] / 255);
                base.energy *= 0.95; // Decay

                // Draw base pair connections
                const x1 = centerX + Math.sin(phase) * width;
                const x2 = centerX + Math.sin(phase + Math.PI) * width;

                // Energy connection
                const gradient = this.ctx.createLinearGradient(x1, y, x2, y);
                gradient.addColorStop(0, `hsla(${base.hue}, 80%, 60%, ${base.energy * 0.8})`);
                gradient.addColorStop(0.5, `hsla(${(base.hue + 40) % 360}, 80%, 60%, ${base.energy})`);
                gradient.addColorStop(1, `hsla(${base.hue}, 80%, 60%, ${base.energy * 0.8})`);

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y);
                this.ctx.lineTo(x2, y);
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 3 * base.energy;
                this.ctx.stroke();

                // Draw glowing nodes at connection points
                [x1, x2].forEach(x => {
                    const glow = this.ctx.createRadialGradient(x, y, 0, x, y, 15 * base.energy);
                    glow.addColorStop(0, `hsla(${base.hue}, 80%, 60%, ${base.energy})`);
                    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 15 * base.energy, 0, Math.PI * 2);
                    this.ctx.fillStyle = glow;
                    this.ctx.fill();
                });
            });
        });
    }

    drawCrystalCave() {
        const now = performance.now();
        const deltaTime = (now - this.lastCrystalPulse) / 1000;
        this.lastCrystalPulse = now;

        this.analyzer.getByteFrequencyData(this.dataArray);
        this.bassAnalyzer.getByteFrequencyData(this.bassDataArray);

        // Calculate audio intensities
        const bassIntensity = this.bassDataArray.reduce((a, b) => a + b) / this.bassBufferLength / 255;
        const avgFrequency = this.dataArray.reduce((a, b) => a + b) / this.bufferLength / 255;

        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Update and draw crystals
        this.crystals.forEach((crystal, index) => {
            // Update crystal growth and energy based on audio
            crystal.growth = Math.min(1, crystal.growth + deltaTime * (0.1 + bassIntensity * 0.5));
            crystal.energy = Math.max(crystal.energy, avgFrequency);
            crystal.energy *= 0.95; // Decay

            // Calculate crystal points
            const points = [];
            const size = crystal.size * crystal.growth;
            
            // Create crystal shape
            crystal.branches.forEach(branch => {
                const angle = crystal.angle + branch.angle;
                const length = size * branch.length;
                points.push({
                    x: crystal.x + Math.cos(angle) * length,
                    y: crystal.y + Math.sin(angle) * length
                });

                // Update branch pulse
                branch.pulse = Math.max(0, branch.pulse - deltaTime);
                if (Math.random() < avgFrequency * 0.1) {
                    branch.pulse = 1;
                }
            });

            // Draw crystal core
            const gradient = this.ctx.createRadialGradient(
                crystal.x, crystal.y, 0,
                crystal.x, crystal.y, size
            );
            
            const energy = crystal.energy * (1 + Math.sin(now / 1000 * 2) * 0.2);
            gradient.addColorStop(0, `hsla(${crystal.hue}, 80%, 60%, ${energy * 0.8})`);
            gradient.addColorStop(0.5, `hsla(${crystal.hue + 30}, 70%, 50%, ${energy * 0.4})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x, points[0].y);
            points.forEach((point, i) => {
                const nextPoint = points[(i + 1) % points.length];
                this.ctx.lineTo(nextPoint.x, nextPoint.y);
            });
            this.ctx.closePath();
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Draw energy lines
            crystal.branches.forEach((branch, branchIndex) => {
                if (branch.pulse > 0) {
                    const angle = crystal.angle + branch.angle;
                    const length = size * branch.length;
                    const endX = crystal.x + Math.cos(angle) * length * 1.2;
                    const endY = crystal.y + Math.sin(angle) * length * 1.2;

                    const lineGradient = this.ctx.createLinearGradient(
                        crystal.x, crystal.y, endX, endY
                    );
                    lineGradient.addColorStop(0, `hsla(${crystal.hue}, 80%, 60%, ${branch.pulse})`);
                    lineGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    this.ctx.beginPath();
                    this.ctx.moveTo(crystal.x, crystal.y);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.strokeStyle = lineGradient;
                    this.ctx.lineWidth = 3 * branch.pulse;
                    this.ctx.stroke();
                }
            });

            // Draw connecting energy between nearby crystals
            this.crystals.forEach((other, otherIndex) => {
                if (index === otherIndex) return;
                
                const dx = crystal.x - other.x;
                const dy = crystal.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 300) {
                    const strength = (1 - distance / 300) * crystal.energy * other.energy;
                    const gradient = this.ctx.createLinearGradient(
                        crystal.x, crystal.y, other.x, other.y
                    );
                    
                    gradient.addColorStop(0, `hsla(${crystal.hue}, 80%, 60%, ${strength * 0.5})`);
                    gradient.addColorStop(1, `hsla(${other.hue}, 80%, 60%, ${strength * 0.5})`);

                    this.ctx.beginPath();
                    this.ctx.moveTo(crystal.x, crystal.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 2 * strength;
                    this.ctx.stroke();
                }
            });

            // Fracture effect on bass hits
            if (bassIntensity > 0.8 && Math.random() < 0.3) {
                const fractures = 3;
                for (let i = 0; i < fractures; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const length = size * (0.3 + Math.random() * 0.7);
                    const endX = crystal.x + Math.cos(angle) * length;
                    const endY = crystal.y + Math.sin(angle) * length;

                    const gradient = this.ctx.createLinearGradient(
                        crystal.x, crystal.y, endX, endY
                    );
                    gradient.addColorStop(0, `hsla(${crystal.hue}, 90%, 70%, 0.8)`);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    this.ctx.beginPath();
                    this.ctx.moveTo(crystal.x, crystal.y);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            }
        });
    }
}

export default Visualizer; 