from routes.groups import groups_bp
from routes.analyze import analyze_bp
from routes.universities import universities_bp

def register_blueprints(app):
    app.register_blueprint(groups_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(universities_bp)
