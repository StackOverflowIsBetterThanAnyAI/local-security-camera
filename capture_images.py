import os
import re

from folder_data import IMAGE_FOLDER_LOCATION

from picamzero import Camera
from datetime import datetime
from time import sleep

REGEX = re.compile(r'^security_image_\d{4}-\d{2}-\d{2}_\d{2}:\d{2}:\d{2}\.jpg$')

def capture_images():
        cam = Camera()
        cam.still_size = (1920, 1080)

        if not os.path.exists(IMAGE_FOLDER_LOCATION):
                os.makedirs(IMAGE_FOLDER_LOCATION)

        try:
                while True:
                        image_files = sorted([f for f in os.listdir(IMAGE_FOLDER_LOCATION) if REGEX.match(f)])

                        if len(image_files) >= 576:
                                os.remove(os.path.join(IMAGE_FOLDER_LOCATION, image_files[0]))

                        current_time = datetime.now().strftime('%Y-%m-%d_%H:%M:%S')
                        filename = f'{IMAGE_FOLDER_LOCATION}/security_image_{current_time}.jpg'

                        cam.annotate(current_time)
                        cam.capture_image(filename)

                        print(f'Image captured: {filename}.')
                        print(f'{576-len(image_files)} free image slots available.')
                        sleep(300)

        except KeyboardInterrupt:
                print('Capturing images has been stopped.')

        finally:
                del cam

if __name__ == '__main__':
        capture_images()
