class NonSenseTypeError(Exception):
    def __init__(self, message='Please calculate it by yourself.'):
        self.message = message
