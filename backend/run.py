from src import create_app
from config import CONFIG, PORT

app = create_app(CONFIG)

if __name__ == "__main__":
    app.run(port=PORT)
