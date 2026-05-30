#!/usr/bin/env python3
"""
VIVIW STT Server - faster-whisper based speech-to-text
Communicates via stdin/stdout with the Electron main process
"""

import sys
import json
import time
import struct
import re

def write_status(status: str, message: str = ""):
    obj = {"status": status}
    if message:
        obj["message"] = message
    print(json.dumps(obj), flush=True)

def detect_question(text: str) -> bool:
    """Heuristic to detect if text is a question (interview context)"""
    text_lower = text.strip().lower()
    
    # Indonesian question words
    id_questions = ["apa", "bagaimana", "kenapa", "mengapa", "siapa", "dimana", 
                    "kapan", "berapa", "boleh", "bisa", "apakah", "bisakah", 
                    "dapatkah", "maukah", "ceritakan", "jelaskan", "sebutkan",
                    "tolong", "mohon"]
    
    # English question words
    en_questions = ["what", "how", "why", "who", "where", "when", "which",
                    "can", "could", "would", "will", "do", "does", "did",
                    "tell me", "explain", "describe", "list", "name"]
    
    # Check for question mark
    if text.strip().endswith("?"):
        return True
    
    # Check for question-starting words
    words = text_lower.split()
    if words:
        first_word = words[0]
        if first_word in id_questions or first_word in en_questions:
            return True
    
    # Check for multi-word patterns
    for q in ["tell me", "can you", "could you", "would you", "please explain"]:
        if text_lower.startswith(q):
            return True
    
    return False

def main():
    write_status("loading", "Initializing faster-whisper...")
    
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        error = {"error": "faster-whisper not installed. Run python/install_deps.bat first."}
        print(json.dumps(error), flush=True)
        sys.exit(1)
    
    # Get language from args (default: id for Indonesian)
    language = sys.argv[1] if len(sys.argv) > 1 else "id"
    model_size = sys.argv[2] if len(sys.argv) > 2 else "small"
    
    write_status("loading", f"Loading Whisper model: {model_size}")
    
    try:
        model = WhisperModel(
            model_size,
            device="cpu",
            compute_type="int8",
            cpu_threads=4
        )
    except Exception as e:
        error = {"error": f"Failed to load model: {str(e)}"}
        print(json.dumps(error), flush=True)
        sys.exit(1)
    
    write_status("ready")
    
    # Read raw audio from stdin and transcribe in chunks
    SAMPLE_RATE = 16000
    CHANNELS = 1
    BYTES_PER_SAMPLE = 2
    
    import numpy as np
    import io
    
    audio_buffer = b""
    MIN_CHUNK_BYTES = SAMPLE_RATE * BYTES_PER_SAMPLE * 1  # 1 second minimum
    
    while True:
        try:
            chunk = sys.stdin.buffer.read(8192)
            if not chunk:
                break
            
            audio_buffer += chunk
            
            if len(audio_buffer) < MIN_CHUNK_BYTES:
                continue
            
            # Convert raw PCM to numpy float32
            audio_data = np.frombuffer(audio_buffer, dtype=np.int16)
            audio_float = audio_data.astype(np.float32) / 32768.0
            audio_buffer = b""
            
            start_time = time.time()
            
            # Transcribe
            segments, info = model.transcribe(
                audio_float,
                beam_size=3,
                language=None if language == "auto" else language,
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=300)
            )
            
            text = " ".join(seg.text.strip() for seg in segments).strip()
            latency_ms = int((time.time() - start_time) * 1000)
            
            if text:
                is_question = detect_question(text)
                result = {
                    "text": text,
                    "confidence": 0.95,
                    "is_question": is_question,
                    "language": info.language if hasattr(info, 'language') else language,
                    "latency_ms": latency_ms
                }
                print(json.dumps(result, ensure_ascii=False), flush=True)
        
        except KeyboardInterrupt:
            break
        except Exception as e:
            error = {"error": str(e)}
            print(json.dumps(error), flush=True)

if __name__ == "__main__":
    main()
