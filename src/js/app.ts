import '../scss/app.scss';
import MotionDetector from './motion';

window.onload = () => {
  const motionDetector = new MotionDetector();
  motionDetector.init();
}
