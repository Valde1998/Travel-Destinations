from flask import Flask, request, jsonify

@app.route("/destinations", methods=["GET"])
def get_destinations():
    destinations = Destination.query.all()
    return jsonify([
        {
            "id": d.id,
            "title": d.title,
            "country": d.country,
            "description": d.description,
            "date_from": d.date_from,
            "date_to": d.date_to
        } for d in destinations
    ])

@app.route("/destinations", methods=["POST"])
def create_destination():
    data = request.json

    if not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    new_destination = Destination(
        title=data["title"],
        country=data.get("country"),
        description=data.get("description"),
        date_from=data.get("date_from"),
        date_to=data.get("date_to")
    )

    db.session.add(new_destination)
    db.session.commit()

    return jsonify({"message": "Destination created"}), 201

@app.route("/destinations/<int:id>", methods=["PUT"])
def update_destination(id):
    destination = Destination.query.get_or_404(id)
    data = request.json

    destination.title = data.get("title", destination.title)
    destination.country = data.get("country", destination.country)
    destination.description = data.get("description", destination.description)
    destination.date_from = data.get("date_from", destination.date_from)
    destination.date_to = data.get("date_to", destination.date_to)

    db.session.commit()
    return jsonify({"message": "Updated"})

@app.route("/destinations/<int:id>", methods=["DELETE"])
def delete_destination(id):
    destination = Destination.query.get_or_404(id)
    db.session.delete(destination)
    db.session.commit()
    return jsonify({"message": "Deleted"})

# ---------------- AUTH ----------------

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode('utf-8')

    new_user = User(username=data["username"], password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()

    if user and bcrypt.check_password_hash(user.password, data["password"]):
        return jsonify({"message": "Login successful"})

    return jsonify({"error": "Invalid credentials"}), 401

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)