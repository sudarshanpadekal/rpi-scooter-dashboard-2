class CameraManager:

    def __init__(self):
        self.status = "ONLINE"

    def get_status(self):
        return {
            "camera_status": self.status
        }

camera_manager = CameraManager()