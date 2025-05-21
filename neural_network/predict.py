
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import time
from pathlib import Path
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("FatigueAnalyzer")

mp_face_detection = mp.solutions.face_detection
FaceDetection = mp_face_detection.FaceDetection

class FatigueAnalyzer:
    def __init__(self, model_path: str, buffer_size: int = 15):
        try:
            self.model = tf.keras.models.load_model(model_path)
            logger.info(f"Model loaded successfully from {model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
            
        self.buffer = []
        self.buffer_size = buffer_size
        self.face_detector = FaceDetection(min_detection_confidence=0.7)
        self.last_face_time = time.time()
        logger.info("FatigueAnalyzer initialized successfully")

    def process_frame(self, frame: np.ndarray) -> np.ndarray:
        if frame is None:
            logger.error("Received None frame")
            return np.zeros((300, 300, 3), dtype=np.uint8)
            
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_detector.process(rgb_frame)
            
            if results.detections:
                self.last_face_time = time.time()
                for detection in results.detections:
                    bbox = detection.location_data.relative_bounding_box
                    h, w = frame.shape[:2]
                    
                    x = int(bbox.xmin * w)
                    y = int(bbox.ymin * h)
                    width = int(bbox.width * w)
                    height = int(bbox.height * h)
                    
                    x = max(0, x)
                    y = max(0, y)
                    width = min(w - x, width)
                    height = min(h - y, height)

                    if width > 10 and height > 10:
                        try:
                            face_roi = frame[y:y+height, x:x+width]
                            processed = self._preprocess_face(face_roi)
                            prediction = self.model.predict(processed[None, ...], verbose=0)[0][0]
                            self._update_buffer(prediction)
                            
                            color = (0, 0, 255) if prediction > 0.5 else (0, 255, 0)
                            cv2.rectangle(frame, (x, y), (x+width, y+height), color, 2)
                            cv2.putText(frame, f"Fatigue: {np.mean(self.buffer):.2f}", 
                                       (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                        except Exception as e:
                            logger.error(f"Processing error: {str(e)}")
            else:
                if time.time() - self.last_face_time > 2:
                    self._update_buffer(1.0)  # Если лицо не найдено долго, считаем что человек устал/отвлекся
            
            return frame
        except Exception as e:
            logger.error(f"Frame processing error: {str(e)}")
            return frame

    def _preprocess_face(self, face: np.ndarray) -> np.ndarray:
        try:
            face = cv2.resize(face, (48, 48))
            return face.astype(np.float32) / 255.0
        except Exception as e:
            logger.error(f"Face preprocessing error: {str(e)}")
            # Возвращаем пустой массив подходящей формы в случае ошибки
            return np.zeros((48, 48, 3), dtype=np.float32)

    def _update_buffer(self, value: float):
        self.buffer.append(value)
        if len(self.buffer) > self.buffer_size:
            self.buffer.pop(0)

    def get_final_score(self) -> dict:
        if not self.buffer:
            logger.warning("No data in buffer for scoring")
            return {'level': 'No data', 'score': 0.0, 'percent': 0.0}
            
        avg_score = np.mean(self.buffer)
        if avg_score < 0.3:
            level = "Low"
        elif avg_score < 0.7:
            level = "Medium"
        else:
            level = "High"
            
        logger.info(f"Final score: {avg_score:.2f}, level: {level}")
        return {
            'level': level,
            'score': round(avg_score, 2),
            'percent': round(avg_score * 100, 1)
        }

def analyze_source(source, is_video_file=False, output_file=None):
    try:
        logger.info(f"Starting analysis of {'video file' if is_video_file else 'camera'}")
        analyzer = FatigueAnalyzer('neural_network/data/models/fatigue_model.keras')
        
        # Проверяем существование источника
        if is_video_file and not Path(source).exists():
            logger.error(f"Video source does not exist: {source}")
            return "Error", 0
        
        cap = cv2.VideoCapture(source if is_video_file else 0)
        if not cap.isOpened():
            logger.error(f"Failed to open video source: {source}")
            raise ValueError("Не удалось открыть видео источник")
        
        logger.info(f"Video source opened: {source if is_video_file else 'camera'} - "
                   f"resolution: {cap.get(3)}x{cap.get(4)}, FPS: {cap.get(5)}")
        
        if output_file:
            fourcc = cv2.VideoWriter_fourcc(*'XVID')
            out = cv2.VideoWriter(output_file, fourcc, 30.0, 
                                (int(cap.get(3)), int(cap.get(4))))
        
        frame_count = 0
        processed_frames = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            
            # Обрабатываем не каждый кадр для ускорения
            if frame_count % 5 == 0:
                processed = analyzer.process_frame(frame)
                processed_frames += 1
                
                if output_file:
                    out.write(processed)
                
                # Только показываем окно если это не автоматический анализ
                if not is_video_file or output_file:
                    cv2.imshow('Analysis', processed)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
        
        logger.info(f"Analyzed {processed_frames} frames out of {frame_count}")
        
        cap.release()
        if output_file and 'out' in locals():
            out.release()
        cv2.destroyAllWindows()
        
        result = analyzer.get_final_score()
        return result['level'], result['percent']
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}", exc_info=True)
        return "Error", 0

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=['video', 'realtime'], required=True)
    parser.add_argument('--input', help='Path to input video')
    parser.add_argument('--output', help='Path to output video')
    args = parser.parse_args()
    
    if args.mode == 'video' and not args.input:
        logger.error("Input video required for video mode")
        print("Error: Input video required")
        exit(1)
        
    level, percent = analyze_source(
        source=args.input if args.mode == 'video' else 0,
        is_video_file=args.mode == 'video',
        output_file=args.output
    )
    
    print(f"Fatigue Level: {level}")
    print(f"Fatigue Percentage: {percent}%")
