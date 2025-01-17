// Visualization style descriptions
const vizDescriptions = {
    'frequency-waves': 'Dynamic waves that pulse with the music frequency, creating smooth flowing patterns.',
    'particle-field': 'Interactive particles that respond to audio intensity, forming organic flowing patterns.',
    'color-pulse': 'Pulsating colors that react to the music\'s rhythm and energy.',
    'spectrum-bars': 'Classic spectrum analyzer with responsive bars showing frequency distribution.',
    'aurora': 'Ethereal aurora-like waves that dance to the music.',
    'nebula': 'Cosmic nebula clouds that pulse and swirl with the music, creating a space-like atmosphere.',
    'circuit-flow': 'Cyberpunk-inspired network of nodes with data pulses flowing to the beat.'
};

class VizControls {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.previewCanvas = null;
        this.previewVisualizer = null;
        
        // Get DOM elements
        this.vizStyleSelect = document.getElementById('viz-style');
        this.vizPreview = document.getElementById('viz-preview');
        this.vizDescription = document.getElementById('viz-description');
        
        // Setup preview canvas
        this.setupPreviewCanvas();
        
        // Add event listeners
        this.vizStyleSelect.addEventListener('change', this.handleStyleChange.bind(this));
        this.vizStyleSelect.addEventListener('mouseover', this.handleStyleHover.bind(this));
        this.vizStyleSelect.addEventListener('mouseout', this.handleStyleHoverEnd.bind(this));
    }
    
    setupPreviewCanvas() {
        // Create canvas for preview
        this.previewCanvas = document.createElement('canvas');
        this.vizPreview.appendChild(this.previewCanvas);
        
        // Create a separate audio context and nodes for preview
        const previewContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = previewContext.createOscillator();
        const gain = previewContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(previewContext.destination);
        gain.gain.value = 0; // Mute the preview sound
        
        // Create preview visualizer
        this.previewVisualizer = new Visualizer(this.vizPreview, previewContext, oscillator);
        
        // Start silent oscillator for visualization
        oscillator.start();
        this.previewVisualizer.start();
    }
    
    handleStyleChange(event) {
        const style = event.target.value;
        // Update main visualizer
        this.visualizer.setStyle(style);
        // Update preview
        this.previewVisualizer.setStyle(style);
        // Update description
        this.updateDescription(style);
    }
    
    handleStyleHover(event) {
        const option = event.target.options[event.target.options.selectedIndex];
        const style = option.value;
        // Show preview of hovered style
        this.previewVisualizer.setStyle(style);
        // Update description
        this.updateDescription(style);
    }
    
    handleStyleHoverEnd() {
        // Restore current selection
        const currentStyle = this.vizStyleSelect.value;
        this.previewVisualizer.setStyle(currentStyle);
        this.updateDescription(currentStyle);
    }
    
    updateDescription(style) {
        this.vizDescription.textContent = vizDescriptions[style] || 'Select a visualization style to see it in action';
    }
}

export default VizControls; 