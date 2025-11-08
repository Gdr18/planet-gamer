from flask import Blueprint, request

from ..utils.instantiations import ma, db
from ..models.game_model import Game


class GameSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "date",
            "title",
            "description",
            "platform",
            "platform_url",
            "gender",
            "pegi",
            "release",
            "price",
            "img",
            "stock",
        )


game_schema = GameSchema()
games_schema = GameSchema(many=True)

game = Blueprint("game", __name__)


@game.route("/games", methods=["POST", "GET"])
def select_games():
    if request.method == "POST":
        for game in request.json:
            title = game["title"]
            description = game["description"]
            platform = game["platform"]
            gender = game["gender"]
            pegi = game["pegi"]
            release = game["release"]
            price = game["price"]
            img = game["img"]
            stock = game.get("stock", 100)

            new_game = Game(
                title,
                description,
                platform,
                gender,
                pegi,
                release,
                price,
                img,
                stock
            )

            db.session.add(new_game)
            db.session.commit()

        games = Game.query.all()

        return games_schema.jsonify(games)

    if request.method == "GET":
        all_games = Game.query.all()
        return games_schema.jsonify(all_games)


@game.route("/game", methods=["POST"])
def post_game():
    title = request.json["title"]
    description = request.json["description"]
    platform = request.json["platform"]
    gender = request.json["gender"]
    pegi = request.json["pegi"]
    release = request.json["release"]
    price = request.json["price"]
    img = request.json["img"]
    stock = request.json.get("stock", 100)

    new_game = Game(
        title, description, platform, gender, pegi, release, price, img, stock
    )

    db.session.add(new_game)
    db.session.commit()

    game = Game.query.get(new_game.id)

    return game_schema.jsonify(game)


@game.route("/game/<id>", methods=["GET", "PUT", "DELETE"])
def select_game(id):
    if request.method == "GET":
        game = Game.query.get(id)

        return game_schema.jsonify(game)

    if request.method == "PUT":
        game = Game.query.get(id)
        title = request.json["title"]
        description = request.json["description"]
        gender = request.json["gender"]
        platform = request.json["platform"]
        platform_url = request.json["platformUrl"]
        pegi = request.json["pegi"]
        release = request.json["release"]
        price = request.json["price"]
        img = request.json["img"]

        game.title = title
        game.description = description
        game.gender = gender
        game.platform = platform
        game.platform_url = platform_url
        game.pegi = pegi
        game.release = release
        game.price = price
        game.img = img

        db.session.commit()
        return game_schema.jsonify(game)

    if request.method == "DELETE":
        game = Game.query.get(id)
        db.session.delete(game)
        db.session.commit()

        return f"The game {id} was successfully deleted"
