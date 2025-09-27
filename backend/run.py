from src import create_app
from config import config, PORT

app = create_app(config)

if __name__ == "__main__":
    app.run(port=PORT)
