import threading
import subprocess

def run_script(script_name):
        process = subprocess.Popen(['python3', script_name])
        return process

def main():
        try:
                capture_image_process = run_script('capture_images.py')
                start_webserver_process = run_script('start_webserver.py')

                capture_image_process.wait()
                start_webserver_process.wait()

        except:
                print('The main script was terminated by the user.')
                capture_image_process.terminate()
                start_webserver_process.terminate()

if __name__ == '__main__':
        main()
