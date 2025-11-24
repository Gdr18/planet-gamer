from config import CONFIG
from src import create_app

app = create_app(CONFIG)

if __name__ == "__main__":
	app.run(port=app.config.get("PORT"))
