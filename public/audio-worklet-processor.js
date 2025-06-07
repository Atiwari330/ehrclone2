/**
 * Audio Worklet Processor for real-time audio capture
 * Converts audio data to Int16Array format required by AssemblyAI
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Keep track of whether we've logged the first chunk
    this.firstChunkLogged = false;
    this.chunkCount = 0;
    
    console.log('[AudioWorkletProcessor] Initialized');
  }

  /**
   * Process audio data from the microphone
   * @param {Array} inputs - Array of inputs, each containing channels of Float32Array samples
   * @param {Array} outputs - Array of outputs (not used for capture)
   * @param {Object} parameters - AudioParam values (not used)
   * @returns {boolean} - Return true to keep processor alive
   */
  process(inputs, outputs, parameters) {
    // Get the first input (microphone)
    const input = inputs[0];
    
    // Check if we have input data
    if (!input || input.length === 0) {
      return true;
    }
    
    // Get the first channel (mono audio)
    const inputChannel = input[0];
    
    // Check if the channel has data
    if (!inputChannel || inputChannel.length === 0) {
      return true;
    }
    
    // Check if we're getting actual audio data (not silence)
    const hasAudioData = inputChannel.some(sample => sample !== 0);
    
    // Convert Float32Array to Int16Array (required by AssemblyAI)
    const int16Data = new Int16Array(inputChannel.length);
    for (let i = 0; i < inputChannel.length; i++) {
      // Clamp the value to prevent overflow
      const sample = Math.max(-1, Math.min(1, inputChannel[i]));
      // Convert to 16-bit integer
      int16Data[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    
    // Log the first chunk for debugging
    if (!this.firstChunkLogged && hasAudioData) {
      console.log('[AudioWorkletProcessor] First audio chunk:', {
        size: int16Data.buffer.byteLength,
        hasAudioData: hasAudioData,
        sampleRate: sampleRate,
        channelCount: input.length,
        samplesPerChannel: inputChannel.length,
        timestamp: currentTime
      });
      this.firstChunkLogged = true;
    }
    
    // Log every 100th chunk to monitor ongoing capture
    this.chunkCount++;
    if (this.chunkCount % 100 === 0) {
      console.log('[AudioWorkletProcessor] Audio chunk #' + this.chunkCount, {
        hasAudioData: hasAudioData,
        timestamp: currentTime
      });
    }
    
    // Send the audio data to the main thread via MessagePort
    if (hasAudioData) {
      // Transfer the ArrayBuffer to avoid copying
      this.port.postMessage({
        type: 'audio-data',
        audioData: int16Data.buffer,
        timestamp: currentTime,
        hasAudioData: hasAudioData
      }, [int16Data.buffer]);
    }
    
    // Return true to keep the processor alive
    return true;
  }
}

// Register the processor
registerProcessor('audio-capture-processor', AudioCaptureProcessor);
