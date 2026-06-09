import random

class GPSManager:

    def __init__(self):
        self.latitude = 12.9716
        self.longitude = 77.5946
        self.speed = 0

    def update(self):
        self.latitude += random.uniform(-0.0001, 0.0001)
        self.longitude += random.uniform(-0.0001, 0.0001)
        self.speed = random.randint(20, 60)

    def get_data(self):
        self.update()

        return {
            "lat": self.latitude,
            "lng": self.longitude,
            "speed": self.speed
        }

gps_manager = GPSManager()