import random

class PotholeDetector:

    def __init__(self):
        self.alert = False

    def detect(self):

        chance = random.randint(1, 15)

        self.alert = (chance == 1)

        return self.alert

pothole_detector = PotholeDetector()